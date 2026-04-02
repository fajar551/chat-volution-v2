import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';
import { authSelector } from '../../../app/Auth/AuthSlice';
import BubbleChatClient from '../../../Common/Components/BubbleChat/BubbleChatClient';
import { uploadFile } from '../../../Common/Components/InputChat/InputChatApi';
import InputChatClient from '../../../Common/Components/InputChat/InputChatClient';
import {
  chooseFileFromClient,
  fullFilledUploadFile,
  inputChatSelector,
  updateMessage,
} from '../../../Common/Components/InputChat/InputChatSlice';
import SolveInput from '../../../Common/Components/InputChat/SolveInput';
import LoaderSpinner from '../../../Common/Components/Loader/LoaderSpinner';
import {
  getCategoryFile,
  getExtensionFile,
  notify,
  validationSizeFile,
} from '../../../Common/utils/helpers';
import { closeChat } from './DetailChatClientSlice';
import Header from './Header';

function Opened(props) {
  /* config */
  const { statusDetail, detailClient, listBubbleChat } = props;
  const dispatch = useDispatch();

  /* state */
  const [file, setFile] = useState();
  const [offset, setOffset] = useState();
  const { uploadFileResult, messageClient } = useSelector(inputChatSelector);
  const { user } = useSelector(authSelector);
  const [isFileChoosed, setIsFileChoosed] = useState(false);
  const ref = useRef();
  const refMessage = useRef(messageClient);

  /* handler */
  const closeDetailChat = (event) => {
    if (event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      dispatch(closeChat());
    } else {
      dispatch(closeChat());
    }
  };

  const handlerChangeFile = (event) => {
    const fileObj = !Boolean(event.target.files[0])
      ? null
      : event.target.files[0];
    setFile(fileObj);

    if (!Boolean(fileObj)) {
      event.target.value = [];
      dispatch(chooseFileFromClient(false));
    } else {
      dispatch(chooseFileFromClient(true));
    }
  };

  const handlerUpdateMessage = (value) => {
    dispatch(updateMessage(value));
  };

  /* onload */
  useEffect(() => {
    if (Boolean(file)) {
      const getExtFile = getExtensionFile(file.name);
      const categoryFile = getCategoryFile(getExtFile);

      if (!Boolean(categoryFile)) {
        setIsFileChoosed(true);
        setFile(null);
        notify('warn', 3000, `Extension ${getExtFile} not allowed!`);
      } else if (categoryFile.name === 'code') {
        setIsFileChoosed(true);
        setFile(null);
        notify('warn', 3000, `Extension ${getExtFile} not allowed!`);
      } else if (!Boolean(validationSizeFile(categoryFile, file.size))) {
        setIsFileChoosed(true);
        setFile(null);
        notify(
          'warn',
          3000,
          `File ${getExtFile} max size: ${categoryFile.unit}!`
        );
      } else {
        uploadFile(user.token, file, getExtFile)
          .then((result) => {
            const response = result.data.data;
            const data = {
              fileName: response.name,
              filePath: response.path,
              fileType: response.type,
              fileId: response.id,
              fileUrl: response.url,
              fileSize: file.size,
            };
            dispatch(fullFilledUploadFile(data));
          })
          .catch((err) => {
            setIsFileChoosed(true);
            notify('error', 5000, `Server Not Responed, please try again!`);
          });
      }
    } else {
      setIsFileChoosed(true);
      setFile(null);
    }
  }, [file]);

  useEffect(() => {
    document.addEventListener('paste', (e) => {
      const clipboardItems = e.clipboardData.items;
      const items = [].slice.call(clipboardItems).filter(function (item) {
        return item;
      });

      if (items.length === 0) {
        return;
      }

      const item = items[0];

      const blob = item.getAsFile();
      setFile(blob);
      if (!Boolean(blob)) {
        dispatch(chooseFileFromClient(false));
      } else {
        dispatch(chooseFileFromClient(true));
      }
    });
  }, []);

  useEffect(() => {
    if (listBubbleChat.length > 0) {
      scrollToBottom();
    }
  }, [listBubbleChat]);

  /* component */
  const scrollToBottom = async () => {
    await ref.current.recalculate();
    if (ref.current.el) {
      ref.current.getScrollElement().scrollTop =
        ref.current.getScrollElement().scrollHeight;
    }
  };

  const BottomDetailChat = (params) => {
    const {
      statusChat,
      statusDetail,
      messageClient,
      handlerUpdateMessage,
      handlerChangeFile,
      isFileChoosed,
      setIsFileChoosed,
      refMessage,
      setOffset,
      offset,
    } = params;

    if (statusDetail !== 'loader') {
      if (![9, 10, 11].includes(statusChat)) {
        return (
          <InputChatClient
            messageClient={messageClient}
            onChange={handlerUpdateMessage}
            chooseFile={(event) => handlerChangeFile(event)}
            isFileChoosed={isFileChoosed}
            setIsFileChoosed={setIsFileChoosed}
            refMessage={refMessage}
            setOffset={setOffset}
            offset={offset}
          />
        );
      } else {
        return <SolveInput />;
      }
    }
  };

  return (
    <>
      <div className="d-flex detail-chat">
        <div className="w-100">
          <Header
            detailClient={detailClient}
            closeChat={(event) => closeDetailChat(event)}
            uploadFileResult={uploadFileResult}
          />
          {statusDetail === 'loader' && (
            <div className="d-flex justify-content-center align-items-center mt-1 mb-0">
              <LoaderSpinner />
            </div>
          )}
          <SimpleBar
            ref={ref}
            className={`chat-conversation ${
              statusDetail !== 'loader' ? '' : 'with-loader'
            } p-3 p-lg-4`}
            id="messages"
          >
            <ul className="list-unstyled mb-0">
              {listBubbleChat.map((val, index) => {
                return <BubbleChatClient key={index} data={val} />;
              })}
            </ul>
          </SimpleBar>
          <BottomDetailChat
            statusChat={detailClient.status}
            statusDetail={statusDetail}
            messageClient={messageClient}
            handlerUpdateMessage={handlerUpdateMessage}
            handlerChangeFile={handlerChangeFile}
            isFileChoosed={isFileChoosed}
            setIsFileChoosed={setIsFileChoosed}
            refMessage={refMessage}
            setOffset={setOffset}
            offset={offset}
          />
        </div>
      </div>
    </>
  );
}

export default Opened;
