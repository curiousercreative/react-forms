import React from 'react';
import { Fields, Form, FormCollection, SubmitButton, util, validator } from 'form';

export default class FormDirect extends React.Component {
  handleSubmit () {
    alert(`form state: ${JSON.stringify(this.refs.form.getData())}`);
  }

  render () {
    return (
      <div className="form-direct">
        <Form ref="form">
          <Fields.TextField label="username" name="username" />
          <SubmitButton onClick={this.handleSubmit.bind(this)}>Check form state</SubmitButton>
        </Form>
      </div>
    );
  }
}
