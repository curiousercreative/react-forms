import React from 'react';
import { Form, SubmitButton } from '@curiouser/react-forms';
import { TextField } from '@curiouser/react-forms';

export default class FormDirect extends React.Component {
  handleSubmit () {
    alert(`form state: ${JSON.stringify(this.refs.form.getData())}`);
  }

  render () {
    return (
      <div className="form-direct">
        <Form ref="form">
          {() => (
            <>
              <TextField label="username" name="username" />
              <SubmitButton onClick={this.handleSubmit.bind(this)}>Check form state</SubmitButton>
            </>
          )}
        </Form>
      </div>
    );
  }
}
