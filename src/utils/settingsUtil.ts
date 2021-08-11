import {capFirstLetterEveryWord} from './stringsUtil';

const modules = ['verification', 'birthdays', 'announcements', 'due dates', 'quotes'];

export const validModule = (module: string) => {
  return modules.includes(module.toLowerCase());
};

export const listModulesString = () => {
  const copy = [...modules];

  for (let i = 0; i < copy.length; i++) {
    copy[i] = '`' + capFirstLetterEveryWord(copy[i]) + '`';
  }

  return copy.join(' ');
};