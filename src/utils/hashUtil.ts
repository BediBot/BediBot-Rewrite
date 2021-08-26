const jsSHA = require('jssha');

/**
 * Hashes a string
 * @param {string} string
 * @returns {Promise<string>}
 */
export const hashString = async (string: string) => {
  const sha256 = new jsSHA('SHA-256', 'TEXT');
  sha256.update(string);
  return sha256.getHash('HEX');
};
