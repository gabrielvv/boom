module.exports = {
  client_id: {
    in: ['body'],
    exists: true,
  },
  client_secret: {
    in: ['body'],
    exists: true,
  },
};
