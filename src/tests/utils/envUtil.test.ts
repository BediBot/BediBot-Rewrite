import {validateEnv} from '../../utils/envUtil';

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
                process.env.EMAIL_USER = 'randomString';
                process.env.EMAIL_CLIENT_ID = 'randomString';
                process.env.EMAIL_CLIENT_SECRET = 'randomString';
                process.env.EMAIL_CLIENT_REFRESH = 'randomString';
                process.env.BOT_OWNERS = 'randomString';
                process.env.LOG_LEVEL = 'info';

                expect(validateEnv()).toBe(true);
        });

        test('ENV Missing Bot Token', () => {
                process.env.MONGO_URI = 'randomString';
                process.env.EMAIL_USER = 'randomString';
                process.env.EMAIL_CLIENT_ID = 'randomString';
                process.env.EMAIL_CLIENT_SECRET = 'randomString';
                process.env.EMAIL_CLIENT_REFRESH = 'randomString';
                process.env.BOT_OWNERS = 'randomString';
                process.env.LOG_LEVEL = 'info';

                expect(validateEnv()).toBe(false);
        });

        test('ENV Missing Mongo URI', () => {
                process.env.BOT_TOKEN = 'randomString';
                process.env.EMAIL_USER = 'randomString';
                process.env.EMAIL_CLIENT_ID = 'randomString';
                process.env.EMAIL_CLIENT_SECRET = 'randomString';
                process.env.EMAIL_CLIENT_REFRESH = 'randomString';
                process.env.BOT_OWNERS = 'randomString';
                process.env.LOG_LEVEL = 'info';

                expect(validateEnv()).toBe(false);
        });

        test('ENV Missing Email User', () => {
                process.env.BOT_TOKEN = 'randomString';
                process.env.MONGO_URI = 'randomString';
                process.env.EMAIL_CLIENT_ID = 'randomString';
                process.env.EMAIL_CLIENT_SECRET = 'randomString';
                process.env.EMAIL_CLIENT_REFRESH = 'randomString';
                process.env.BOT_OWNERS = 'randomString';
                process.env.LOG_LEVEL = 'info';

                expect(validateEnv()).toBe(false);
        });

        test('ENV Missing Client ID', () => {
                process.env.BOT_TOKEN = 'randomString';
                process.env.MONGO_URI = 'randomString';
                process.env.EMAIL_USER = 'randomString';
                process.env.EMAIL_CLIENT_SECRET = 'randomString';
                process.env.EMAIL_CLIENT_REFRESH = 'randomString';
                process.env.BOT_OWNERS = 'randomString';
                process.env.LOG_LEVEL = 'info';

                expect(validateEnv()).toBe(false);
        });

        test('ENV Missing Client Secret', () => {
                process.env.BOT_TOKEN = 'randomString';
                process.env.MONGO_URI = 'randomString';
                process.env.EMAIL_USER = 'randomString';
                process.env.EMAIL_CLIENT_ID = 'randomString';
                process.env.EMAIL_CLIENT_REFRESH = 'randomString';
                process.env.BOT_OWNERS = 'randomString';
                process.env.LOG_LEVEL = 'info';

                expect(validateEnv()).toBe(false);
        });

        test('ENV Missing Client Refresh Token', () => {
                process.env.BOT_TOKEN = 'randomString';
                process.env.MONGO_URI = 'randomString';
                process.env.EMAIL_USER = 'randomString';
                process.env.EMAIL_CLIENT_ID = 'randomString';
                process.env.EMAIL_CLIENT_SECRET = 'randomString';
                process.env.BOT_OWNERS = 'randomString';
                process.env.LOG_LEVEL = 'info';

                expect(validateEnv()).toBe(false);
        });

        test('ENV Bot Owners', () => {
                process.env.BOT_TOKEN = 'randomString';
                process.env.MONGO_URI = 'randomString';
                process.env.EMAIL_USER = 'randomString';
                process.env.EMAIL_CLIENT_ID = 'randomString';
                process.env.EMAIL_CLIENT_SECRET = 'randomString';
                process.env.EMAIL_CLIENT_REFRESH = 'randomString';
                process.env.LOG_LEVEL = 'info';

                expect(validateEnv()).toBe(false);
        });

        test('ENV Log Level', () => {
                process.env.BOT_TOKEN = 'randomString';
                process.env.MONGO_URI = 'randomString';
                process.env.EMAIL_USER = 'randomString';
                process.env.EMAIL_CLIENT_ID = 'randomString';
                process.env.EMAIL_CLIENT_SECRET = 'randomString';
                process.env.EMAIL_CLIENT_REFRESH = 'randomString';
                process.env.BOT_OWNERS = 'randomString';

                expect(validateEnv()).toBe(false);
        });

        test('ENV Missing All Variables', () => {
                expect(validateEnv()).toBe(false);
        });
});