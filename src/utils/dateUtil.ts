/**
 * Checks if a month (number or string) is valid and returns it if so, null otherwise
 * @param month
 * @returns {null | number}
 */
export const isValidMonth = (month: string | number): number | null => {
  if (typeof month === 'string') {
    const tempDate = Date.parse(month + '1, 2021');
    if (!isNaN(tempDate)) {
      return new Date(tempDate).getMonth() + 1;
    } else return null;
  }
  return month;
};

export const didDateChange = (newDate: Date, origDay: number, origMonth: number, origYear: number) => {
  return !(newDate.getFullYear() === origYear) || !(newDate.getMonth() + 1 === origMonth) || !(newDate.getDate() == origDay);
};