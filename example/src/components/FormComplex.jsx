import React from 'react';
import { Fields, Form, SubmitButton, util, validator } from '@curiouser/react-forms';
import NativeSelectField from './NativeSelectField.jsx';

import FormCollectionExtended from './FormCollectionExtended.jsx';
import FormExtended from './FormExtended.jsx';

const OPTIONS = [
  { label: 'apple', value: 'apple' },
  { label: 'banana', value: 'banana' },
  { label: 'pear', value: 'pear' },
  { label: 'cantelope', value: 'cantelope' },
  { label: 'grapes', value: 'grapes' },
  { label: 'peach', value: 'peach' },
  { label: 'grapefruit', value: 'grapefruit' },
];

export default class FormComplex extends Form {
  constructor (...args) {
    super(...args);
    util.bindMethods(this);

    this.store.initData({
      cast: this.props.collectionProps.values || [],
      director: {},
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
            <Fields.TextField label="Title" name="title" />
            <Fields.TextField label="Year" name="year" />
          </div>
          <Form name="director">
            <div className="form__fields">
              <Fields.TextField label="Name" name="name" />
              <Fields.TextField label="Age" name="age" />
            </div>
          </Form>
        </Form>



        <FormExtended ref="user" />

        <FormCollectionExtended name="cast" />

        <div className="form__fields">
          <Fields.EmailField label="email" name="email" />
          <Fields.TextField label="extra text" name="extra_text" />
          <Fields.SelectField label="extra select" name="extra_select" options={OPTIONS} />
          <Fields.RadioField label="extra radio" name="extra_radio" value="radio on" />
          <Fields.CheckboxField label="extra checkbox" name="extra_checkbox" value="checkbox on" />
        </div>
        <Fields.TextareaField label="extra textarea" name="extra_textarea" />
        <Fields.NativeSelectField label="native select" name="native_select" options={[{ label: 'Something something', value: 'yes' }, { label: 'and another', value: 'no' }]} placeholder="select one..." />
        <Fields.NativeDateField label="native date" name="native_date" placeholder="YYYY-MM-DD" />
        <Fields.TagSelectorField label="tag selector" name="tag_selector" options={OPTIONS} placeholder="Select your favorite fruits!" />
        <SubmitButton onClick={this.handleSubmit.bind(this)}>Check form state</SubmitButton>
      </div>
    );
  }
}
