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
    const store = {
      setValue (name, val) {
        someState[name] = val;
        return Promise.resolve();
      },
    };

    // create a new component
    const Component = F.extendForm();
    // mount component
    const form = F.render(<Component initialValues={someState} store={store} />);
    // update value internally
    form.setValue('a', 'c');

    // expect that our getData
    expect(someState.a).toEqual('c');
  });

  test('setValue should use setValueFor method when provided', () => {
    let someState = { first_name: 'charles' };
    const store = {
      setValueForFirstName (val) {
        someState.first_name = val;

        return Promise.resolve();
      },
    };

    // create a new component
    const Component = F.extendForm();
    // mount component
    const form = F.render(<Component initialValues={someState} store={store} />);
    form.setValue('first_name', 'chuck');

    expect(someState.first_name).toEqual('chuck');
  });

  test('setValue should use cleanValueFor method when provided', () => {
    const model = {
      cleanValueForFirstName (val) {
        return val.toLowerCase();
      },
    };
    // create a new component
    const Component = F.extendForm();
    // mount component
    const form = F.render(<Component initialValues={{ first_name: 'BOB' }} model={model} />);
    return form.setValueFromField('first_name', 'CHUCK')
      .then(() => {
        expect(form.getValue('first_name')).toEqual('chuck');
      });
  });
});
