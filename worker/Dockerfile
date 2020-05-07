# see https://github.com/deezer/spleeter/wiki/2.-Getting-started#using-docker-image
# see https://github.com/deezer/spleeter/blob/master/docker/python-3.7.dockerfile
# For more information, please refer to https://aka.ms/vscode-docker-python
FROM python:3.7

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE 1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED 1

# Install pip requirements
ADD requirements.txt .
RUN python -m pip install -r requirements.txt

# Install dependencies
RUN apt-get update && apt-get install -y libsndfile1 ffmpeg

WORKDIR /app
ADD . /app

# Switching to a non-root user, please refer to https://aka.ms/vscode-docker-python-user-rights
# RUN useradd appuser && chown -R appuser /app
# RUN chown -R appuser /usr/local/lib/python3.7
# USER appuser

ENV REDIS_HOST redis
ENV REDIS_PORT 6379
ENV REDIS_QUEUE "queue:split"
ENV BUCKET_NAME "poom-poom-tchak"
ENV AWS_ACCESS_KEY_ID aws_access_key_id
ENV AWS_SECRET_ACCESS_KEY aws_secret_access_key
ENV MAIL_API_KEY mail_api_key
ENV MAIL_API_SECRET mail_api_secret
ENV MAIL_SENDER_ADDRESS poom-poom-tchak@protonmail.com
ENV MAIL_SENDER_NAME Boom
ENV FRONT_BASE_URL http://localhost:8080
ENV UPLOAD=1

VOLUME /tmp
VOLUME /pretrained_models

CMD ["python", "worker.py"]
