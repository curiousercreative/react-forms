import humanize from '../humanize.js';

describe('humanize', () => {
  test('should be a function', () => {
    expect(typeof humanize).toBe('function');
  });
  test('should optionally lower case', () => {
    expect(humanize('SOME WHITESPACE', 'lower')).toBe('some whitespace');
  });
  test('should optionally title case', () => {
    expect(humanize('SOME WHITESPACE', 'title')).toBe('Some Whitespace');
  });
  test('Handles snake_case', () => {
    expect(humanize('some_snake_case')).toBe('Some snake case');
  });
  test('Handles pipe-case', () => {
    expect(humanize('some-pipe-case')).toBe('Some pipe case');
  });
  test('Handles white space', () => {
    expect(humanize('some word')).toBe('Some word');
  });
  test('Handles camelCase', () => {
    expect(humanize('someCamelCase')).toBe('Some camel case');
  });
  test('Handles PascalCase', () => {
    expect(humanize('SomePascalCase')).toBe('Some pascal case');
  });
});
