import {isEmailValid} from '../../utils/emailUtil';

describe('Email Utils', () => {
        test('isEmailValid', () => {
                expect(isEmailValid('test@gmail.com')).toBe(true);
                expect(isEmailValid('test@yahoo.ca')).toBe(true);
                expect(isEmailValid('test@gmail')).toBe(false);
                expect(isEmailValid('@gmail.com')).toBe(false);
                expect(isEmailValid('testgmail.com')).toBe(false);
                expect(isEmailValid('test@gmailcom')).toBe(false);
                expect(isEmailValid('test@gmail.c')).toBe(true);
                expect(isEmailValid('@testgmail.com')).toBe(false);
        });
});