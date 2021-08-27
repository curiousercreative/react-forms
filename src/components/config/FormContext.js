import React from 'react';

const FormContext = React.createContext({
  actions: {},
  form: {},
  pubsub: {},
  state: {
    errors: [],
    formName: '',
    isLoading: true,
    isValid: true,
    validateAsYouGo: true,
    values: {},
  },
});
FormContext.displayName = 'Form';

export default FormContext;
