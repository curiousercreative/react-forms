import React from 'react';
import Form from '../Form.jsx';

import F from './TestHelper';

const model = {
  validations: F.getValidations(),
};

describe('validate method', () => {
  test('validate method should return boolean', () => {
    expect(typeof F.render().validate()).toBe('boolean');
  });

  test('validate method should return valid for a simple valid form', () => {
    const form = F.render(<Form initialValues={{ a: 'b' }} model={model} />);
    expect(form.validate()).toBe(true);
  });

  test('validate method should return invalid for a simple invalid form', () => {
    const form = F.render(<Form initialValues={{ a: '' }} model={model} />);
    expect(form.validate()).toBe(false);
  });

  test('validate method should save errors for display by default', () => {
    const form = F.render(<Form initialValues={{ a: '' }} model={model} />);
    form.validate();

    expect(form.getErrors()).toHaveLength(1);
  });

  test('validate method should set Form.wasSubmitted when flag is set', () => {
    const form = F.render(<Form initialValues={{ a: '' }} model={model} />);
    form.validate(false);
    expect(form.wasSubmitted).toBe(false);

    form.validate();
    expect(form.wasSubmitted).toBe(true);
  });

  test('validate method should set instance flag for isValid', () => {
    const form = F.render(<Form initialValues={{ a: '' }} model={model} />);
    form.validate();

    const ctx = form.getContextValue();

    expect(ctx.state.isValid).toBe(false);
  });
});
