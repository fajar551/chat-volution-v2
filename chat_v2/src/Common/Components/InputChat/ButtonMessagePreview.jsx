import React from 'react';
import { Button } from 'reactstrap';

const ButtonMessagePreview = (props) => {
  const { handlerAction } = props;
  return (
    <>
      <Button className="btn btn-tangerin" onClick={handlerAction}>
        Send
      </Button>
    </>
  );
};

export default ButtonMessagePreview;
