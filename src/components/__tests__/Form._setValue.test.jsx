import React from 'react';

import F from './TestHelper';

describe('_setValue method', () => {
  test('_setValue should use setValueFor method when provided', () => {
    let someState = { first_name: 'charles' };
    // create a new component
    const Component = F.extendForm({
      setValueForFirstName (val) {
        someState.first_name = val;

        return Promise.resolve();
      },
    });
    // mount component
    const form = F.render(<Component initialValues={someState} />);
    form._setValue('first_name', 'chuck');

    expect(someState.first_name).toEqual('chuck');
  });

  test('_setValue should use cleanValueFor method when provided', () => {
    // create a new component
    const Component = F.extendForm({
      cleanValueForFirstName (val) {
        return val.toLowerCase();
      },
    });
    // mount component
    const form = F.render(<Component initialValues={{ first_name: 'BOB' }} />);
    form._setValue('first_name', 'CHUCK');

    expect(form.getValue('first_name')).toEqual('chuck');
  });
});
