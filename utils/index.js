module.exports = {
  getStatusUrl: (baseUrl, port, id) => `${baseUrl}:${port}/status?job=${id}`
}