import React from 'react';

/**
 * @class Fields
 * @param       {React.Children} children
 * @param       {string} [className='']
 * @param       {boolean} [equalWidth = true] - whether to allocate equal width for each field
 * @returns     {jsx} .form__fields
 */
export default function Fields ({ children, className = '', equalWidth = true }) {
  const classes = className.split(' ').concat('form__fields');

  if (equalWidth) {
    const count = React.Children.count(children);
    classes.push(`form__fields--count_${count}`);
  }

  return <div className={classes.join(' ')}>{children}</div>;
}
