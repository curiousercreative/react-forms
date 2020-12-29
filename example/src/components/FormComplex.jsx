import React from 'react';
import { Form, SubmitButton, util, validator } from '@curiouser/react-forms';
import {
  CheckboxField,
  EmailField,
  Fields,
  NativeDateField,
  NativeSelectField,
  RadioField,
  SelectField,
  TagSelectorField,
  TextareaField,
  TextField,
} from '@curiouser/react-forms';

import FormCollectionExtended from './FormCollectionExtended.jsx';
import FormExtended from './FormExtended.jsx';

const NATIVE_OPTIONS = [
  { label: 'Something something', value: 'yes' },
  { label: 'and another', value: { nested: 'no' },
}];
const OPTIONS = [
  { label: 'apple', value: 'japple' },
  { label: 'banana', value: 'zbanana' },
  { label: 'pear', value: 'pear' },
  { label: 'cantelope', value: 'cantelope' },
  { label: 'grapes', value: 'grapes' },
  { label: 'peach', value: 'peach' },
  { label: 'grapefruit', value: 'grapefruit' },
];

export default class FormComplex extends Form {
  static defaultProps = {
    ...Form.defaultProps,
    validations: [{
      names: [ 'email', 'extra_text' ],
      tests: [[ validator.tests.required, validator.messages.required ]],
    }],
  };

  constructor (...args) {
    super(...args);
    util.bindMethods(this);

    this.store.initData({
      cast: [],
      director: {},
      extra_checkbox: true,
      native_select: '',
      tag_selector: [],
    });
  }

  getData () {
    let refsData = {};

    try {
      refsData = {
        director: this.refs.movie.getData().director,
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
            <TextField label="Title" name="title" />
            <TextField label="Year" name="year" />
          </div>
          <Form name="director">
            <div className="form__fields">
              <TextField label="Name" name="name" />
              <TextField label="Age" name="age" />
            </div>
          </Form>
        </Form>



        <FormExtended ref="user" />

        <FormCollectionExtended name="cast" />

        <Fields gapless>
          <EmailField label="email" name="email" />
          <TextField label="extra text" name="extra_text" />
          <SelectField label="extra select" name="extra_select" options={OPTIONS} />
          <RadioField label="extra radio" name="extra_radio" value="radio on" />
          <CheckboxField label="extra checkbox" name="extra_checkbox" />
        </Fields>
        <TextareaField label="extra textarea" name="extra_textarea" />
        <NativeSelectField label="native select" name="native_select" options={NATIVE_OPTIONS} placeholder="select one..." />
        <NativeDateField label="native date" name="native_date" placeholder="YYYY-MM-DD" />
        <TagSelectorField
          label="tag selector"
          name="tag_selector"
          options={OPTIONS}
          placeholder="Select your favorite fruits!"
          resetOnSelect />
        <TagSelectorField
            disabled
            label="tag selector"
            name="tag_selector"
            options={OPTIONS}
            placeholder="Select your favorite fruits!" />
        <SubmitButton onClick={this.handleSubmit.bind(this)}>Check form state</SubmitButton>
      </div>
    );
  }
}
