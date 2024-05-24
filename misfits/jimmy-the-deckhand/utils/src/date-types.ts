import { isValidISODateString } from 'iso-datestring-validator';

export type ISO8601DateTime = string & { __ISO8601__: void };

function fromString(str: string): ISO8601DateTime {
  if (!isValidISODateString(str)) {
    throw new Error(`not a valid ISO8601 date - [${str}]`);
  }
  return str as ISO8601DateTime;
}

function fromDate(date: Date): ISO8601DateTime {
  return date.toISOString() as ISO8601DateTime;
}

function now(): ISO8601DateTime {
  return fromDate(new Date());
}

function isBefore(one: ISO8601DateTime, two: ISO8601DateTime): boolean {
  return one < two;
}

function isAfter(one: ISO8601DateTime, two: ISO8601DateTime): boolean {
  return one > two;
}

function toDate(iso8601: ISO8601DateTime): Date {
  return new Date(iso8601);
}

function add(
  one: ISO8601DateTime,
  n: number,
  unit: 'seconds' | 'minutes' | 'hours' | 'days',
): ISO8601DateTime {
  const date = toDate(one);
  switch (unit) {
    case 'seconds':
      date.setSeconds(date.getSeconds() + n);
      break;
    case 'minutes':
      date.setMinutes(date.getMinutes() + n);
      break;
    case 'hours':
      date.setHours(date.getHours() + n);
      break;
    case 'days':
      date.setDate(date.getDate() + n);
      break;
    default:
      throw new Error(`unsupported unit - [${unit}]`);
  }
  return fromDate(date) as ISO8601DateTime;
}

export const ISO8601 = {
  fromString,
  fromDate,
  now,
  isAfter,
  isBefore,
  toDate,
  add,
};
