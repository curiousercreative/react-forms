import React from 'react';
import { Fields, Form, FormCollection, SubmitButton, util, validator } from 'form';

export default class FormExtended extends Form {
  handleSubmit () {
    alert(`form state: ${JSON.stringify(this.getData())}`);
  }

  render () {
    return super.render(
      <div className="form-extended">
        <Fields.TextField label="username" name="username" />
        <SubmitButton onClick={this.handleSubmit.bind(this)}>Check form state</SubmitButton>
      </div>
    );
  }
}
