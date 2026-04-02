import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

function ModalFullScreen(props) {
  const {
    isOpen,
    handlerFunc,
    headerModal,
    title,
    handlerClosed,
    children,
    footerModal,
    backdrop,
    centered,
    keyboard,
  } = props;

  const resultClosed = () => {
    if (handlerClosed) {
      handlerClosed();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        toggle={handlerFunc}
        backdrop={backdrop}
        centered={centered}
        keyboard={keyboard}
        onClosed={resultClosed}
        fullscreen={true}
      >
        {headerModal && (
          <ModalHeader toggle={handlerFunc}>
            {!Boolean(title) ? 'modal fullscreen' : title}
          </ModalHeader>
        )}

        <ModalBody>{children}</ModalBody>

        {footerModal && <ModalFooter>{footerModal}</ModalFooter>}
      </Modal>
    </>
  );
}

export default ModalFullScreen;
