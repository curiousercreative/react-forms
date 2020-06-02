import React from 'react';
import { Fields, Form, FormCollection, SubmitButton, util, validator } from 'form';

import FormCollectionExtended from './FormCollectionExtended.jsx';
import FormExtended from './FormExtended.jsx';

export default class FormComplex extends Form {
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
      <div className="form-complex">
        <Form ref="movie">
          <Fields.TextField label="Title" name="title" />
          <Fields.TextField label="Year" name="year" />
        </Form>

        <FormExtended ref="user" />

        <FormCollectionExtended ref="cast" />

        <Fields.EmailField label="email" name="email" />
        <Fields.TextField label="extra text" name="extra_text" />
        <Fields.SelectField label="extra select" name="extra_select" options={[{ label: 'Label', value: 'value' }]} />
        <Fields.RadioField label="extra radio" name="extra_radio" value="radio on" />
        <Fields.CheckboxField label="extra checkbox" name="extra_checkbox" value="checkbox on" />
        <SubmitButton onClick={this.handleSubmit.bind(this)}>Check form state</SubmitButton>
      </div>
    );
  }
}
