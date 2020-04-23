import logging
import disable_tensorflow_warning
import redis
from os import listdir, path
import json
from s3 import upload_file, create_presigned_url
from separate import separate
from config import Config

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


def job(options):
    logging.info('job with options=%s', options)

    task_id = options.get('id')
    dir_name = path.join('tmp', task_id)
    input_file_url = options.get('file')
    model = options.get('model')

    if not input_file_url:
        logging.warn('No file provided')
        return False

    # TODO get s3 signed url
    # https://bucket.s3.region.amazonaws.com/f/g/h => f/g/h
    input_object_name = input_file_url.split('/', 3)[-1]
    s3_signed_url = create_presigned_url(bucket, input_object_name)

    separate(
        s3_signed_url,
        # TODO save directly in s3
        dir_name,
        model
    )

    input_file_name = input_object_name.split('/')[-1].split('.')[0]
    output_dir_name = path.join(dir_name, input_file_name)
    output_s3_dir_name = '/'.join((
        'result',
        task_id,
        input_file_name
    ))

    # TODO: load files to s3
    for output_file_name in listdir(output_dir_name):
        object_name = '/'.join((
            output_s3_dir_name,
            output_file_name
        ))
        complete_path = path.join(output_dir_name, output_file_name)

        # TODO progress callback
        upload_file(complete_path, bucket, object_name)

        # Store task status and file locations for mailing queue
        r.set(task_id, json.dumps({
            'status': 'done',
            'location': output_s3_dir_name
        }))


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
        # except:
        #     print("Unexpected error:", sys.exc_info()[0])
        #     r.rpush(redis_retry_queue, json.dumps(payload))
