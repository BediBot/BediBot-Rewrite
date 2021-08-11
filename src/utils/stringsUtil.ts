export const capFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const capFirstLetterEveryWord = (string: string) => {
  const array = string.split(' ');

  for (let i = 0; i < array.length; i++) {
    array[i] = array[i].charAt(0).toUpperCase() + array[i].slice(1);
  }

  return array.join(' ');
};