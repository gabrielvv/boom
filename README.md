# BOOM

![Boom CI](https://github.com/gabrielvv/boom/workflows/Boom%20CI/badge.svg)

## Heroku

```sh
npm i -g heroku
heroku login
heroku create
heroku addons:create heroku-redis:hobby-dev -a <app-name>
```

## S3

https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html

### Set/Get lifecycle w/ cli

https://docs.aws.amazon.com/AmazonS3/latest/dev/set-lifecycle-cli.html

```sh
aws s3api put-bucket-lifecycle-configuration --bucket $BUCKET --lifecycle-configuration file://config/aws/s3-object-lifecycle.json
```

## Notes

Expiration:
- redis key
- s3 object
- s3 presigned url

La source de vérité est redis.
Si l'objet dans redis n'existe pas, on ne doit pas pouvoir accéder aux ressources sur s3.
