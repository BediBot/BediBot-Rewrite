/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} string The input string.
 * @return {string} The string with the first letter capitalized.
 */
export const capFirstLetter = (string: string) => { return string.charAt(0).toUpperCase() + string.slice(1);};

/**
 * Capitalizes the first letter of every word in a string.
 *
 * @param {string} string The input string.
 * @return {number} The string with the first letter of every word capitalized.
 */
export const capFirstLetterEveryWord = (string: string) => {
  const array = string.split(' ');

  for (let i = 0; i < array.length; i++) { array[i] = array[i].charAt(0).toUpperCase() + array[i].slice(1); }

  return array.join(' ');
};