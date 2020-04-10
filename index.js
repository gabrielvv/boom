const express = require('express');
const bodyParser = require('body-parser');
const {
  checkSchema,
} = require('express-validator');
const uuid = require('uuid');
const redis = require('redis');
const { port, redis: redisConfig } = require('config');
const { postSchema, getSchema, handleError } = require('./validation');
const { getStatusUrl } = require('./utils');

const redisClient = redisConfig.url
  ? redis.createClient(redisConfig.url)
  : redis.createClient(redisConfig.port, redisConfig.host);

redisClient.on('error', (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
});

const app = express();
app.use(bodyParser());

const splitHandler = (extractPayloadFn) => (req, res) => {
  const jobId = uuid.v4();
  const { file, model } = extractPayloadFn(req);
  const payload = {
    id: jobId,
    file,
    model,
    status: getStatusUrl(req, jobId),
  };
  redisClient.rpush(redisConfig.queueName, JSON.stringify(payload));
  res.send(payload);
};

app.post('/api/split', checkSchema(postSchema), handleError(), splitHandler(
  (req) => ({ file: req.body.file, model: req.body.model }),
));

app.get('/api/split', checkSchema(getSchema), handleError(), splitHandler(
  (req) => ({ file: req.query.file, model: req.query.model }),
));

if (require.main === module) {
  app.listen(port, () => console.log(`listening on port ${port}`));
}

module.exports = {
  app,
  redisClient,
};
