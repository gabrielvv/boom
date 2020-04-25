from os import environ


class Config():
    REDIS_URL = environ.get('REDIS_URL')
    REDIS_HOST = environ.get('REDIS_HOST')
    REDIS_PORT = environ.get('REDIS_PORT')
    REDIS_QUEUE = environ.get('REDIS_QUEUE')
    REDIS_RETRY_QUEUE = environ.get('REDIS_QUEUE') + ':retry'
    BUCKET_NAME = environ.get('BUCKET_NAME')
    AWS_ACCESS_KEY = environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_KEY = environ.get('AWS_SECRET_ACCESS_KEY')
    DOWNLOAD_FOLDER = 'downloads'
    MAIL_API_KEY = environ.get('MAIL_API_KEY')
    MAIL_API_SECRET = environ.get('MAIL_API_SECRET')
    MAIL_SENDER = environ.get('MAIL_SENDER')
