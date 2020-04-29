const models = require('./models');

const inOption = ['query'];

module.exports = {
  email: {
    in: inOption,
    errorMessage: 'Invalid email',
    isEmail: true,
    exists: true,
  },
  file: {
    in: inOption,
    errorMessage: 'Invalid file',
    isURL: false,
    exists: true,
  },
  model: {
    in: inOption,
    errorMessage: 'Invalid model',
    isIn: {
      options: [models],
    },
    exists: true,
  },
};
