import React from 'react';

import Form from '../Form.jsx';

import F from './TestHelper';

test('Form instance should have isValid flag set on mount', () => {
  const form = F.render(<Form initialValues={{ a: '' }} validations={F.getValidations()} />);

  setTimeout(() => {
    expect(form.isValid).toBe(false);
  }, 20);
});

test('Form instance should have store set before mount', () => {
  const form = F.render(<Form initialValues={{ a: '' }} validations={F.getValidations()} />);

  setTimeout(() => {
    expect(typeof form.store.getData).toBe('function');
  }, 20);
});

test('Form._hasParentForm should return false by default', () => {
  const form = F.render(<Form initialValues={{ a: '' }} validations={F.getValidations()} />);

  expect(form._hasParentForm()).toBe(false);
});

// validateAsYouGo prop
