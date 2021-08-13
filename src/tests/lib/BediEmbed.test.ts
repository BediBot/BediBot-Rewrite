import {BediEmbed} from '../../lib/BediEmbed';

describe('BediEmbed', () => {
  test('BediEmbed has Correct Properties', () => {
    const {footer, color, timestamp} = new BediEmbed();
    const now = Date.now();

    expect(timestamp).toBe(now);
    expect(color).toBe(3553599);
    expect(typeof footer).toBe('object');
    expect(footer!.text).toBe('For any concerns, contact a BediBot dev: Aadi, Carson, Joe, Sahil, & Zayd');
  });
});