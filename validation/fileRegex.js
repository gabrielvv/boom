/* eslint-disable no-useless-escape */
const {
  storage: {
    accept,
    s3: s3Config,
  },
} = require('config');

const uuidRegex = '{1,60}[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

module.exports = new RegExp(`^${s3Config.uploadDir}\/.${uuidRegex}\.(${accept.join('|')})$`);
