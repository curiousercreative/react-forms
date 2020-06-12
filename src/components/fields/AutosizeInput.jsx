import React from 'react';
import callMe from '../../util/callMe.js';

const HIDE_STYLES = {
  position: 'absolute',
  height: 0,
  overflow: 'hidden',
  whiteSpace: 'pre',
};

const MIN_WIDTH = 50; // in px

/**
 * AutosizeInput - HOC for an input (text or similar) that should dynamically
 * resize to fit the entered value
 * @param       {object} props
 * @param       {function} ref
 * @returns     {jsx} fragment wrapping an input and span
 */
export default React.forwardRef(function AutosizeInput (props, ref) {
  const spanEl = React.useRef(null);
  const [ width, setWidth ] = React.useState('auto');

  const autosize = React.useCallback((value, el) => {
    const minWidth = typeof props.minWidth === 'number'
      ? props.minWidth
      : MIN_WIDTH;

    // sync the value of the span with the input value
    el.textContent = value;
    // update our width in state that will be relayed to our input
    setWidth(`${Math.max(minWidth, el.offsetWidth)}px`);
  }, [ props.minWidth, setWidth ]);

  const handleChange = React.useCallback(e => {
    // be sure to call our supplied change handler
    callMe(props.onChange, { args: [ e ] });
    // run our autosizer to update the width based on current value
    autosize(e.target.value || props.placeholder, spanEl.current);
  }, [ spanEl, props.onChange, props.placeholder ]);

  // on mount only, set our initial width based on initial value or the placeholder
  React.useEffect(() => autosize(props.value || props.placeholder, spanEl.current), []);

  return (
    <React.Fragment>
      <input ref={ref} {...props} onChange={handleChange} style={{ ...props.style, width }} />
      <span className={props.className} ref={spanEl} style={HIDE_STYLES}>{props.value}</span>
    </React.Fragment>
  );
});
