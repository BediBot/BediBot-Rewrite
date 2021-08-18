import {isValidDuration} from '../../utils/schedulerUtil';

describe('Scheduler Utils', () => {
  test('isValidDuration', () => {
    expect(isValidDuration('one second')).toBe(true);
    expect(isValidDuration('ten seconds')).toBe(true);
    expect(isValidDuration('one minute')).toBe(true);
    expect(isValidDuration('ten minutes')).toBe(true);
    expect(isValidDuration('one hour')).toBe(true);
    expect(isValidDuration('ten hours')).toBe(true);
    expect(isValidDuration('one day')).toBe(true);
    expect(isValidDuration('ten days')).toBe(true);
    expect(isValidDuration('one week')).toBe(true);
    expect(isValidDuration('ten weeks')).toBe(true);
    expect(isValidDuration('one month')).toBe(true);
    expect(isValidDuration('ten months')).toBe(true);
    expect(isValidDuration('one year')).toBe(true);
    expect(isValidDuration('ten years')).toBe(true);
    expect(isValidDuration('')).toBe(false);
    expect(isValidDuration('blahblahblah')).toBe(false);
    expect(isValidDuration('thisisnotvalid')).toBe(false);
  });
});