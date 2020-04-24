const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {
  checkSchema,
} = require('express-validator');
const uuid = require('uuid');
const redis = require('redis');
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

app.post('/form/:formId/storage/:provider', (req, res) => storageProviders[req.params.provider].createPresignedPost(req, res));

app.get('/form/:formId/storage/:provider', (req, res) => storageProviders[req.params.provider].createPresignedGet(req, res));

app.get('/', (req, res) => {
  res.render('index', { title: 'Hey', message: 'Hello there!' });
});

if (require.main === module) {
  app.listen(port, () => console.log(`listening on port ${port}`));
}

module.exports = {
  app,
  redisClient,
};
