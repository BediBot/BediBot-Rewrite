import {capFirstLetterEveryWord} from './stringsUtil';

// Array of settings modules
const modules = ['verification', 'birthdays', 'announcements', 'due dates', 'quotes'];

/**
 * Validates if a given string is a valid module name.
 *
 * @param {string} module The string to validate.
 * @return {boolean} Is the given string a valid module name?
 */
export const validModule = (module: string) => {
  return modules.includes(module.toLowerCase());
};

/**
 * Creates a pretty string to represent modules in the $settings command embed.
 *
 * @return {string} A pretty string representation of all settings modules.
 */
export const listModulesString = () => {
  const copy = [...modules];

  for (let i = 0; i < copy.length; i++) {
    copy[i] = '`' + capFirstLetterEveryWord(copy[i]) + '`';
  }

  return copy.join(' ');
};