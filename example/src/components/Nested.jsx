import React from 'react';

import { Form, FormCollection, validator } from '@curiouser/react-forms';
import { PasswordField, TextField } from '@curiouser/react-forms';

const formProps = {
  formName: 'my-form',
  initialValues: {
    details: {
      age: 8,
      favorite_color: 'blue',
      favorite_dinner_combos: [],
    },
    password: 'xxxxxx',
    username: 'coolguy95',
  },
  model: instance => ({
    getValidations () {
      return [{
        names: [ 'username', 'password' ],
        tests: [[ validator.tests.required, validator.messages.required ]],
      }, {
        names: [ 'password' ],
        tests: [[ validator.tests.minLength(6), validator.messages.minLength(6) ]],
      }];
    },
  }),
}

const dinnerComboDefaults = {
  beverage: '',
  entree: '',
  meta: {},
};


/**
 * @param       {function} handleClickRemove
 * @param       {number} index
 * @return      {jsx}
 */
const DinnerCombo = React.forwardRef(function ({ handleClickRemove, index }, forwardedRef) {
  return (
    <div>
      <div className="form__fields">
        <TextField index={index} label="Beverage" name="beverage" forwardedRef={forwardedRef} />
        <TextField index={index} label="Entrée" name="entree" />
      </div>
      <Form formName="meta" index={index} name="meta">
        <TextField label="Meta - date added" name="date_added" />
      </Form>
      <button onClick={handleClickRemove} type="button">remove</button>
    </div>
  );
});

export default function MyForm () {
  const collection = React.useRef();
  const form = React.useRef();

  const handleClickAdd = React.useCallback(() => {
    collection.current.handleClickAdd();
  }, []);

  const handleSubmit = React.useCallback(() => {
    if (!form.current.validate() || form.current.state.isLoading) return;

    const formData = form.current.getData();

    // do something with formData...
    alert(JSON.stringify(formData));
  }, []);

  return (
    <Form ref={form} {...formProps}>
      <form onSubmit={handleSubmit}>
        <div className="form__fields">
          <TextField label="Name" name="username" />
          <PasswordField label="Password" name="password" />
        </div>
        <h4>User Details</h4>
        <Form formName="user-details" name="details">
          <div className="form__fields">
            <TextField label="Age" name="age" />
            <TextField label="Favorite Color" name="favorite_color" />
          </div>

          <h5>Favorite dinner combos</h5>
          <FormCollection
            component={DinnerCombo}
            defaultValues={dinnerComboDefaults}
            formName="user-combos"
            name="favorite_dinner_combos"
            ref={collection}>
            <button onClick={handleClickAdd} type="button">Add dinner combo</button>
          </FormCollection>
        </Form>
        <button type="submit">Sign in</button>
      </form>
    </Form>
  );
}
