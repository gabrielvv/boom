const S3 = require('aws-sdk/clients/s3');
const { storage: { s3: s3Config } } = require('config');
const _ = require('lodash');
const assert = require('assert');
const debug = require('debug')('boom:storage:s3');

const s3 = new S3({ region: 'eu-west-3' });

const createPresignedPost = (req, res) => {
  debug('createPresignedPost');
  const requestBody = req.body;
  const callback = (error, body) => {
    debug(`s3.createPresignedPost data=${JSON.stringify(body)}`);
    assert(!error);
    res.json({
      ...body,
      AWS_BUCKET: s3Config.bucket,
      data: {
        ..._.omit(body.fields, ['key', 'filename']),
      },
    });
  };
  return s3.createPresignedPost({
    Bucket: s3Config.bucket,
    Fields: {
      key: requestBody.name,
      fileName: requestBody.name,
    },
    conditions: [
      { acl: 'private' },
      { success_action_status: '201' },
      ['starts-with', '$key', ''],
      ['content-length-range', 0, 100000],
      { 'x-amz-algorithm': 'AWS4-HMAC-SHA256' },
    ],
  }, callback);
};

const createPresignedGet = (req, res) => {
  debug('createPresignedGet');
  return s3.getSignedUrlPromise('getObject', {
    Bucket: req.query.AWS_BUCKET,
    Key: req.query.key,
  })
    .then((url) => res.json({
      url,
    }));
};

module.exports = {
  createPresignedPost,
  createPresignedGet,
};
