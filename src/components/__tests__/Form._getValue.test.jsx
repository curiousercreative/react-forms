import React from 'react';

import F from './TestHelper';

describe('_getValue method', () => {
  test('_getValue should return correct value', () => {
    expect(F.render()._getValue('a')).toEqual('b');
  });

  test('_getValue should use getValueFor method when provided', () => {
    let someState = { first_name: 'charles' };
    // create a new component
    const Component = F.extendForm({
      getValueForFirstName () {
        return someState.first_name;
      },
    });
    // mount component
    const form = F.render(<Component initialValues={{ first_name: 'david' }} />);

    // expect that our getData
    expect(form._getValue('first_name')).toEqual('charles');
  });

  test('_getValue should use parseValueFor method when provided', () => {
    // create a new component
    const Component = F.extendForm({
      parseValueForFirstName (val) {
        return (val || '').toUpperCase();
      },
    });
    // mount component
    const form = F.render(<Component initialValues={{ first_name: 'david' }} />);

    // expect that our getData
    expect(form._getValue('first_name')).toEqual('DAVID');
  });
});
