import React from 'react';
import { Fields, Form, FormCollection, SubmitButton, util, validator } from '@curiouser/react-forms';

export default class FormCollectionDirect extends React.Component {
  constructor (...args) {
    super(...args);
    util.bindMethods(this);
  }

  handleClickAdd (...args) {
    this.refs.collection.handleClickAdd(...args);
  }

  handleSubmit () {
    alert(`form state: ${JSON.stringify(this.refs.collection.getData())}`);
  }

  render () {
    return (
      <div className="form form-collection-extended">
        <FormCollection ref="collection" {...this.props} component={User} />
        <button onClick={this.handleClickAdd} type="button">Add</button>
        <button onClick={this.handleSubmit}>Check form state</button>
      </div>
    );
  }
}

function User ({ index, username, password }) {
  return (
    <div className="form-collection-extended__item" key={index}>
      <div className="form__fields">
        <Fields.TextField index={index} label="username" name="username" />
        <Fields.PasswordField index={index} label="password" name="password" />
      </div>
    </div>
  );
}
