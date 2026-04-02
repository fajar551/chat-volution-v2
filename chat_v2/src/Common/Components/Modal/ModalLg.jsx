import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

function ModalLg(props) {
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
        size="lg"
        backdrop={!Boolean(backdrop) ? true : backdrop}
        centered={!Boolean(centered) ? false : centered}
        keyboard={!Boolean(keyboard) ? true : keyboard}
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

export default ModalLg;
