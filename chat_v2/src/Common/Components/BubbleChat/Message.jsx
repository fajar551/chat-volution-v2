import React from 'react';
import Linkify from '../Linkify/Linkify';

function Message(props) {
  const { message, className } = props;

  if (!Boolean(message)) {
    return <p className="mb-0"></p>;
  } else {
    // Always use white-space: pre-wrap to preserve line breaks
    // Wrap Linkify in a div with style to ensure line breaks are preserved
    return (
      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'block' }}>
        <Linkify
          content={message}
          tagName="p"
          className={className}
        />
      </div>
    );
  }
}

export default Message;
