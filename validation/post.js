module.exports = {
  file: {
    in: ['query'],
    errorMessage: 'Invalid file',
    isURL: true,
    exists: true,
  },
  model: {
    in: ['query'],
    errorMessage: 'Invalid model',
    isIn: {
      options: ['2stems', '4stems', '5stems'],
    },
    exists: true,
  },
};
