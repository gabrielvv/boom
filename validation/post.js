module.exports = {
  email: {
    in: ['body'],
    errorMessage: 'Invalid email',
    isEmail: true,
    exists: true,
  },
  file: {
    in: ['body'],
    errorMessage: 'Invalid file',
    isURL: false,
    exists: true,
  },
  model: {
    in: ['body'],
    errorMessage: 'Invalid model',
    isIn: {
      options: ['2stems', '4stems', '5stems'],
    },
    exists: true,
  },
};
