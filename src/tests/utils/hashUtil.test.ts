import {hashString} from '../../utils/hashUtil';

const bcrypt = require('bcrypt');

describe('Hash Utils', () => {
  test('hashString', async () => {
    const input = 'randomString';

    const output = await hashString(input);

    expect(bcrypt.compareSync(input, output)).toBe(true);
    expect(bcrypt.compareSync('notCorrect', output)).toBe(false);
  });
});