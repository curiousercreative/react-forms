import React from 'react';

import F from './TestHelper';

describe('getValue method', () => {
  test('getValue should return correct value', () => {
    expect(F.render().getValue('a')).toEqual('b');
  });

  test('getValue should use getValueFor method when provided', () => {
    let someState = { first_name: 'charles' };
    const store = {
      getValueForFirstName () {
        return someState.first_name;
      },
    };
    // create a new component
    const Component = F.extendForm();
    // mount component
    const form = F.render(<Component initialValues={{ first_name: 'david' }} store={store} />);

    // expect that our getData
    expect(form.getValue('first_name')).toEqual('charles');
  });

  test('getValue should use formatValue method when provided', () => {
    const model = {
      formatValueForFirstName (val) {
        return (val || '').toUpperCase();
      },
    };

    // create a new component
    const Component = F.extendForm();
    // mount component
    const form = F.render(<Component initialValues={{ first_name: 'david' }} model={model} />);

    // expect that our getData
    expect(form.formatData(form.store.values()).first_name).toEqual('DAVID');
  });
});
