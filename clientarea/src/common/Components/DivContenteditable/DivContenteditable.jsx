function DivContenteditable(props) {
  const { attrProps, handlerInput, handlerKey, setupRef } = props;

  return (
    <div
      {...attrProps}
      dangerouslySetInnerHTML={{
        __html: setupRef.current,
      }}
      onInput={handlerInput}
      suppressContentEditableWarning={true}
      onKeyDown={handlerKey}
    ></div>
  );
}

export default DivContenteditable;
