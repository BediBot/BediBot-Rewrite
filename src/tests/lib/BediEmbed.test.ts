import {BediEmbed} from '../../lib/BediEmbed';

describe('BediEmbed', () => {
  test('BediEmbed has Correct Properties', () => {
    const embed = new BediEmbed();

    expect(embed).toBeDefined();
  });
});