import React from 'react';

import defaultModel from '../lib/form/models/defaultModel.js';

import Form from '../components/Form';

export default function useForm ({
  className,
  errors,
  formName,
  index,
  initialValues,
  model,
  name,
  pubsub,
  store,
  validateAsYouGo,
  validations,
}) {
  // TODO: do we need to support instance injection?
  model = React.useMemo(() => mergeObject(){
    const m = model || defaultModel;
    if (validations) model.validations = validations;
  }, [ model, validations ]);

  return {
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
  }
