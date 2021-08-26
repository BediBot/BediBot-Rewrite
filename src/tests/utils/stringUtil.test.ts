import {capFirstLetter, capFirstLetterEveryWord} from '../../utils/stringsUtil';

describe('String Utils', () => {
    test('capFirstLetter', () => {
        expect(capFirstLetter('RandomString')).toBe('RandomString');
        expect(capFirstLetter('randomString')).toBe('RandomString');
        expect(capFirstLetter('RANDOMSTRING')).toBe('RANDOMSTRING');
        expect(capFirstLetter('')).toBe('');
        expect(capFirstLetter('randomString randomString randomString')).toBe('RandomString randomString randomString');
    });

    test('capFirstLetterEveryWord', () => {
        expect(capFirstLetterEveryWord('RandomString')).toBe('RandomString');
        expect(capFirstLetterEveryWord('randomString')).toBe('RandomString');
        expect(capFirstLetterEveryWord('RANDOMSTRING')).toBe('RANDOMSTRING');
        expect(capFirstLetterEveryWord('')).toBe('');
        expect(capFirstLetterEveryWord('randomString randomString randomString')).toBe('RandomString RandomString RandomString');
    });
});