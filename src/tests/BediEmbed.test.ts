import {BediEmbed} from '../lib/BediEmbed';

test('BediEmbed has Correct Footer', () => {
  const {footer} = new BediEmbed();
  const now = Date.now();

  expect(typeof footer).toBe('object');
  expect(footer!.text).toBe('For any concerns, contact a BediBot dev: Aadi, Carson, Joe, Sahil, & Zayd');
});

test('BediEmbed has Correct Timestamp', () => {
  const {timestamp} = new BediEmbed();

  const now = Date.now();

  expect(timestamp).toBe(now);
});