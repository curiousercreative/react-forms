import React from 'react';
import { FormCollection } from '@curiouser/react-forms';
import { PasswordField, TextField } from '@curiouser/react-forms';
import NativeSelectField from './NativeSelectField.jsx';

const OPTIONS = [
  { label: 'yes', value: '1' },
  { label: 'no', value: '0' },
];

function User ({ index, username, password }, ref) {
  console.info('render row')
  return (
    <tr className="form-collection-extended__item" key={index}>
      <td><TextField forwardedRef={ref} inputMode="numeric" index={index} name="username" /></td>
      <td><PasswordField index={index} inputMode="numeric" name="password" /></td>
      <td><NativeSelectField index={index} name="optin" options={OPTIONS} /></td>
    </tr>
  );
}

const CollectionItem = React.forwardRef(User);

export default function FormCollectionTable () {
  const formRef = React.useRef()

  const handleClickAdd = React.useCallback(() => formRef.current.handleClickAdd(), [])


  const handleSubmit = React.useCallback(e => {
    e.preventDefault()
    alert(`form state: ${JSON.stringify(formRef.current.getData())}`);
  }, [])

  return (
    <div className="form form-collection-table">
      <FormCollection component={CollectionItem} ref={formRef} wrapperComponent={Table} />
      <button onClick={handleClickAdd} type="button">Add</button>
      <button onClick={handleSubmit}>Check form state</button>
    </div>
  );
}

function Table ({ className, children }) {
  return <table className={className}>
    <thead>
      <tr>
        <th>Username</th>
        <th>Password</th>
        <th>Opt-in?</th>
      </tr>
    </thead>
    <tbody>
      {children}
    </tbody>
  </table>
}
