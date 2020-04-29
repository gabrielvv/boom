import logging
import disable_tensorflow_warning
import redis
from os import listdir, path
import json
from s3 import upload_file, create_presigned_url
from separate import separate
from config import Config
import shutil
from send_email import send_email
import threading
from zipfile import ZipFile

if not Config.BUCKET_NAME:
    raise Exception('BUCKET_NAME not found')
if not Config.REDIS_QUEUE:
    raise Exception('REDIS_QUEUE not found')

QUIT = False
bucket = Config.BUCKET_NAME
redis_queue = Config.REDIS_QUEUE
redis_retry_queue = Config.REDIS_RETRY_QUEUE
logging.basicConfig(level=logging.INFO)

logging.info('REDIS_HOST=%s', Config.REDIS_HOST)
if Config.REDIS_URL:
    r = redis.Redis.from_url(Config.REDIS_URL)
else:
    r = redis.Redis(host=Config.REDIS_HOST,
                    port=Config.REDIS_PORT, db=0)


def delete_directory(dir_path):
    if not dir_path:
        raise Exception('dir_path is empty')

    try:
        shutil.rmtree(dir_path)
    except OSError as e:
        print("Error: %s : %s" % (dir_path, e.strerror))


def job(options):
    logging.info('job with options=%s', options)

    task_id = options.get('id')
    job_dir_name = path.join('tmp', task_id)
    input_object_name = options.get('file')
    model = options.get('model')
    email = options.get('email')

    if not input_object_name:
        logging.warn('No file provided')
        return False

    if not email:
        logging.warn('Invalid email')
        return False

    s3_signed_url = create_presigned_url(bucket, input_object_name, 60)

    separate(
        s3_signed_url,
        # TODO save directly in s3
        job_dir_name,
        model
    )

    input_file_name = input_object_name.split('/')[-1].split('.')[0]
    output_dir_name = path.join(job_dir_name, input_file_name)
    output_s3_dir_name = '/'.join((
        'result',
        task_id,
        input_file_name
    ))

    object_list = []
    thread_list = []

    # version compressée
    with ZipFile(f'{output_dir_name}/multitrack.zip', 'w') as zipObj:
        for output_file_name in listdir(output_dir_name):
            local_path = path.join(output_dir_name, output_file_name)
            zipObj.write(local_path)

    # TODO: another queue/worker for this job ??
    for output_file_name in listdir(output_dir_name):
        object_name = '/'.join((
            output_s3_dir_name,
            output_file_name
        ))
        local_path = path.join(output_dir_name, output_file_name)

        # TODO progress callback
        # see http://ls.pwd.io/2013/06/parallel-s3-uploads-using-boto-and-threads-in-python/
        t = threading.Thread(target=upload_file, args=(
            local_path, bucket, object_name))
        thread_list.append(t)
        object_list.append(
            create_presigned_url(bucket, object_name, Config.EXPIRATION)
        )

    for t in thread_list:
        t.start()
    for t in thread_list:
        t.join()

    delete_directory(job_dir_name)

    # Store task status and file locations for mailing queue
    r.setex(task_id, Config.EXPIRATION, json.dumps({
        'status': 'done',
        'object_list': object_list
    }))

    try:
        send_email(email, f'{Config.FRONT_BASE_URL}/result/{task_id}')
    except Exception as e:
        logging.error('Unable to send mail')
        logging.error(e)


if __name__ == "__main__":
    while not QUIT:
        serialized_payload = r.blpop([redis_queue], 30)
        logging.info('serialized_payload=%s', serialized_payload)

        if not serialized_payload:
            continue

        payload = json.loads(serialized_payload[1])
        # TODO: payload validation / sanitization
        # try:
        job(payload)
        # except Exception as e:
        #     print("Unexpected error:", sys.exc_info()[0])
        #     r.rpush(redis_retry_queue, json.dumps(payload))
