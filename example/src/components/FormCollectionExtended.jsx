import React from 'react';
import { FormCollection } from '@curiouser/react-forms';
import { Fields, PasswordField, SelectField, TagSelectorField, TextField } from '@curiouser/react-forms';

const FRUITS = [
  { label: 'apple', value: 'japple' },
  { label: 'banana', value: 'zbanana' },
  { label: 'pear', value: 'pear' },
  { label: 'cantelope', value: 'cantelope' },
  { label: 'grapes', value: 'grapes' },
  { label: 'peach', value: 'peach' },
  { label: 'grapefruit', value: 'grapefruit' },
];

const User = React.forwardRef(function User ({ index, handleClickRemove }, ref) {
  return (
    <div className="form-collection-extended__item">
      <Fields>
        <TextField index={index} label="username" name="username" />
        <PasswordField index={index} label="password" name="password" />
        <SelectField index={index} label="select" name="select" options={[{ label: '1', value: 1 }, { label: '2', value: 2 }]} forwardedRef={ref} />
        <TagSelectorField index={index} label="tag select" name="tag" options={FRUITS} />
        <button onClick={handleClickRemove} type="button" value={index}>remove</button>
      </Fields>
    </div>
  );
});

export default class FormCollectionExtended extends FormCollection {
  static defaultProps = {
    ...FormCollection.defaultProps,
    defaultValues: {
      username: '',
      password: '',
      select: '',
      tag: [],
    },
  };

  handleSubmit () {
    alert(`form state: ${JSON.stringify(this.getData())}`);
  }

  render () {
    return (
      <div className="form form-collection-extended">
        {super.render(User)}
        <button onClick={this.handleClickAdd} type="button">Add</button>
        <button onClick={this.handleSubmit}>Check form state</button>
      </div>
    );
  }
}
