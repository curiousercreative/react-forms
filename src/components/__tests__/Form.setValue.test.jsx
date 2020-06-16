import React from 'react';

import F from './TestHelper';

describe('setValue method', () => {
  test('setValue method should update value', () => {
    const form = F.render();
    form.setValue('a', 'c');

    expect(form.getValue('a')).toEqual('c');
  });

  test('setValue method should return a promise', () => {
    expect(F.render().setValue('a', 'c')).toBeInstanceOf(Promise);
  });

  test('setValue override', () => {
    let someState = { a: 'b' };
    // create a new component
    const Component = F.extendForm({
      setValue (name, val) {
        someState[name] = val;
      },
    });
    // mount component
    const form = F.render(<Component initialValues={someState} />);
    // update value internally
    form.setValue('a', 'c');

    // expect that our getData
    expect(someState.a).toEqual('c');
  });
});
