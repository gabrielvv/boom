# BOOM

![Boom CI](https://github.com/gabrielvv/boom/workflows/Boom%20CI/badge.svg)

## Heroku

```sh
npm i -g heroku
heroku login
heroku create
heroku addons:create heroku-redis:hobby-dev -a <app-name>

# set env var
heroku config:set AWS_BUCKET=$BUCKET
```

## Docker

```sh
# Update docker image in docker hub
sudo docker build -t gabrielvv/boom-worker:latest ./worker
sudo docker push gabrielvv/boom-worker
```

## AWS

### S3

See https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html

```sh
# https://docs.aws.amazon.com/AmazonS3/latest/dev/set-lifecycle-cli.html
aws s3api put-bucket-lifecycle-configuration --bucket $BUCKET --lifecycle-configuration file://config/aws/bucket-lifecycle.json

# cors
aws s3api put-bucket-cors --bucket $BUCKET --profile $PROFILE --cors-configuration file://config/aws/bucket-cors.json
```

### Systems Manager - Parameter Store

```sh
# /!\ Make sure to target the proper REGION
aws ssm put-parameter --name "/boom/$parameter_name" --value $parameter_value --type SecureString --profile $profile
```

### ECS

```sh
aws ecs deregister-task-definition --task-definition $TASK:$REVISION --profile $PROFILE
aws logs create-log-group --log-group-name $LOG_GROUP_NAME --profile $PROFILE

aws ecs register-task-definition --cli-input-json "$(cat config/aws/task-definition.json)"
aws ecs create-service --cli-input-json "$(cat config/aws/service-definition.json)"

# restart service
ecs update-service --force-new-deployment --service $SERVICE
```

## Notes

Expiration:
- redis key
- s3 object
- s3 presigned url

La source de vérité est redis.
Si l'objet dans redis n'existe pas, on ne doit pas pouvoir accéder aux ressources sur s3.
