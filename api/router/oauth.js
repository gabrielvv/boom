const router = require('express').Router();
const axios = require('axios').default;
const {
  checkSchema,
} = require('express-validator');
const {
  auth: {
    issuer,
    audience,
  },
} = require('config');
const _ = require('lodash');
const { tokenPostSchema, handleValidationError } = require('../lib/validation');

router.post('/token', checkSchema(tokenPostSchema), handleValidationError(), (req, res) => {
  axios.post(`https://${issuer}/oauth/token`, {
    ..._.pick(req.body, ['client_id', 'client_secret']),
    audience,
    grant_type: 'client_credentials',
  })
    .then(({ data }) => {
      res.send(data);
    })
    .catch(() => res.sendStatus(500));
});

module.exports = router;
