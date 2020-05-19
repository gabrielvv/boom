const models = require('./models');
const fileRegex = require('./fileRegex');

const inOption = ['body'];

module.exports = {
  email: {
    in: inOption,
    errorMessage: 'Invalid email',
    isEmail: true,
    normalizeEmail: true,
    exists: true,
  },
  file: {
    in: inOption,
    errorMessage: 'Invalid file',
    trim: true,
    matches: {
      options: [fileRegex],
    },
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
