import { tests } from '../';
const { email, integer, maxLength, minLength, numeric, passIfEmpty, phone, required } = tests;
const x = {};

describe('validator.tests passIfEmpty', () => {
  const alwaysFalse = () => false;

  test('passIfEmpty should pass empty string', () => {
    expect(passIfEmpty('', alwaysFalse)).toBe(true);
  });
  test('passIfEmpty should pass undefined', () => {
    expect(passIfEmpty(x.b, alwaysFalse)).toBe(true);
  });
  test('passIfEmpty should pass null', () => {
    expect(passIfEmpty(null, alwaysFalse)).toBe(true);
  });

  test('passIfEmpty should test number', () => {
    expect(passIfEmpty(2.13, alwaysFalse)).toBe(false);
  });
  test('passIfEmpty should test 0', () => {
    expect(passIfEmpty(0, alwaysFalse)).toBe(false);
  });
  test('passIfEmpty should test string', () => {
    expect(passIfEmpty('asdf', alwaysFalse)).toBe(false);
  });
  test('passIfEmpty should test array', () => {
    expect(passIfEmpty(['a'], alwaysFalse)).toBe(false);
  });
  test('passIfEmpty should test empty array', () => {
    expect(passIfEmpty([], alwaysFalse)).toBe(false);
  });
});

describe('validator.tests', () => {
  test('email', () => {
    expect(email('aj@ajm.com')).toBe(true);
    expect(email('2ajs12x@ajm.co')).toBe(true);
    expect(email('aj@ajm')).toBe(false);
    expect(email('aj@ajm.m')).toBe(false);
  });
  test('integer', () => {
    expect(integer('0')).toBe(true);
    expect(integer(0)).toBe(true);
    expect(integer(213)).toBe(true);
    expect(integer(2.13)).toBe(false);
    expect(integer('2e2')).toBe(false);
    expect(integer('')).toBe(true);
    expect(integer(null)).toBe(true);
    expect(integer(x.a)).toBe(true);
    expect(integer('2a')).toBe(false);
    expect(integer('asdf')).toBe(false);
  });
  test('maxLength', () => {
    const length = 5;

    expect(maxLength(length)('hello')).toBe(true);
    expect(maxLength(length, 'hello')).toBe(true);
    expect(maxLength(length, 'hey')).toBe(true);
    expect(maxLength(length, ['a', 'b', 'c'])).toBe(true);
    expect(maxLength(length, ['a', 'b', 'c', 'd', 'e', 'f'])).toBe(false);
    expect(maxLength(length, 'hello! my darling')).toBe(false);
  });
  test('minLength', () => {
    const length = 3;

    expect(minLength(length)('hello')).toBe(true);
    expect(minLength(length, 'hello')).toBe(true);
    expect(minLength(length, 'hey')).toBe(true);
    expect(minLength(length, ['a', 'b', 'c'])).toBe(true);
    expect(minLength(length, ['a', 'b', 'c', 'd'])).toBe(true);
    expect(minLength(length, 'hi')).toBe(false);
    expect(minLength(length, ['a', 'b' ])).toBe(false);
  });
  test('numeric', () => {
    expect(numeric('0')).toBe(true);
    expect(numeric(0)).toBe(true);
    expect(numeric(213)).toBe(true);
    expect(numeric(2.13)).toBe(true);
    expect(numeric('2e2')).toBe(true);
    expect(numeric('')).toBe(true);
    expect(numeric(null)).toBe(true);
    expect(numeric(x.a)).toBe(true);
    expect(numeric('2a')).toBe(false);
    expect(numeric('asdf')).toBe(false);
  });
  test('required', () => {
    expect(required('hi')).toBe(true);
    expect(required(0)).toBe(true);
    expect(required([])).toBe(true);
    expect(required(false)).toBe(true);
    expect(required(null)).toBe(false);
    expect(required(x.a)).toBe(false);
    expect(required('')).toBe(false);
  });
  test('phone', () => {
    expect(phone('+01-800-570-3355 ext718')).toBe(true);
    expect(phone('+01-800-570-3355x23')).toBe(true);
    expect(phone('+1-800-570-3355')).toBe(true);
    expect(phone('1-800-570-3355')).toBe(true);
    expect(phone('800-570-3355')).toBe(true);
    expect(phone('8005703355')).toBe(true);
    expect(phone('5703355')).toBe(false);
    expect(phone('aj@ajm.com')).toBe(false);
  });
});
