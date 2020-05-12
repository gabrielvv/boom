from os import environ


class Config():
    REDIS_URL = environ.get('REDIS_URL')
    REDIS_HOST = environ.get('REDIS_HOST')
    REDIS_PORT = environ.get('REDIS_PORT')
    REDIS_QUEUE = environ.get('REDIS_QUEUE', 'queue:split')
    REDIS_RETRY_QUEUE = environ.get('REDIS_QUEUE', 'queue:split') + ':retry'
    BUCKET_NAME = environ.get('BUCKET_NAME')
    AWS_ACCESS_KEY = environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_KEY = environ.get('AWS_SECRET_ACCESS_KEY')
    DOWNLOAD_FOLDER = 'downloads'
    MAIL_API_KEY = environ.get('MAIL_API_KEY')
    MAIL_API_SECRET = environ.get('MAIL_API_SECRET')
    MAIL_SENDER_ADDRESS = environ.get('MAIL_SENDER_ADDRESS')
    MAIL_SENDER_NAME = environ.get('MAIL_SENDER_NAME', "Boom !")
    MAIL_TEMPLATE_ID = environ.get('MAIL_TEMPLATE_ID', 1409403)
    FRONT_BASE_URL = environ.get('FRONT_BASE_URL')
    EXPIRATION = 3600 * 24
    FLAG_UPLOAD = int(environ.get('FLAG_UPLOAD', '1'))
    FLAG_WAVEFORM = int(environ.get('FLAG_WAVEFORM', '1'))
