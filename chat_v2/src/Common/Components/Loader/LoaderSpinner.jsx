import React from 'react';

function LoaderSpinner(props) {
  const color = !Boolean(props.color) ? 'color-tangerin-500' : props.color;
  return (
    <div className={`spinner-border ${color}`} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  );
}

export default LoaderSpinner;
