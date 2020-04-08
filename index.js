const express = require('express');
const {
  checkSchema,
} = require('express-validator');
const uuid = require('uuid');
const redis = require('redis');
const { baseUrl, port, redis: redisConfig } = require('config');
const { post: postSchema, handleError } = require('./validation');
const { getStatusUrl } = require('./utils');

const redisClient = redis.createClient(redisConfig.port, redisConfig.host);

redisClient.on('error', (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
});

const app = express();

app.post('/', checkSchema(postSchema), handleError(), (req, res) => {
  const id = uuid.v4();
  const { file, model } = req.query;
  const payload = {
    id,
    file,
    model,
    status: getStatusUrl(baseUrl, port, id),
  };
  redisClient.rpush(redisConfig.queueName, JSON.stringify(payload));
  res.send(payload);
});

if (require.main === module) {
  app.listen(port, () => console.log(`listening on port ${port}`));
}

module.exports = {
  app,
  redisClient,
};
