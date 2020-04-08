const redis = jest.genMockFromModule('redis');

redis.createClient = () => ({
  rpush: jest.fn(),
  on: () => 'noop',
});

module.exports = redis;
