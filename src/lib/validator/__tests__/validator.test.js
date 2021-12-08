import { validate, tests, messages } from '../index.js';

function expectValid (errors) {
  expect(errors).toEqual([]);
}

const meta = {
  formTest: false,
  warning: false,
};

class Simple {
  static expectErrors (errors) {
    expect(errors).toEqual([{ name: 'a', message: 'A is a required field', meta }]);
  }
  static invalidData = { a: '' };
  static validData = { a: 'b' };
  static validations = [{
    names: [ 'a' ],
    tests: [[ tests.required, messages.required ]],
  }];
}

describe('validate returns correct type', () => {
  test('validate returns empty array given valid data', () => {
    const errors = validate(Simple.validData, Simple.validations);

    expect(Array.isArray(errors)).toBeTruthy();
  });

  test('validate returns errors collection given invalid data', () => {
    const errors = validate(Simple.invalidData, Simple.validations);

    expect(Array.isArray(errors)).toBeTruthy();
  });
});

describe('validate "validateMissingFields" third parameter', () => {
  test('required test fails given missing data by default', () => {
    const errors = validate({}, Simple.validations);

    Simple.expectErrors(errors);
  });

  test('required test passes given missing data with flag set', () => {
    const errors = validate({}, Simple.validations, false);

    expectValid(errors);
  });
});

describe('simple "required" test', () => {
  test('required test passes given valid data', () => {
    const errors = validate(Simple.validData, Simple.validations);

    expectValid(errors);
  });

  test('required test fails given invalid data', () => {
    const errors = validate({ a: '' }, Simple.validations);

    Simple.expectErrors(errors);
  });

  test('validation ', () => {
    function _validate () {
      return validate({ a: '' }, [{
        names: [ 'a' ],
        tests: [[ tests.required, messages.required('Custom field name') ]],
      }]);
    }

    expect(_validate).not.toThrow();
    const errors = _validate();
    expect(errors.length).toBe(1);
  });
});

describe('complex tests', () => {
  class Complex {
    static expectErrors (errors) {
      expect(errors).toEqual([
        { name: 'password', message: 'Password is a required field', meta },
        { name: 'username', message: 'Username must be at least 6 characters', meta },
      ]);
    }
    static invalidData = { username: 'some', password: '' };
    static validData = { username: 'somename', password: 'somepass' };
    static validations = [{
      names: [ 'username', 'password' ],
      tests: [
        [ tests.required, messages.required ],
        [ tests.minLength(6), messages.minLength(6) ],
      ],
    }];
    static validationsAlt = [
      {
        names: [ 'username' ],
        tests: [
          [ tests.required, messages.required ],
          [ tests.minLength(6), messages.minLength(6) ],
        ],
      },
      {
        names: [ 'password' ],
        tests: [
          [ tests.required, messages.required ],
          [ tests.minLength(6), messages.minLength(6) ],
        ],
      },
    ];
  }

  test('complex tests pass given valid data', () => {
    expectValid(validate(Complex.validData, Complex.validations));
  });

  test('complex tests fails given invalid data', () => {
    Complex.expectErrors(validate(Complex.invalidData, Complex.validations));
  });

  test('complex tests pass using either validations data formats', () => {
    expect(validate(Complex.validData, Complex.validations))
      .toEqual(validate(Complex.validData, Complex.validationsAlt));
  });

  test('complex tests fail with identical results given invalid data using either validations data formats', () => {
    expect(validate(Complex.invalidData, Complex.validations))
      .toEqual(validate(Complex.invalidData, Complex.validationsAlt));
  });
});

describe('validations with meta', () => {
  test('warning meta flag should translate', () => {
    const errors = [{
      name: 'a',
      message: 'A is a required field',
      meta: { ...meta, warning: true, x: 'x' },
    }];
    const formData = {};
    const validations = [{
      names: [ 'a' ],
      tests: [[ tests.required, messages.required, { warning: true, x: 'x' } ]],
    }];

    expect(validate(formData, validations)).toEqual(errors);
  });

  test('without meta.formValidation flag, validation test should be supplied form field', () => {
    const formData = { a: 'b' };
    const testFn = jest.fn();
    const validations = [{
      names: [ 'a' ],
      tests: [[ testFn, messages.required ]],
    }];

    validate(formData, validations);
    expect(testFn).toHaveBeenCalledWith(formData.a);
  });

  test('meta.formValidation flag should supply form data', () => {
    const errors = [{
      name: 'a',
      message: 'A is a required field',
      meta: { ...meta, formTest: true },
    }];
    const formData = { a: 'b' };
    const testFn = jest.fn();
    const validations = [{
      names: [ 'a' ],
      tests: [[ testFn, messages.required, { formTest: true } ]],
    }];

    expect(validate(formData, validations)).toEqual(errors);
    expect(testFn).toHaveBeenCalledWith(formData);
  });
});
