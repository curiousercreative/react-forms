import React from 'react';
import { FormCollection, util } from '@curiouser/react-forms';
import { Fields, PasswordField, TextField } from '@curiouser/react-forms';
import NativeSelectField from './NativeSelectField.jsx';

const OPTIONS = [
  { label: 'yes', value: '1' },
  { label: 'no', value: '0' },
];

const User = React.forwardRef(function User ({ index, username, password }, ref) {
  return (
    <div className="form-collection-extended__item" key={index}>
      <Fields>
        <TextField forwardedRef={ref} inputMode="numeric" index={index} label="username" name="username" />
        <PasswordField index={index} inputMode="numeric" label="password" name="password" />
        <NativeSelectField index={index} label="opt-in?" name="optin" options={OPTIONS} />
      </Fields>
    </div>
  );
});

export default class FormCollectionDirect extends React.Component {
  formRef = React.createRef();
  constructor (...args) {
    super(...args);
    util.bindMethods(this);
  }

  handleClickAdd (...args) {
    this.formRef.handleClickAdd(...args);
  }

  handleSubmit () {
    alert(`form state: ${JSON.stringify(this.formRef.getData())}`);
  }

  render () {
    return (
      <div className="form form-collection-extended">
        <FormCollection {...this.props} component={User} ref={this.formRef} />
        <button onClick={this.handleClickAdd} type="button">Add</button>
        <button onClick={this.handleSubmit}>Check form state</button>
      </div>
    );
  }
}
