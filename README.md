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

## S3

See https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html

```sh
# https://docs.aws.amazon.com/AmazonS3/latest/dev/set-lifecycle-cli.html
aws s3api put-bucket-lifecycle-configuration --bucket $BUCKET --lifecycle-configuration file://config/aws/bucket-lifecycle.json

# cors
aws s3api put-bucket-cors --bucket $BUCKET --profile $PROFILE --cors-configuration file://config/aws/bucket-cors.json
```


## Notes

Expiration:
- redis key
- s3 object
- s3 presigned url

La source de vérité est redis.
Si l'objet dans redis n'existe pas, on ne doit pas pouvoir accéder aux ressources sur s3.
