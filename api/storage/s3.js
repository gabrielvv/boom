const S3 = require('aws-sdk/clients/s3');
const { storage: { s3: s3Config } } = require('config');
const _ = require('lodash');
const assert = require('assert');
const debug = require('debug')('boom:storage:s3');

const s3 = new S3({ region: 'eu-west-3' });

const createPresignedPost = (req, res) => {
  debug('createPresignedPost');

  const requestBody = req.body;

  // see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createPresignedPost-property
  return s3.createPresignedPost({
    Bucket: s3Config.bucket,
    Expires: 3600,
    Fields: {
      key: requestBody.name,
      // extract filename from s3 object path
      fileName: requestBody.name.split('/').pop(),
    },
    conditions: [
      { acl: 'private' },
      { success_action_status: '201' },
      ['starts-with', '$key', ''],
      ['content-length-range', 0, 100000],
      { 'x-amz-algorithm': 'AWS4-HMAC-SHA256' },
    ],
  }, (error, body) => {
    debug(`s3.createPresignedPost data=${JSON.stringify(body)}`);
    assert(!error);
    res.json({
      ...body,
      bucket: s3Config.bucket,
      data: {
        ..._.omit(body.fields, ['key', 'filename']),
      },
    });
  });
};

const createPresignedGet = (req, res) => {
  debug('createPresignedGet');
  // see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property
  return s3.getSignedUrlPromise('getObject', {
    Bucket: req.query.bucket,
    Key: req.query.key,
    Expires: 60,
  })
    .then((url) => res.json({
      url,
    }));
};

module.exports = {
  createPresignedPost,
  createPresignedGet,
};
