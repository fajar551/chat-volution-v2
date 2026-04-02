import React from 'react';

function DivContentEditable(props) {
  const { attrProps, handlerInput, handlerKey, setupRef } = props;

  return (
    <div
      {...attrProps}
      dangerouslySetInnerHTML={{
        __html: setupRef.current,
      }}
      suppressContentEditableWarning={true}
      onInput={handlerInput}
      onKeyDown={handlerKey}
    ></div>
  );
}

export default DivContentEditable;
