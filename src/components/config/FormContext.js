import React from 'react';

const FormContext = React.createContext({
  actions: {},
  state: {
    errors: [],
    form: {},
    values: {},
  },
});
FormContext.displayName = 'Form';

export default FormContext;
