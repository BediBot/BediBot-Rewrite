import {validateEnv} from '../utils/validateEnv';

describe('Environment Variables', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {...OLD_ENV};
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('ENV Set up Correctly', () => {
    process.env.BOT_TOKEN = 'randomString';
    process.env.MONGO_URI = 'randomString';

    expect(validateEnv()).toBe(true);
  });

  test('ENV Missing Bot Token', () => {
    process.env.MONGO_URI = 'randomString';

    expect(validateEnv()).toBe(false);
  });

  test('ENV Missing Mongo URI', () => {
    process.env.BOT_TOKEN = 'randomString';

    expect(validateEnv()).toBe(false);
  });

  test('ENV Missing All Variables', () => {
    expect(validateEnv()).toBe(false);
  });
});