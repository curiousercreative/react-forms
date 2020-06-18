import React from 'react';
import renderer from 'react-test-renderer';

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

test('Form._hasParentForm should return true for nested form', () => {
  const testRenderer = renderer.create(
    <Form>
      <Form name="child" />
    </Form>
  );

  const child = testRenderer.root.findByProps({ name: 'child' }).instance;

  expect(child._hasParentForm()).toBe(true);
});

test('Nested form should use parent form as store', () => {
  const testRenderer = renderer.create(
    <Form initialValues={{ child_field: 'b' }}>
      <Form name="child" />
    </Form>
  );

  const form = testRenderer.getInstance();
  const child = testRenderer.root.findByProps({ name: 'child' }).instance;

  form.pubsub.on('field.name.updated', () => {
    expect(form.getValue('child_field')).toBe('a');
  });

  child.setValue('child_field', 'a');
});

// initialValues show in getData


// validateAsYouGo prop
