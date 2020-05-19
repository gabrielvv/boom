const router = require('express').Router();

const storageProviders = {
  // eslint-disable-next-line global-require
  s3: require('../lib/storage/s3'),
};

router.post('/:formId/storage/:provider', (req, res) => storageProviders[req.params.provider].createPresignedPost(req, res));

router.get('/:formId/storage/:provider', (req, res) => storageProviders[req.params.provider].createPresignedGet(req, res));

module.exports = router;
