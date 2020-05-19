const {
  auth: authConfig
} = require('config');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

module.exports = jwt({
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
