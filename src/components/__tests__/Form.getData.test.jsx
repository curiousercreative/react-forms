import React from 'react';

import F from './TestHelper';

describe('getData method', () => {
  test('getData should return values given as props', () => {
    expect(F.render().getData()).toEqual({ a: 'b' });
  });

  test('getData should return values updated internally after mount', () => {
    const form = F.render();
    form.setValue('a', 'c');

    expect(form.getData()).toEqual({ a: 'c' });
  });

  test('getData should return values added internally after mount', () => {
    const form = F.render();
    form.setValue('c', 'd');

    expect(form.getData()).toEqual({ a: 'b', c: 'd' });
  });

  test('getData override to return props', () => {
    // create a new component
    const Component = F.extendForm({
      getData () {
        return this.props.values;
      },
    });
    // mount component
    const form = F.render(<Component values={{ a: 'b' }} />);
    // update value internally
    form.setValue('a', 'c');

    // expect that our getData
    expect(form.getData()).toEqual({ a: 'b' });
  });
});
