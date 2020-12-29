import React from 'react';
import { Form, SubmitButton } from '@curiouser/react-forms';
import { TextField } from '@curiouser/react-forms';

export default class FormExtended extends Form {
  handleSubmit () {
    alert(`form state: ${JSON.stringify(this.getData())}`);
  }

  render () {
    return super.render(
      <div className="form-extended form">
        <TextField label="username" name="username" />
        <SubmitButton onClick={this.handleSubmit.bind(this)}>Check form state</SubmitButton>
      </div>
    );
  }
}
