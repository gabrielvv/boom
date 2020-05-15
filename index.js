const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const redis = require('redis');
const debug = require('debug')('boom');
const {
  port, redis: redisConfig, rateLimit: { windowMs }, origin,
} = require('config');
const router = require('./router');

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
  origin,
}));
app.use(helmet());

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs,
  max: 10,
  draft_polli_ratelimit_headers: true,
});

app.use(limiter);
app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

app.use('/api', router.api);
app.use('/form', router.form);

if (require.main === module) {
  app.listen(port, () => debug(`listening on port ${port}`));
}

module.exports = {
  app,
  redisClient,
};
