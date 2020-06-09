import React from 'react';
import { Fields, Form, FormCollection, SubmitButton, util, validator } from '@curiouser/react-forms';

export default class FormCollectionExtended extends FormCollection {
  static defaultProps = {
    ...FormCollection.defaultProps,
    defaultValues: {
      username: '',
      password: '',
    },
  };

  constructor (...args) {
    super(...args);
    util.bindMethods(this);
  }

  handleSubmit () {
    alert(`form state: ${JSON.stringify(this.getData())}`);
  }

  render () {
    return (
      <div className="form form-collection-extended">
        {super.render(User)}
        <button onClick={this.handleClickAdd} type="button">Add</button>
        <button onClick={this.handleSubmit}>Check form state</button>
      </div>
    );
  }
}

function User ({ index, handleClickRemove }) {
  return (
    <div className="form-collection-extended__item">
      <div className="form__fields">
        <Fields.TextField index={index} label="username" name="username" />
        <Fields.PasswordField index={index} label="password" name="password" />
        <button onClick={handleClickRemove} type="button" value={index}>remove</button>
      </div>
    </div>
  );
}
