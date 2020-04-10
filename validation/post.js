module.exports = {
  file: {
    in: ['body'],
    errorMessage: 'Invalid file',
    isURL: true,
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
