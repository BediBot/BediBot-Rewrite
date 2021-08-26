import {isValidDurationOrTime, isValidTime} from '../../utils/schedulerUtil';

describe('Scheduler Utils', () => {
    test('isValidDurationOrTime', () => {
        expect(isValidDurationOrTime('one second')).toBe(true);
        expect(isValidDurationOrTime('ten seconds')).toBe(true);
        expect(isValidDurationOrTime('one minute')).toBe(true);
        expect(isValidDurationOrTime('ten minutes')).toBe(true);
        expect(isValidDurationOrTime('one hour')).toBe(true);
        expect(isValidDurationOrTime('ten hours')).toBe(true);
        expect(isValidDurationOrTime('one day')).toBe(true);
        expect(isValidDurationOrTime('ten days')).toBe(true);
        expect(isValidDurationOrTime('one week')).toBe(true);
        expect(isValidDurationOrTime('ten weeks')).toBe(true);
        expect(isValidDurationOrTime('one month')).toBe(true);
        expect(isValidDurationOrTime('ten months')).toBe(true);
        expect(isValidDurationOrTime('one year')).toBe(true);
        expect(isValidDurationOrTime('ten years')).toBe(true);
        expect(isValidDurationOrTime('23:59')).toBe(true);
        expect(isValidDurationOrTime('02:17')).toBe(true);
        expect(isValidDurationOrTime('2 am')).toBe(true);
        expect(isValidDurationOrTime('12 pm')).toBe(true);
        expect(isValidDurationOrTime('2:59 PM')).toBe(true);
        expect(isValidDurationOrTime('13:78')).toBe(false);
        expect(isValidDurationOrTime('')).toBe(false);
        expect(isValidDurationOrTime('blahblahblah')).toBe(false);
        expect(isValidDurationOrTime('thisisnotvalid')).toBe(false);
    });

    test('isValidTime', () => {
        expect(isValidTime('23:59')).toBe(true);
        expect(isValidTime('02:17')).toBe(true);
        expect(isValidTime('2 am')).toBe(true);
        expect(isValidTime('12 pm')).toBe(true);
        expect(isValidTime('2:59 PM')).toBe(true);
        expect(isValidTime('13:78')).toBe(false);
        expect(isValidTime('')).toBe(false);
        expect(isValidTime('blahblahblah')).toBe(false);
        expect(isValidTime('thisisnotvalid')).toBe(false);
    });
});