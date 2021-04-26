import React from 'react';
import FormContext from './config/FormContext.js';

/**
 * @param       {object[]} [errors] - { name, error }
 * @param       {boolean} [includeFieldErrors=false] by default, we're filtering out field errors
 * @returns     {jsx} ul.form__errors
 */
export default function Errors ({ errors, includeFieldErrors = false }) {
  const ctx = React.useContext(FormContext);

  // TODO: test this warning
  if (!errors && !ctx.form.getErrors) console.error(new Error('You are attempting to render errors with an uptree Form and without errors supplied. Please supply an errors prop or render as a descendant of a Form'));

  // use props.errors or grab from context
  errors = errors || ctx.state.errors;
  // optionally including field errors
  errors = includeFieldErrors ? errors : ctx.filter(({ name }) => !name);

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
