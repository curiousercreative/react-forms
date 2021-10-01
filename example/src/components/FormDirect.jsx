import React from 'react';
import { Fields, Form, SubmitButton, validator } from '@curiouser/react-forms';
import { SelectField, TextField } from '@curiouser/react-forms';

const keySelector = opt => opt.label;
const options = [
  { label: 'yes', value: true },
  { label: 'no', value: false },
];

export default function FormDirect (props) {
  const form = React.useRef();
  const [ values, setValues ] = React.useState({
    is_subscribed: false,
  });
  const model = React.useMemo(() => ({
    validations: [{
      names: [ 'phone', 'username' ],
      tests: [[ validator.tests.required, validator.messages.required ]],
    }],
  }), []);
  const store = React.useMemo(() => ({
    setValue: (key, value) => setValues({ ...values, [key]: value }),
  }), [ values ]);

  const handleSubmit = React.useCallback(() => {
    alert(`form state: ${JSON.stringify(form.current.getData())}`);
  }, []);

  return (
    <div className="form-direct">
      <Form model={model} ref={form} store={store} values={values}>
        <Fields>
          <TextField label="username" name="username" />
          <TextField label="phone" name="phone" />
          <SelectField name="is_subscribed" options={options} optionKeySelector={keySelector} />
          <SubmitButton onClick={handleSubmit}>Check form state</SubmitButton>
        </Fields>
      </Form>
    </div>
  );
}
