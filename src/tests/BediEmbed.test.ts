import {BediEmbed} from '../lib/BediEmbed';

test('BediEmbed has Correct Properties', () => {
  const {footer, timestamp} = new BediEmbed();

  const now = Date.now();

  expect(footer?.text).toBe('For any concerns, contact a BediBot dev: Aadi, Carson, Joe, Sahil, & Zayd');
  expect(timestamp).toBe(now);
});