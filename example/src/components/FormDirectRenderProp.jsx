import React from 'react';
import { Form, SubmitButton } from '@curiouser/react-forms';
import { TextField } from '@curiouser/react-forms';

export default class FormDirect extends React.Component {
  formRef = React.createRef();
  handleSubmit () {
    alert(`form state: ${JSON.stringify(this.formRef.getData())}`);
  }

  render () {
    return (
      <div className="form-direct">
        <Form ref={this.formRef}>
          {({ values }) => (
            <>
              {values.username ? `you entered username ${values.username}` : 'no username entered' }
              <TextField label="username" name="username" />
              <SubmitButton onClick={this.handleSubmit.bind(this)}>Check form state</SubmitButton>
            </>
          )}
        </Form>
      </div>
    );
  }
}
