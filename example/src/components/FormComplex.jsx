import React from 'react';
import { Fields, Form, FormCollection, SubmitButton, util, validator } from 'form';
import NativeSelectField from './NativeSelectField.jsx';

import FormCollectionExtended from './FormCollectionExtended.jsx';
import FormExtended from './FormExtended.jsx';

export default class FormComplex extends Form {
  static defaultProps = {
    ...Form.defaultProps,
    values: {
      native_select: '',
    },
  }
  getData () {
    let refsData = {};

    try {
      refsData = {
        cast: this.refs.cast.getData(),
        movie: this.refs.movie.getData(),
        user: this.refs.user.getData(),
      };
    }
    catch (e) {}

    return {
      ...refsData,
      ...super.getData(),
    }
  }

  handleSubmit () {
    alert(`form state: ${JSON.stringify(this.getData())}`);
  }

  render () {
    return super.render(
      <div className="form form-complex">
        <Form ref="movie">
          <div className="form__fields">
            <Fields.TextField label="Title" name="title" />
            <Fields.TextField label="Year" name="year" />
          </div>
        </Form>

        <FormExtended ref="user" />

        <FormCollectionExtended ref="cast" />

        <div className="form__fields">
          <Fields.EmailField label="email" name="email" />
          <Fields.TextField label="extra text" name="extra_text" />
          <Fields.SelectField label="extra select" name="extra_select" options={[{ label: 'Label', value: 'value' }]} />
          <Fields.RadioField label="extra radio" name="extra_radio" value="radio on" />
          <Fields.CheckboxField label="extra checkbox" name="extra_checkbox" value="checkbox on" />
        </div>
        <Fields.TextareaField label="extra textarea" name="extra_textarea" />
        <NativeSelectField label="native select" name="native_select" options={[{ label: 'Something something', value: 'yes' }, { label: 'and another', value: 'no' }]} />
        <SubmitButton onClick={this.handleSubmit.bind(this)}>Check form state</SubmitButton>
      </div>
    );
  }
}
