import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

function ModalSm(props) {
  const {
    isOpen,
    handlerFunc,
    headerModal,
    title,
    children,
    footerModal,
    backdrop,
    centered,
    keyboard,
  } = props;

  return (
    <>
      <Modal
        isOpen={isOpen}
        toggle={handlerFunc}
        size="sm"
        backdrop={backdrop}
        centered={centered}
        keyboard={keyboard}
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

export default ModalSm;
