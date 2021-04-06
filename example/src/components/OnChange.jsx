import React from 'react';

import { Form } from '@curiouser/react-forms';
import { PasswordField, TextField } from '@curiouser/react-forms';
import '@curiouser/react-forms/dist/index.css';

function log (label) {
  return (...args) => console.log(label, ...args);
}

export default function ParentComponent (props) {
  return (
    <div className="parent-component">
      <Form onChange={log('form updated, here is what form.props.onChange handler will receive:')}>
        <TextField label="username" name="username" onChange={log('username field updated:')} />
        <PasswordField label="password" name="password" onChange={log('password field updated:')} />
      </Form>
    </div>
  );
}
