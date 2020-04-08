import logging
import boto3
from botocore.exceptions import ClientError
from config import config


s3_client = None


def init_client():
    if s3_client:
        return s3_client

    s3_client = boto3.client(
        's3',
        aws_access_key_id=config.AWS_ACCESS_KEY,
        aws_secret_access_key=config.AWS_SECRET_KEY
    )
    return s3_client


def upload_file(file_name, bucket, object_name=None):
    s3_client = init_client()
    """Upload a file to an S3 bucket  
    see https://boto3.amazonaws.com/v1/documentation/api/latest/guide/s3-uploading-files.html

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
        response = s3_client.upload_file(file_name, bucket, object_name)
    except ClientError as e:
        logging.error(e)
        return False
    return True


def download_file(bucket, object_name, file_name=None):
    s3_client = init_client()
    if not file_name:
        file_name = object_name
    s3_client.download_file(bucket, object_name, file_name)
    return True


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
