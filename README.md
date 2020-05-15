# BOOM

![Boom CI](https://github.com/gabrielvv/boom/workflows/Boom%20CI/badge.svg)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=gabrielvv/boom)](https://dependabot.com)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/gabrielvv/boom.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/gabrielvv/boom/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/gabrielvv/boom.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/gabrielvv/boom/context:javascript)
[![Language grade: Python](https://img.shields.io/lgtm/grade/python/g/gabrielvv/boom.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/gabrielvv/boom/context:python)
[![CodeFactor](https://www.codefactor.io/repository/github/gabrielvv/boom/badge)](https://www.codefactor.io/repository/github/gabrielvv/boom)

## Heroku

```sh
npm i -g heroku
heroku login
heroku create
heroku addons:create heroku-redis:hobby-dev -a <app-name>

# set env var
heroku config:set AWS_BUCKET=$BUCKET
heroku config:set ALLOWED_DOMAIN=$DOMAIN
```

## Docker

```sh
# Update docker image in docker hub
sudo docker build -t gabrielvv/boom-worker:latest ./worker
sudo docker push gabrielvv/boom-worker
```

## AWS

### IAM

3 users:
- boom-app: interact w/ s3
- boom-ci: deploy on ECS
- boom-admin: for administrative tasks via the cli or the console

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
LOGS_GROUP=/ecs/boom-worker
aws logs create-log-group --log-group-name $LOGS_GROUP --profile $PROFILE

# register task
REDIS_QUEUE=queue:split:2stems
TASK_DEF=$(
  sed -e "s#\$SECRET_ARN#$SECRET_ARN#" \
      -e "s#\$AWS_REGION#$AWS_REGION#" \
      -e "s#\$LOGS_GROUP#$LOGS_GROUP#" \
      -e "s#\$REDIS_QUEUE#$REDIS_QUEUE#" \
      config/aws/task-definition.json
);
TASK_DEF_ARN=$(aws ecs register-task-definition --cli-input-json $TASK_DEF | jq -r '.taskDefinition.taskDefinitionArn');
# register service
SERVICE_DEF=$(sed "s#\$TASK_DEF_ARN#$TASK_DEF_ARN#" config/aws/service-definition.json);
aws ecs create-service --cli-input-json $SERVICE_DEF > .aws/service.json;

# restart service
aws ecs update-service --service $SERVICE_NAME --force-new-deployment
# update service task definition
aws ecs update-service --service $SERVICE_NAME --task-definition $TASK:$REVISION --force-new-deployment

# delete service
SERVICE_NAME=boom-service
aws ecs update-service --service $SERVICE_NAME --desired-count 0
aws ecs delete-service --service $SERVICE_NAME
# delete task (each revision must be deleted)
TASK_NAME=boom-worker
for REVISION in {1..19};
do aws ecs deregister-task-definition --task-definition $TASK_NAME:$REVISION;
done

# dere
```

## Notes

Expiration:
- redis key
- s3 object
- s3 presigned url

La source de vérité est redis.
Si l'objet dans redis n'existe pas, on ne doit pas pouvoir accéder aux ressources sur s3.
