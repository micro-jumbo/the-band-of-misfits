import { PartialBy } from '../src';

describe('PartialBy', () => {
  type TestType = {
    a: number;
    b: string;
    c: boolean;
  };

  it('should make specified properties optional', () => {
    type ResultType = PartialBy<TestType, 'b' | 'c'>;
    const result: ResultType = { a: 1 };

    expect(result.a).toBe(1);
    expect(result.b).toBeUndefined();
    expect(result.c).toBeUndefined();
  });

  it('should not affect unspecified properties', () => {
    type ResultType = PartialBy<TestType, 'b' | 'c'>;
    const result: ResultType = { a: 1, b: 'test' };

    expect(result.a).toBe(1);
    expect(result.b).toBe('test');
    expect(result.c).toBeUndefined();
  });

  it('should allow specified properties to be defined', () => {
    type ResultType = PartialBy<TestType, 'b' | 'c'>;
    const result: ResultType = { a: 1, b: 'test', c: true };

    expect(result.a).toBe(1);
    expect(result.b).toBe('test');
    expect(result.c).toBe(true);
  });
});
