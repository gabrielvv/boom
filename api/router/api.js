
const {
  checkSchema,
} = require('express-validator');
const router = require('express').Router();
const {
  redis: redisConfig,
  rateLimit: { windowMs },
  storage: { accept },
} = require('config');
const uuid = require('uuid');
const rateLimit = require('express-rate-limit');
const _ = require('lodash');
const debug = require('debug')('boom:api');
const { postSchema, handleValidationError } = require('../lib/validation');
const { getStatusUrl } = require('../lib/utils');

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
  req.redisClient.rpush(getRedisQueue(model), JSON.stringify(payload), (length) => {
    req.redisClient.setex(jobId, redisConfig.expiration, JSON.stringify({
      status: 'queueing',
      pos: length - 1,
    }));
  });

  res.send(payload);
};

const splitLimiter = rateLimit({
  windowMs,
  max: 10,
  draft_polli_ratelimit_headers: true,
  keyGenerator(req) {
    return req.body.email;
  },
});


router.post('/split', splitLimiter, checkSchema(postSchema), handleValidationError(), splitHandler(
  (req) => ({ ...req.body }),
));

const extractWaveformData = (obj, waveformName) => JSON.parse(obj.waveforms[waveformName]).data;
const fileRegex = new RegExp(`/(\\w+\\.(${accept.join('|')}))\\?`);

router.get('/split/:id', (req, res) => {
  req.redisClient.get(req.params.id, (error, dataStr) => {
    const dataObj = JSON.parse(dataStr);
    // debug(dataObj);

    if (error) {
      return res.status(404).send(error);
    }

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
        const match = objectUrl.match(fileRegex);
        debug(objectUrl, fileRegex, match);

        if (!match || match.length < 2) {
          // TODO handle error
          console.error(`no match for regex ${fileRegex}`);
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

module.exports = router;
