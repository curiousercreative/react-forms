import React from 'react';

import F from './TestHelper';

describe('getValue method', () => {
  test('getValue should return correct value', () => {
    expect(F.render().getValue('a')).toEqual('b');
  });
});
