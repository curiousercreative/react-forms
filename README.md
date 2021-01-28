# @curiouser/react-forms

## Features
- boilerplate-free field label and error rendering
- validation tests and error messages as data and functions with support for validations conditioned upon form data
- library of common form fields with support for supplying your own field components
- use default store (component state) or supply your own functions describing how to write field values (you're responsible for supplying a `values` prop)
- model first architecture-ready; bundle validations and data transformations into a single prop
- observable
- toggle `validateAsYouGo`
- support for complex form data structures including collections, nested objects and collections, etc
- support for collections with boilerplate management of persistent and temporary data

## Install
### NPM
```bash
npm add @curiouser/react-forms@curiousercreative/react-forms
```

### Yarn
Be sure to use this full GitHub URL while this [yarn bug](https://github.com/yarnpkg/yarn/issues/8238) exists.
```bash
yarn add @curiouser/react-forms@https://github.com/curiousercreative/react-forms
```

## Usage
### Render a simple form
A simple login form with validation that requires both fields to be filled in and a password of at least 6 characters.

#### As a functional component (in the future hooks may be available)

```javascript
import React from 'react';

import { Form, validator } from '@curiouser/react-forms';
import { PasswordField, TextField } from '@curiouser/react-forms';
import '@curiouser/react-forms/dist/index.css';

const formProps = {
  formName: 'my-form',
  initialValues: {
    password: '',
    username: '',
  },
  validations: [{
    names: [ 'username', 'password' ],
    tests: [[ validator.tests.required, validator.messages.required ]],
  }, {
    names: [ 'password' ],
    tests: [[ validator.tests.minLength(6), validator.messages.minLength(6) ]],
  }],
}

export default function MyForm () {
  const form = React.useRef();

  const handleSubmit = React.useCallback(() => {
    if (!form.current.validate() || form.current.state.isLoading) return;

    const formData = form.current.getData();

    // do something with formData...
  }, []);

  return (
    <Form ref={form} {...formProps}>
      <form onSubmit={handleSubmit}>
        <div className="form__fields">
          <TextField label="Name" name="username" />
          <PasswordField label="Password" name="password" />
        </div>
        <button type="submit">Sign in</button>
      </form>
    </Form>
  );
}
```

#### As a class component leveraging inheritance
```javascript
import React from 'react';

import { Form, util, validator } from '@curiouser/react-forms';
import { PasswordField, TextField } from '@curiouser/react-forms';
import '@curiouser/react-forms/dist/index.css';

class MyForm extends Form {
  static defaultProps = {
    ...Form.defaultProps,
    formName: 'my-form',
    initialValues: {
      password: '',
      username: '',
    },
    validations: [{
      names: [ 'username', 'password' ],
      tests: [[ validator.tests.required, validator.messages.required ]],
    }, {
      names: [ 'password' ],
      tests: [[ validator.tests.minLength(6), validator.messages.minLength(6) ]],
    }],
  };

  constructor (...args) {
    super(...args);
    util.bindMethods(this);
  }

  handleSubmit () {
    if (!this.validate() || this.state.isLoading) return;

    const formData = this.getData();

    // do something with formData...
  }

  render () {
    return super.render(
      <form className="form" onSubmit={this.handleSubmit}>
        <div className="form__fields">
          <TextField label="Name" name="username" />
          <PasswordField label="Password" name="password" />
        </div>
        <button type="submit">Sign in</button>
      </form>
    );
  }
}
```

### More examples in the repo
Run all of the form examples in your browser with `yarn start`. Here are some common examples:
- [Store form data elsewhere (redux perhaps)](https://github.com/curiousercreative/react-forms/blob/master/example/src/components/FormDirect.jsx)
- [Render a more complex form with a nested data structure](https://github.com/curiousercreative/react-forms/blob/master/example/src/components/Nested.jsx)

### Extending with your own form field components
Form fields are broken into two, one representing the field (with label, error messaging and className generation) and the actual input/control component.

#### Field component
```javascript
import React from 'react';
import Field from 'form/dist/components/fields/Field.jsx';
import NativeSelect from './NativeSelect.jsx';

export default function NativeSelectField (props) {
  return <Field {...props} ref={props.forwardedRef} component={NativeSelect} type="select" />
}
```

#### Input/Control component
```javascript
import React from 'react';
import { util } from '@curiouser/react-forms';

export default function NativeSelect ({ forwardedRef, getValue, id, options, placeholder, required = true, setValue }) {
  const handleChange = React.useCallback((e) => setValue(e.target.value), [ setValue ]);

  return (
    <select id={id} onChange={handleChange} ref={forwardedRef} value={getValue()}>
      {util.renderIf(placeholder, () => (
        <option disabled={required} value="">{placeholder}</option>
      ))}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
```

### Styles
You're responsible for importing or linking the stylesheet with `import '@curiouser/react-forms/dist/index.css';` or any other way you like, it's just a css file. The package styles don't try to do anything pretty for you, just provide functional styles. Class names try to follow the [BEM naming convention](http://getbem.com/naming/).

## License

MIT © [curiousercreative](https://github.com/curiousercreative)
