import React from 'react';
import { Errors, Fields, Form, SubmitButton, validator } from '@curiouser/react-forms';
import { SelectField, TextField } from '@curiouser/react-forms';

const keySelector = opt => opt.label;
const options = [
  { label: 'yes', value: true },
  { label: 'no', value: false },
];

export default function FormDirect (props) {
  const form = React.useRef();
  const inputRef = React.useRef();
  const [ values, setValues ] = React.useState({});
  const model = React.useMemo(() => ({
    validations: [{
      names: [ 'phone', 'username', 'is_subscribed' ],
      tests: [[ validator.tests.required, validator.messages.required ]],
    }],
  }), []);
  const store = React.useMemo(() => ({
    setValue: (key, value) => setValues({ ...values, [key]: value }),
  }), [ values ]);

  const handleSubmit = React.useCallback(() => {
    alert(`form state: ${JSON.stringify(form.current.getData())}`);
  }, []);

  React.useEffect(() => {
    inputRef.current.focus();
  }, []);

  return (
    <div className="form-direct">
      <Form model={model} ref={form} store={store} values={values}>
        <Errors />
        <Fields>
          <TextField forwardedRef={inputRef} label="username" name="username" />
          <TextField label="phone" name="phone" />
          <SelectField name="is_subscribed" options={options} optionKeySelector={keySelector} placeholder="Select me" />
          <SubmitButton onClick={handleSubmit}>Check form state</SubmitButton>
        </Fields>
      </Form>
    </div>
  );
}
