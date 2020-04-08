import redis
from os import listdir, path
import json
from s3 import upload_file, download_file
from separate import separate
from config import config

QUIT = True
bucket = config.BUCKET_NAME
redis_queue = config.REDIS_QUEUE
r = redis.Redis(host=config.REDIS_HOST,
                port=config.REDIS_PORT, db=0)


def job(options):
    task_id = options['id']
    dir_name = task_id
    file_name = options['file']
    model = options['model']

    download_file(bucket, file_name)

    separate(file_name, dir_name, model)

    # TODO: load files to s3
    for file_name in listdir(dir_name):
        with open(path.join(dir_name, file_name), "rb") as f:
            # TODO progress callback
            upload_file(f, bucket)

        r.set(task_id, json.dumps({
            'status': 'done',
            'directory': 's3_signed_url'
        }))


if __name__ == "__main__":
    while not QUIT:
        serialized_payload = r.blpop([redis_queue], 30)

        if not serialized_payload:
            continue

        # TODO: validation / sanitization
        job((serialized_payload))
