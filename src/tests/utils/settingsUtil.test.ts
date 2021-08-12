import {listModulesString} from '../../utils/settingsUtil';

describe('Settings Utils', () => {
  test('listModulesString', () => {
    expect(listModulesString()).toBe('`Verification` `Birthdays` `Announcements` `Due Dates` `Quotes`');
  });
});