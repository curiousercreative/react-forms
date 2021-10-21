import { AutoSuggestField } from '@curiouser/react-forms';
import React from 'react';

const CATS = [
  'Cheshire',
  'Garfield',
  'Felix',
  'Tom',
  'Salem',
];

/**
 * @param       {string} [label]
 * @param       {string} name
 * @param       {string} [placeholder]
 */
export default function AutoSuggestCats ({ label, name, placeholder }) {
  const [ query, setQuery ] = React.useState('');
  const options = React.useMemo(() => {
    return query.includes('cat') || CATS.includes(query) ? CATS.map(c => ({ label: c, value: c })) : [];
  }, [ query ]);

  const handleQuery = React.useCallback(setQuery, []);
  const handleSelect = React.useCallback(value => {
    console.log(`${value}, a fine choice!`);
    setQuery(value);

    return Promise.resolve(value);
  }, []);

  return <AutoSuggestField
    label={label}
    name={name}
    onQuery={handleQuery}
    onSelect={handleSelect}
    options={options}
    placeholder="Type 'cat' to see suggestions" />;
}
