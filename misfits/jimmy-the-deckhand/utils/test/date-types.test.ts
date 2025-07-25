import { ISO8601, ISO8601DateTime } from '../src';

describe('ISO8601', () => {
  describe('fromString', () => {
    it('should return ISO8601DateTime when valid ISO string is provided', () => {
      const isoString = '2022-01-01T00:00:00Z';
      const result = ISO8601.fromString(isoString);
      expect(result).toEqual(isoString);
    });

    it('should throw error when invalid ISO string is provided', () => {
      const invalidIsoString = 'invalid-date';
      expect(() => ISO8601.fromString(invalidIsoString)).toThrow();
    });
  });

  describe('fromDate', () => {
    it('should return ISO8601DateTime from Date object', () => {
      const date = new Date('2022-01-01T00:00:00Z');
      const result = ISO8601.fromDate(date);
      expect(result).toEqual(date.toISOString());
    });
  });

  describe('isBefore and isAfter', () => {
    let date1: ISO8601DateTime;
    let date2: ISO8601DateTime;

    beforeEach(() => {
      date1 = ISO8601.fromString('2022-01-01T00:00:00Z');
      date2 = ISO8601.fromString('2022-01-02T00:00:00Z');
    });

    it('should return true when date1 is before date2', () => {
      expect(ISO8601.isBefore(date1, date2)).toBe(true);
    });

    it('should return false when date1 is after date2', () => {
      expect(ISO8601.isAfter(date1, date2)).toBe(false);
    });
  });

  describe('toDate', () => {
    it('should return Date object from ISO8601DateTime', () => {
      const isoDateTime = ISO8601.fromString('2022-01-01T00:00:00Z');
      const result = ISO8601.toDate(isoDateTime);
      expect(result).toEqual(new Date(isoDateTime));
    });
  });

  describe('add', () => {
    it('should add specified unit of time to the given ISO8601DateTime', () => {
      const isoDateTime = ISO8601.fromString('2022-01-01T00:00:00Z');
      const result = ISO8601.add(isoDateTime, 1, 'days');
      expect(result).toEqual(ISO8601.fromString('2022-01-02T00:00:00.000Z'));
    });

    it('should throw error when unsupported unit is provided', () => {
      const isoDateTime = ISO8601.fromString('2022-01-01T00:00:00Z');
      expect(() =>
        ISO8601.add(isoDateTime, 1, 'unsupported' as any),
      ).toThrow();
    });
  });

  describe('now', () => {
    it('should return current ISO8601DateTime', () => {
      const now = new Date();
      jest.spyOn(global, 'Date').mockImplementationOnce(() => now);
      const result = ISO8601.now();
      expect(result).toEqual(now.toISOString());
    });
  });
});
