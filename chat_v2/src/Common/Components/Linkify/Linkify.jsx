import React from 'react';
import LinkifyComp from 'linkify-react';

function Linkify(props) {
  const { content, tagName, className, style } = props;
  const options = {
    target: '_blank',
    rel: 'nofollow noopener noreferrer',
    className: !Boolean(className) ? '' : className,
  };

  return (
    <LinkifyComp
      tagName={`${!Boolean(tagName) ? '' : tagName}`}
      className="mb-0"
      options={options}
      style={style}
    >
      {content}
    </LinkifyComp>
  );
}

export default Linkify;
