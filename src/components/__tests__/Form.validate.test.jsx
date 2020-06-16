import React from 'react';
import Form from '../Form.jsx';

import F from './TestHelper';

describe('validate method', () => {
  test('validate method should return boolean', () => {
    expect(typeof F.render().validate()).toBe('boolean');
  });

  test('validate method should return valid for a simple valid form', () => {
    const form = F.render(<Form initialValues={{ a: 'b' }} validations={F.getValidations()} />);
    expect(form.validate()).toBe(true);
  });

  test('validate method should return invalid for a simple invalid form', () => {
    const form = F.render(<Form initialValues={{ a: '' }} validations={F.getValidations()} />);
    expect(form.validate()).toBe(false);
  });

  test('validate method should save errors for display by default', () => {
    const form = F.render(<Form initialValues={{ a: '' }} validations={F.getValidations()} />);
    form.validate();

    expect(form.getErrors()).toHaveLength(1);
  });

  test('validate method should not save errors for display when flag is set', () => {
    const form = F.render(<Form initialValues={{ a: '' }} validations={F.getValidations()} />);
    form.validate(false);

    expect(form.getErrors()).toHaveLength(0);
  });

  test('validate method should set instance flag for isValid', () => {
    const form = F.render(<Form initialValues={{ a: '' }} validations={F.getValidations()} />);
    form.validate();

    expect(form.isValid).toBe(false);
  });
});
