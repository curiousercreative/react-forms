import React from 'react';

import Form from '../Form.jsx';

import F from './TestHelper';

test('getValue method should return expected value', () => {
  expect(F.render().getValue('a')).toEqual('b');
});

test('Form instance should have isValid flag set on mount', () => {
  const form = F.render(<Form initialValues={{ a: '' }} validations={F.getValidations()} />);

  setTimeout(() => {
    expect(form.isValid).toBe(false);
  }, 20);
});

// validateAsYouGo prop
