import React from 'react';

/**
 * @class Fields
 * @param       {React.Children} children
 * @param       {string} [className='']
 * @param       {boolean} [equalWidth = true] - whether to allocate equal width for each field
 * @param       {boolean} [gapless = false]
 * @returns     {jsx} .form__fields
 */
export default function Fields ({ children, className = '', equalWidth = true, gapless = false }) {
  const classes = className.split(' ').concat('form__fields');

  if (equalWidth) {
    const count = React.Children.count(children);
    classes.push(`form__fields--count_${count}`);
  }

  classes.push(gapless ? 'form__fields--no_gaps' : 'form__fields--with_gaps');

  return <div className={classes.join(' ')}>{children}</div>;
}
