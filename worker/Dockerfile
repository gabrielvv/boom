# For more information, please refer to https://aka.ms/vscode-docker-python
FROM python:3.8

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE 1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED 1

# Install pip requirements
ADD requirements.txt .
RUN python -m pip install -r requirements.txt

WORKDIR /app
ADD . /app

# Switching to a non-root user, please refer to https://aka.ms/vscode-docker-python-user-rights
RUN useradd appuser && chown -R appuser /app
USER appuser

ENV REDIS_HOST redis
ENV REDIS_PORT 6379
ENV REDIS_QUEUE "queue:split"
ENV BUCKET_NAME "poom-poom-tchak"
ENV AWS_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY
ENV MAIL_API_KEY
ENV MAIL_API_SECRET
ENV MAIL_SENDER_ADDRESS poom-poom-tchak@protonmail.com
ENV MAIL_SENDER_NAME Boom
ENV FRONT_BASE_URL http://localhost:3000


# During debugging, this entry point will be overridden. For more information, please refer to https://aka.ms/vscode-docker-python-debug
CMD ["python", "worker.py"]
