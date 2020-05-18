const request = require('supertest');
const { redis: redisConfig, storage } = require('config');
const { app, redisClient } = require('../server');

jest.mock('redis');
jest.mock('../lib/utils', () => ({
  getStatusUrl: () => 'fake-url',
}));
// disable auth
jest.mock('../lib/middleware/jwt-check', () => (req, res, next) => next());
jest.mock('uuid');

const mockRpush = jest.fn();
redisClient.rpush = mockRpush;

describe('/api', () => {
  describe('/split', () => {
    test('returns a status url', async () => {
      const file = `${storage.s3.uploadDir}/music-00000000-0000-0000-0000-000000000000.${storage.accept[0]}`;
      const model = '2stems';
      const email = 'user@example.com';
      const { body } = await request(app).post('/api/split').send({
        file,
        model,
        email,
      });
      const expectedPayload = {
        id: '00000000-0000-0000-0000-000000000000',
        email,
        file,
        model,
        status: 'fake-url',
      };
      expect(body).toEqual(expectedPayload);

      expect(redisClient.rpush).toHaveBeenCalledTimes(1);
      expect(redisClient.rpush).toHaveBeenCalledWith(
        `${redisConfig.queueName}:${model}`,
        JSON.stringify(expectedPayload),
        expect.any(Function),
      );
    });

    test('returns a 422', async () => {
      const file = 'file';
      const model = '2stems';
      const { status } = await request(app).post(`/api/split`).send({
        file,
        model
      });
      expect(status).toEqual(422);
    });
  });
});
