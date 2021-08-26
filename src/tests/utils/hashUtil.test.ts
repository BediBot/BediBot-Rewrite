import {hashString} from '../../utils/hashUtil';

describe('Hash Utils', () => {
    test('hashString', async () => {
        const input = 'randomString';

        const output = await hashString(input);

        expect('notTheHash' === output).toBe(false);
    });
});