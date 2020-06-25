import React from 'react';
import { Fields, Form, FormCollection, SubmitButton, util, validator } from '@curiouser/react-forms';

const User = React.forwardRef(function User ({ index, handleClickRemove }, ref) {
  return (
    <div className="form-collection-extended__item">
      <div className="form__fields">
        <Fields.TextField index={index} label="username" name="username" />
        <Fields.PasswordField index={index} label="password" name="password" />
        <Fields.SelectField index={index} label="select" name="select" options={[{ label: '1', value: 1 }, { label: '2', value: 2 }]} forwardedRef={ref} />
        <Fields.TagSelectorField index={index} label="tag select" name="tag" options={[{ label: '1', value: 1 }, { label: '2', value: 2 }]} />
        <button onClick={handleClickRemove} type="button" value={index}>remove</button>
      </div>
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
