import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { detailChatClientSelector } from '../../../../features/Client/DetailChat/DetailChatClientSlice';
import { sendMessage } from '../../../WebSocket/Clients/ClientActions';
import DivContentEditable from '../../DivContentEditable/DivContentEditable';
import { inputChatSelector, updateMessage } from '../InputChatSlice';
import styles from './Preview.module.css';

function InputOnPreview(props) {
  /* configuration */
  const { togglePreviewFileModal } = props;
  const { messageClient, uploadFileResult } = useSelector(inputChatSelector);
  const { chatId } = useSelector(detailChatClientSelector);
  const dispatch = useDispatch();
  const setRefCaption = useRef(messageClient);

  /* handler */
  const handlerSendMessage = () => {
    const lengthMsg = messageClient
      .replace(/<\/div>/gi, '')
      .replace(/<br\s*[\/]?>/gi, '')
      .replace(/\s\s+/g, '')
      .replace(/&nbsp;/g, '');

    const dataFile = {
      file_type: uploadFileResult.fileType,
      file_name: uploadFileResult.fileName,
      file_url: uploadFileResult.fileUrl,
      file_path: uploadFileResult.filePath,
      file_id: uploadFileResult.fileId,
    };

    let message = '';
    if (lengthMsg.length > 0) {
      message = messageClient
        .replace(/&nbsp;/g, '')
        .replace(/<br\s*[\/]?>/gi, '\n')
        .trim();
    }

    sendMessage(chatId, message, dataFile);
    togglePreviewFileModal(true);
    dispatch(updateMessage(''));
    const elMsg = document.getElementById('messagePreview');
    elMsg.innerHTML = '';
  };

  const handlerPreviewKeyupMessage = (event) => {
    if (event.which === 13 && !event.shiftKey) {
      handlerSendMessage();
      event.preventDefault();
    }
  };

  const handlerPreviewInputChat = (event) => {
    const element = event.target;
    const message = element.innerText;
    const replaceMsg = message.replace(/\n/g, ' <br> ');
    dispatch(updateMessage(replaceMsg));
  };

  return (
    <div className="text-center">
      <DivContentEditable
        attrProps={{
          id: 'messagePreview',
          name: 'messagePreview',
          className: `form-control bg-light border-light text-start ${styles.formContenteditable}`,
          placeholder: 'Type caption...',
          contentEditable: true,
        }}
        handlerKey={handlerPreviewKeyupMessage}
        handlerInput={handlerPreviewInputChat}
        setupRef={setRefCaption}
      />
    </div>
  );
}

export default InputOnPreview;
