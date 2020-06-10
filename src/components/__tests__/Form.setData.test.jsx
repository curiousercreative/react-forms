import React from 'react';

import F from './TestHelper';

describe('setData method', () => {
  test('setData argument should be returned by getData', () => {
    const form = F.render();
    const data = { a: 'c' };
    form.setData(data);

    expect(form.getData()).toEqual(data);
  });

  test('setData method should return a promise', () => {
    expect(F.render().setData({ a: 'c' })).toBeInstanceOf(Promise);
  });

  test('setData should overwrite entire form state', () => {
    let valuesA = {
      a: 'b',
      b: 'c',
      c: 'd',
    };

    const valuesB = {
      a: 'd',
    };

    // mount component
    const form = F.render();

    form.setData(valuesA);
    expect(form.getData()).toEqual(valuesA);

    form.setData(valuesB);
    expect(form.getValue('b')).not.toBeDefined();
  });
});
