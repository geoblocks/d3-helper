import { getRoundedNumber } from './utils';

describe('Utils functions', () => {
  it('getRoundedNumber', () => {
    expect(getRoundedNumber(null)).toEqual(null);
    expect(getRoundedNumber(undefined)).toEqual(undefined);
    expect(getRoundedNumber(NaN)).toEqual(NaN);
    expect(getRoundedNumber(20.25)).toEqual(20);
    expect(getRoundedNumber('20.25')).toEqual(20);
    expect(getRoundedNumber('-20.25')).toEqual(-20);
    expect(getRoundedNumber('20-25')).toEqual('20-25');
    expect(getRoundedNumber('round a string')).toEqual('round a string');
    expect(getRoundedNumber('123 round a string')).toEqual('123 round a string');
  });
});
