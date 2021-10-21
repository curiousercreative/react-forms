import React from 'react';
import { Form, SubmitButton, validator } from '@curiouser/react-forms';
import { TextField } from '@curiouser/react-forms';

import AutoSuggestCats from './AutoSuggestCats';

export default class FormExtended extends Form {
  static defaultProps = {
    ...Form.defaultProps,
    validations: [{
      names: [ 'username' ],
      tests: [[ validator.tests.required, validator.messages.required ]],
    }],
  };

  handleSubmit () {
    alert(`form state: ${JSON.stringify(this.getData())}`);
  }

  render () {
    return super.render(
      <div className="form-extended form">
        <TextField label="username" name="username" />
        <AutoSuggestCats label="Cats!" name="cat" />
        <SubmitButton onClick={this.handleSubmit.bind(this)}>Check form state</SubmitButton>
      </div>
    );
  }
}
