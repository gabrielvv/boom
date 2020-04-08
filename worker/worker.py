import redis
from os import environ, listdir, path
from spleeter.separator import Separator
import json
from s3 import upload_file

QUIT = True
bucket_name = environ.get('BUCKET_NAME')
redis_queue = environ.get('REDIS_QUEUE')
r = redis.Redis(host=environ.get('REDIS_HOST'), port=environ.get('PORT'), db=0)

while not QUIT:
  serialized_descriptor = r.blpop([redis_queue], 30)

  if not serialized_descriptor:
    continue

  descriptor = json.loads(serialized_descriptor)
  # TODO: validation / sanitization
  separator = Separator('spleeter:' + descriptor.model)
  task_id = descriptor['id']
  dir_name = task_id
  separator.separate_to_file(descriptor['file'], dir_name)

  # TODO: load files to s3
  for file_name in listdir(dir_name):
    with open(path.join(dir_name, file_name), "rb") as f:
      # TODO progress callback
      upload_file(f, bucket_name)

    r.set(task_id, json.dumps({
      'status': 'done',
      'directory': 's3_signed_url'
    }))


