from s3 import upload_file, create_presigned_url
from os import listdir, path
import threading
from zipfile import ZipFile, ZIP_DEFLATED
from config import Config


def upload(task_id, bucket, input_object_name, job_dir_name):
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
    with ZipFile(
        f'{output_dir_name}/multitrack.zip', 'w',
        ZIP_DEFLATED
    ) as zipObj:
        for output_file_name in listdir(output_dir_name):
            if 'zip' in output_file_name:
                continue
            local_path = path.join(output_dir_name, output_file_name)
            zipObj.write(local_path, output_file_name)

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

    return object_list
