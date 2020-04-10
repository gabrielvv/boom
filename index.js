const express = require('express');
const {
  checkSchema,
} = require('express-validator');
const uuid = require('uuid');
const redis = require('redis');
const { port, redis: redisConfig } = require('config');
const { post: postSchema, handleError } = require('./validation');
const { getStatusUrl } = require('./utils');

const redisClient = redisConfig.url
  ? redis.createClient(redisConfig.url)
  : redis.createClient(redisConfig.port, redisConfig.host);

redisClient.on('error', (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
});

const app = express();

app.post('/', checkSchema(postSchema), handleError(), (req, res) => {
  const jobId = uuid.v4();
  const { file, model } = req.query;
  const payload = {
    id: jobId,
    file,
    model,
    status: getStatusUrl(req, jobId),
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
