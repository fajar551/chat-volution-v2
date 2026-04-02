import LinkifyComp from 'linkify-react';
import React from 'react';

function Linkify(props) {
  const { content, tagName, className } = props;
  const options = {
    target: '_blank',
    rel: 'nofollow noopener noreferrer',
    className: !Boolean(className) ? '' : className,
    nl2br: true,
  };

  return (
    <LinkifyComp
      tagName={`${!Boolean(tagName) ? '' : tagName}`}
      options={options}
      style={{ whiteSpace: 'pre-wrap', marginTop: 0, marginBottom: 0 }}
    >
      {content}
    </LinkifyComp>
  );
}

export default Linkify;
