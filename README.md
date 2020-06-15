# form

## Install

```bash
yarn add @curiouser/react-forms
```

## Usage
### Render a simple form
A simple login form with validation that requires both fields to be filled in and a password of at least 6 characters.
```jsx
import React from 'react';

import { Fields, Form, util, validator } from 'form';
import 'form/dist/index.css';

class MyForm extends Form {
  static defaultProps = {
    ...Form.defaultProps,
    validations: [{
      names: [ 'username', 'password' ],
      tests: [[ validator.tests.required, validator.messages.required ]],
    }, {
      names: [ 'password' ],
      tests: [[ validator.tests.minLength(6), validator.messages.minLength(6) ]],
    }],
    values: {
      username: '',
      password: '',
    },
  };

  constructor (...args) {
    super(..args);
    util.bindMethods(this);
  }

  handleSubmit () {
    if (!this.validate() || this.state.isLoading) return;

    const formData = this.getData();

    // do something with formData...
  }

  render() {
    return super.render(
      <form className="form" onSubmit={this.handleSubmit}>
        <div className="form__fields">
          <Fields.TextField label="Name" name="username" />
          <Fields.PasswordField label="Password" name="password" />
        </div>
        <button type="submit">Sign in</button>
      </form>
    );
  }
}
```

### Extending with your own form field components
Form fields are broken into two, one representing the field (with label and error messaging) and the actual input/control component.

#### Field component
```jsx
import React from 'react';
import Field from 'form/dist/components/fields/Field.jsx';
import NativeSelect from './NativeSelect.jsx';

export default function NativeSelectField (props) {
  return <Field {...props} component={NativeSelect} type="select" />
}
```

#### Input/Control component
```jsx
import React from 'react';
import { util } from '@curiouser/react-forms';

export default function NativeSelect ({ getValue, id, options, placeholder, required = true, setValue }) {
  const handleChange = React.useCallback((e) => setValue(e.target.value), [ setValue ]);

  return (
    <select id={id} onChange={handleChange} value={getValue()}>
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
You're responsible for including the stylesheet as a CSS module with `import 'form/dist/index.css';` or any other way you like, it's just a css file. The package styles don't try to do anything pretty for you, just provide functional styles. Class names try to follow the BEM model.

## License

MIT © [curiousercreative](https://github.com/curiousercreative)
