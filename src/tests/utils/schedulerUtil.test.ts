import {isValidDurationOrTime} from '../../utils/schedulerUtil';

describe('Scheduler Utils', () => {
  test('isValidDuration', () => {
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
    expect(isValidDurationOrTime('')).toBe(false);
    expect(isValidDurationOrTime('blahblahblah')).toBe(false);
    expect(isValidDurationOrTime('thisisnotvalid')).toBe(false);
  });
});