from os import environ


class Config:
    REDIS_URL = environ.get('REDIS_URL')
    REDIS_HOST = environ.get('REDIS_HOST')
    REDIS_PORT = environ.get('REDIS_PORT')
    REDIS_QUEUE = environ.get('REDIS_QUEUE')
    BUCKET_NAME = environ.get('BUCKET_NAME')
    AWS_ACCESS_KEY = environ.get('AWS_ACCESS_KEY')
    AWS_SECRET_KEY = environ.get('AWS_SECRET_KEY')


config = Config()
