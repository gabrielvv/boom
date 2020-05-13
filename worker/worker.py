import logging
import signal
import disable_tensorflow_warning
from os import path
from s3 import create_presigned_url
import redis
import json
from split import split
from config import Config
import shutil
from send_email import send_email
from upload import upload
import urllib.parse
from audiowaveform.generate import generate_waveforms


if not Config.BUCKET_NAME:
    raise Exception('BUCKET_NAME not found')
if not Config.REDIS_QUEUE:
    raise Exception('REDIS_QUEUE not found')

QUIT = False
bucket = Config.BUCKET_NAME
redis_queue = Config.REDIS_QUEUE
redis_retry_queue = Config.REDIS_RETRY_QUEUE

logging.basicConfig(level=logging.INFO)
logging.debug(f'redis_queue={redis_queue}')
logging.debug('REDIS_HOST=%s', Config.REDIS_HOST)
logging.debug('REDIS_URL=%s', Config.REDIS_URL)

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

    def save_state(d):
        return r.setex(task_id, Config.EXPIRATION, json.dumps(d))
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

    s3_signed_url = create_presigned_url(bucket, input_object_name)

    save_state({
        'status': 'processing'
    })

    try:
        split(
            s3_signed_url,
            # TODO save directly in s3
            job_dir_name,
            model
        )
    except Exception as e:
        logging.error('Unable to split')
        logging.error(e)
        save_state({
            'status': 'fail',
            'error': str(e)
        })
        return

    save_state({
        'status': 'upload',
        'upload_progress': 0
    })

    input_file_name = input_object_name.split('/')[-1].split('.')[0]
    output_dir_name = path.join(
        job_dir_name, urllib.parse.quote(input_file_name))
    output_s3_dir_name = '/'.join((
        'result',
        task_id,
        input_file_name
    ))
    object_list = {}
    waveforms = {}

    if Config.FLAG_WAVEFORM:
        waveforms = generate_waveforms(output_dir_name)

    if Config.FLAG_UPLOAD:
        object_list = upload(
            bucket, output_s3_dir_name, output_dir_name)

    delete_directory(job_dir_name)

    save_state({
        'status': 'done',
        'object_list': object_list,
        'waveforms': waveforms
    })

    try:
        send_email(email, f'{Config.FRONT_BASE_URL}#result/{task_id}')
    except Exception as e:
        logging.error('Unable to send mail')
        logging.error(e)
        return


class GracefulKiller:
    kill_now = False

    def __init__(self, exit_func=None):
        signal.signal(signal.SIGINT, self.exit_gracefully)
        signal.signal(signal.SIGTERM, self.exit_gracefully)
        self.exit_func = exit_func

    def exit_gracefully(self, signum, frame):
        logging.info('exit_gracefully')
        self.kill_now = True
        if self.exit_func:
            logging.info('exit_func')
            self.exit_func()


if __name__ == "__main__":
    killer = GracefulKiller()
    while (not QUIT) and (not killer.kill_now):
        serialized_payload = r.blpop([redis_queue], 30)
        logging.info('serialized_payload=%s', serialized_payload)

        def my_exit_func():
            r.lpush(redis_queue, serialized_payload[1])
        killer.exit_func = my_exit_func

        if not serialized_payload:
            continue

        payload = json.loads(serialized_payload[1])
        # TODO: payload validation / sanitization
        # try:
        job(payload)
        # except Exception as e:
        #     print("Unexpected error:", sys.exc_info()[0])
        #     r.rpush(redis_retry_queue, json.dumps(payload))
