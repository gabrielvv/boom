const url = require('url');

const getBaseUrl = (req) => {
  const hostname = req.headers.host;
  const { pathname } = url.parse(req.url);
  const { protocol } = req;
  return `${protocol}://${hostname}${pathname}`;
};

module.exports = {
  getStatusUrl: (req, jobId) => `${getBaseUrl(req)}/${jobId}/status`,
};
