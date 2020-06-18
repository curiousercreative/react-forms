import React from 'react';

const FormContext = React.createContext({
  actions: {},
  form: {},
  pubsub: {},
  state: {
    errors: [],
    values: {},
  },
});
FormContext.displayName = 'Form';

export default FormContext;
