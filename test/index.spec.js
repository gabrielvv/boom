const request = require('supertest');
const { redis: redisConfig } = require('config');
const { app, redisClient } = require('../index');

jest.mock('redis');
jest.mock('../utils', () => ({
  getStatusUrl: () => 'fake-url',
}));
jest.mock('uuid');

const mockRpush = jest.fn();
redisClient.rpush = mockRpush;

describe('/api', () => {
  describe('/split', () => {
    test('returns a status url', async () => {
      const file = 'http://example.com/1234567.mp3';
      const model = '2stems';
      const email = 'user@example.com';
      const { body } = await request(app).post('/api/split').send({
        file,
        model,
        email,
      });
      const expectedPayload = {
        id: 'fake-uuid',
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
      const { status } = await request(app).post(`/api/split?file=${file}&model=${model}`);
      expect(status).toEqual(422);
    });
  });
});
