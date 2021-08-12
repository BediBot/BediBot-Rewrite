const bcrypt = require('bcrypt');

export const hashString = async (string: string) => {
  const HASH_ROUNDS = 10;

  const salt = await bcrypt.genSalt(HASH_ROUNDS);
  return await bcrypt.hash(string, salt);
};