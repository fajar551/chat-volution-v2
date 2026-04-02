import React from 'react';

function NameChat(props) {
  /* config */
  const { name, dtClass } = props;

  return <div className={dtClass}>{!Boolean(name) ? '-' : name}</div>;
}

export default NameChat;
