import React from 'react';

import Form from 'components/form/Form';

import F from './TestHelper';

test('getValue method should return expected value', () => {
  expect(F.render().getValue('a')).toEqual('b');
});

test('Form instance should have isValid flag set on mount', () => {
  const form = F.render(<Form values={{ a: '' }} validations={F.getValidations()} />);
  expect(form.isValid).toBe(false);
});

// validateAsYouGo prop
