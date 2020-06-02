import React from 'react';
import renderer from 'react-test-renderer';

import Form from '../Form.jsx';

describe('Form shouldRespondToValuesUpdatedInProps prop', () => {
  test('Form should not respond to incoming values by default', () => {
    const rendered = renderer.create(<Form values={{ a: 'b' }} />);
    rendered.update(<Form values={{ a: 'c' }} />);

    expect(rendered.getInstance().getValue('a')).toBe('b');
  });

  test('Form should respond to incoming values if flag set', () => {
    const rendered = renderer.create(<Form shouldRespondToValuesUpdatedInProps values={{ a: 'b' }} />);
    rendered.update(<Form values={{ a: 'c' }} />);

    // incoming values updating isn't usually synchronous
    setTimeout(() => expect(rendered.getInstance().getValue('a')).toBe('c'), 60);
  });

  test('Form should publish a message when incoming values have been updated', () => {
    const fn = jest.fn();
    const rendered = renderer.create(<Form shouldRespondToValuesUpdatedInProps values={{ a: 'b' }} />);
    const form = rendered.getInstance();
    form.pubsub.on('valuesUpdatedFromProps', fn);
    rendered.update(<Form shouldRespondToValuesUpdatedInProps values={{ a: 'c' }} />);

    // valuesUpdatedFromProps isn't exactly synchronous
    setTimeout(() => expect(fn).toBeCalled(), 60);
  });
});
