import { messages } from '../';

describe('validator.messages', () => {
  test('messages.required should be a function', () => {
    expect(typeof messages.required).toBe('function');
  });

  test('messages.required should return a function with no args supplied', () => {
    expect(typeof messages.required()).toBe('function');
  });
});
