const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {
  checkSchema,
} = require('express-validator');
const uuid = require('uuid');
const redis = require('redis');
const _ = require('lodash');
const debug = require('debug')('boom');
const { port, redis: redisConfig } = require('config');
const { postSchema, getSchema, handleError } = require('./validation');
const { getStatusUrl } = require('./utils');

const storageProviders = {
  // eslint-disable-next-line global-require
  s3: require('./storage/s3'),
};

const redisClient = redisConfig.url
  ? redis.createClient(redisConfig.url)
  : redis.createClient(redisConfig.port, redisConfig.host);

redisClient.on('error', (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
});

const app = express();
// see https://github.com/expressjs/body-parser#bodyparserjsonoptions
app.use(bodyParser({
  limit: '50kb',
}));
app.use(cors({
  origin: '*',
}));

const getRedisQueue = (model) => `${redisConfig.queueName}:${model}`;

const splitHandler = (extractPayloadFn) => (req, res) => {
  const jobId = uuid.v4();
  const { file, model, email } = extractPayloadFn(req);
  const payload = {
    id: jobId,
    email,
    file,
    model,
    status: getStatusUrl(req, jobId),
  };
  redisClient.rpush(getRedisQueue(model), JSON.stringify(payload), (length) => {
    redisClient.setex(jobId, redisConfig.expiration, JSON.stringify({
      status: 'queueing',
      pos: length - 1,
    }));
  });

  res.send(payload);
};

app.post('/api/split', checkSchema(postSchema), handleError(), splitHandler(
  (req) => ({ ...req.body }),
));

app.get('/api/split', checkSchema(getSchema), handleError(), splitHandler(
  (req) => ({ ...req.query }),
));

app.post('/form/:formId/storage/:provider', (req, res) => storageProviders[req.params.provider].createPresignedPost(req, res));

app.get('/form/:formId/storage/:provider', (req, res) => storageProviders[req.params.provider].createPresignedGet(req, res));

const extractWaveformData = (obj, waveformName) => JSON.parse(obj.waveforms[waveformName]).data;

app.get('/api/result/:id', (req, res) => {
  redisClient.get(req.params.id, (error, dataStr) => {
    const dataObj = JSON.parse(dataStr);

    if (!dataObj) {
      return res.sendStatus(404);
    }

    if (dataObj.status !== 'done') {
      return res.json(dataObj);
    }

    const findZip = (url) => url.includes('zip');
    const findJson = (url) => url.includes('json');
    const zip = _.find(dataObj.object_list, findZip);
    const objectList = _.chain(dataObj.object_list)
      .filter(_.negate(findZip))
      .filter(_.negate(findJson))
      .map((objectUrl) => {
        const match = objectUrl.match(/\/(\w+\.(wav|mp3))\?/);
        if (!match || match.length < 2) {
          // TODO handle error
        }

        const name = match[1];
        const waveform = extractWaveformData(dataObj, name);

        return {
          url: objectUrl,
          name,
          waveform,
        };
      })
      .value();

    return res.json({
      status: dataObj.status,
      objectList,
      zip,
    });
  });
});

if (require.main === module) {
  app.listen(port, () => debug(`listening on port ${port}`));
}

module.exports = {
  app,
  redisClient,
};
