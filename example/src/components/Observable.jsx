import React from 'react';

import { Form, pubsub as _pubsub } from '@curiouser/react-forms';
import { PasswordField, TextField } from '@curiouser/react-forms';
import '@curiouser/react-forms/dist/index.css';

// const pubsub = _pubsub.pubsub; // use shared pubsub instance
const pubsub = new _pubsub.Pubsub(); // create discrete pubsub instance

export default function ParentComponent (props) {
  const [ password, setPassword ] = React.useState();

  // listen for form updates to relay to state
  React.useEffect(() => {
    // subscribe to any field update
    pubsub.on('field.updated', console.log);
    // subscribe to a single field update
    pubsub.on('field.updated.password', console.log);
    // subscribe to updates to form data
    pubsub.on('form.updated', formData => {
      console.log(formData);
      setPassword(formData.password);
    });
  }, []);

  return (
    <div className="parent-component">
      <span>You entered "{password}" for password</span>

      <Form pubsub={pubsub}>
        <TextField label="username" name="username" />
        <PasswordField label="password" name="password" />
      </Form>
    </div>
  );
}
