import React from 'react';
import FormContext from './config/FormContext.js';

import Error from '../model/Error.js';

import arrayify from '../lib/transformers/arrayify.js';
import exists from '../util/exists.js';

/**
 * @param       {object[]} [errors] - { name, error }
 * @param       {boolean} [includeFieldErrors=false] by default, we're filtering out field errors
 * @returns     {jsx} ul.form__errors
 */
export default function Errors ({ errors, includeFieldErrors = false }) {
  const ctx = React.useContext(FormContext);

  // use props.errors or grab from context
  // errors in context are already normalized, but props.errors require normalizing
  errors = exists(errors) ? arrayify(errors).map(Error.normalize) : ctx.state.errors;

  if (!errors) console.error(new Error('You are attempting to render errors without an uptree Form and without errors supplied. Please supply an errors prop or render as a descendant of a Form'));

  // optionally including field errors (yes, there's a lot of confusing negative logic here)
  try {
    if (!includeFieldErrors) errors = errors.filter(({ name }) => !name);
  }
  catch (e) { console.error(e); }

  return (
    <ul className="form__errors">
      {errors
        .map(({ error }) => error)
        .sort()
        .map(e => (
          <li className="form__error" key={e}>{e}</li>
        ))
      }
    </ul>
  );
}
