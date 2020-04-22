import logging
import boto3
from botocore.exceptions import ClientError
from config import Config
from os import path


def init_client(_cache={}):
    """
    see http://sametmax.com/memoization-dune-fonction-python/
    """

    if ('s3_client') in _cache:
        return _cache['s3_client']

    s3_client = boto3.client(
        's3',
        aws_access_key_id=Config.AWS_ACCESS_KEY,
        aws_secret_access_key=Config.AWS_SECRET_KEY
    )
    _cache['s3_client'] = s3_client
    return s3_client


def upload_file(file_name, bucket, object_name=None):
    logging.info(
        'upload_file file_name=%s, bucket=%s, object_name=%s',
        file_name, bucket, object_name
    )
    s3_client = init_client()
    """Upload a file to an S3 bucket

    :param file_name: File to upload
    :param bucket: Bucket to upload to
    :param object_name: S3 object name. If not specified then file_name is used
    :return: True if file was uploaded, else False
    """

    # If S3 object_name was not specified, use file_name
    if object_name is None:
        object_name = file_name

    # Upload the file
    try:
        s3_client.upload_file(file_name, bucket, object_name)
    except ClientError as e:
        logging.error(e)
        return False
    return True


def download_file(bucket, object_name, output_file_name=None):
    logging.info(
        'download_file bucket=%s object_name=%s output_file_name=%s',
        bucket, object_name, output_file_name
    )
    s3_client = init_client()
    if not output_file_name:
        output_file_name = path.join(Config.DOWNLOAD_FOLDER, object_name)
    s3_client.download_file(bucket, object_name, output_file_name)
    return output_file_name


def create_presigned_url(bucket_name, object_name, expiration=3600):
    """Generate a presigned URL to share an S3 object

    :param bucket_name: string
    :param object_name: string
    :param expiration: Time in seconds for the presigned URL to remain valid
    :return: Presigned URL as string. If error, returns None.
    """

    # Generate a presigned URL for the S3 object
    s3_client = init_client()
    try:
        response = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': bucket_name,
                'Key': object_name
            },
            ExpiresIn=expiration
        )
    except ClientError as e:
        logging.error(e)
        return None

    # The response contains the presigned URL
    return response
