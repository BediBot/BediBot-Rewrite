import {listModulesString, validModule} from '../../utils/settingsUtil';

describe('Settings Utils', () => {
  test('validModule', () => {
    expect(validModule('Verification')).toBe(true);
    expect(validModule('verification')).toBe(true);
    expect(validModule('VERIFICATION')).toBe(true);
    expect(validModule('vErIfIcAtIoN')).toBe(true);
    expect(validModule('Verificatio')).toBe(false);
    expect(validModule('verificatio')).toBe(false);
    expect(validModule('VERIFICATIO')).toBe(false);
    expect(validModule('vErIfIcAtIo')).toBe(false);
    expect(validModule('Verification123123')).toBe(false);
    expect(validModule('birthdays')).toBe(true);
    expect(validModule('announcements')).toBe(true);
    expect(validModule('due dates')).toBe(true);
    expect(validModule('quotes')).toBe(true);
  });

  test('listModulesString', () => {
    expect(listModulesString()).toBe('`Verification` `Birthdays` `Announcements` `Due Dates` `Quotes`');
  });
});