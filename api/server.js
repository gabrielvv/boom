const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const cors = require('cors');
const redis = require('redis');
const debug = require('debug')('boom');
const {
  cors: { origin },
  port,
  redis: redisConfig,
  rateLimit: { windowMs },
  auth: authConfig
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

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.issuer}/.well-known/jwks.json`
  }),
  audience: authConfig.audience,
  issuer: `https://${authConfig.issuer}/`,
  algorithms: ['RS256']
});

app.use('/api', jwtCheck, router.api);
app.use('/form', jwtCheck, router.form);

if (require.main === module) {
  app.listen(port, () => debug(`listening on port ${port}`));
}

module.exports = {
  app,
  redisClient,
};
