import React from 'react';
import { Form, SubmitButton } from '@curiouser/react-forms';
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
  const store = React.useMemo(() => ({
    setValue: (key, value) => setValues({ ...values, [key]: value }),
  }), [ values ]);

  const handleSubmit = React.useCallback(() => {
    alert(`form state: ${JSON.stringify(form.current.getData())}`);
  }, []);

  return (
    <div className="form-direct">
      <Form ref={form} store={store} values={values}>
        <TextField label="username" name="username" />
        <TextField label="phone" name="phone" />
        <SelectField name="is_subscribed" options={options} optionKeySelector={keySelector} />
        <SubmitButton onClick={handleSubmit}>Check form state</SubmitButton>
      </Form>
    </div>
  );
}
