const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {
  checkSchema,
} = require('express-validator');
const uuid = require('uuid');
const redis = require('redis');
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
app.use(bodyParser());
app.use(cors({
  origin: '*',
}));
app.set('view engine', 'pug');
app.use(express.static('public'));

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
  redisClient.rpush(redisConfig.queueName, JSON.stringify(payload));
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

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/result/:id', (req, res) => {
  redisClient.get(req.params.id, (error, data) => {
    if (!data) {
      res.redirect('/');
    }
    const dataObj = JSON.parse(data);

    dataObj.object_list = dataObj.object_list.map((objectUrl) => {
      const match = objectUrl.match(/\/(\w+\.wav)\?/);
      if (!match || match.length < 2) {
        // TODO handle error
      }
      return {
        url: objectUrl,
        name: match[1],
      };
    });

    res.render('result', {
      data: dataObj,
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
