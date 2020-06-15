import React from 'react';

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
 * NOTE: must be a controlled input (props.value and props.onChange
 * @param       {object} props
 * @param       {function} ref
 * @returns     {jsx} fragment wrapping an input and span
 */
export default React.forwardRef(function AutosizeInput (props, ref) {
  const spanEl = React.useRef(null);
  const [ width, setWidth ] = React.useState('auto');

  // on mount and every render
  React.useEffect(() => {
    const el = spanEl.current;
    const minWidth = typeof props.minWidth === 'number'
      ? props.minWidth
      : MIN_WIDTH;

    // sync the value of the span with the input value
    el.textContent = props.value || props.placeholder;
    // update our width in state that will be relayed to our input
    setWidth(`${Math.max(minWidth, el.offsetWidth)}px`);
  });

  return (
    <React.Fragment>
      <input ref={ref} {...props} style={{ ...props.style, width }} />
      <span className={props.className} ref={spanEl} style={HIDE_STYLES}>{props.value}</span>
    </React.Fragment>
  );
});
