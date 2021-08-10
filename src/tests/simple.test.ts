test('Simple True Test', () => {
  expect(true).toBe(true);
});

test('Simple False Test', () => {
  expect(false).toBe(false);
});

test('Expect Fail Test', () => {
  expect(true).toBe(false);
});