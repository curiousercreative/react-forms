import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react'

import Form from '../Form.jsx';
import TextField from '../fields/TextField.jsx';

import F from './TestHelper';

afterEach(cleanup);

test('Form onChange prop fn should receive form values', () => {
  const handleChange = jest.fn(val => val);

  const { getByRole } = render(<Form initialValues={{ password: 'pass' }} onChange={handleChange}>
    <TextField name="username" />
  </Form>);

  const input = getByRole('textbox');
  fireEvent.change(input, { target: { value: 'hi my name is' } });

  setTimeout(() => {
    expect(handle).toHaveReturnedWith({ password: 'pass', username: 'hi my name is' });
  }, 0);
});

test('Field onChange prop fn should receive form value', () => {
  const handleChange = jest.fn(val => val);

  const { getByRole } = render(<Form>
    <TextField name="username" onChange={handleChange} />
  </Form>);

  const input = getByRole('textbox');
  fireEvent.change(input, { target: { value: 'hi my name is' } });

  setTimeout(() => {
    expect(handle).toHaveReturnedWith('hi my name is');
  }, 0);
});
