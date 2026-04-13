import { GenerateToken } from '../GenerateToken';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('GenerateToken', () => {
  const userId = 'user123';
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.JWT_SECRET = 'test-secret';
    process.env.Refresh_Key = 'test-refresh-secret';
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should generate access and refresh tokens', () => {
    (jwt.sign as jest.Mock).mockReturnValue('mocked-token');

    const result = GenerateToken(userId);

    expect(jwt.sign).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      accessToken: 'mocked-token',
      refreshToken: 'mocked-token',
    });
  });
});
