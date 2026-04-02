import React, { useEffect, useState } from 'react';

import {
  Button,
  Card,
  Col,
  Input,
  Label,
  List,
  ListInlineItem,
  Row,
  UncontrolledTooltip,
} from 'reactstrap';

/* reducer */
import EmojiData from '@emoji-mart/data';
import EmojiPicker from '@emoji-mart/react';
import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { authSelector } from '../../../app/Auth/AuthSlice';
import { layoutSetupSelector } from '../../../app/Layouts/LayoutSlice';
import { detailChatClientSelector } from '../../../features/Client/DetailChat/DetailChatClientSlice';
import {
  getCategoryFile,
  getExtensionFile,
  notify,
  validationSizeFile,
} from '../../utils/helpers';
import { sendMessage } from '../../WebSocket/Clients/ClientActions';
import DivContentEditable from '../DivContentEditable/DivContentEditable';
import ModalMd from '../Modal/ModalMd';
import ButtonMessagePreview from './ButtonMessagePreview';
import './Emoji.css';
import styles from './InputChat.module.css';
import { uploadFile } from './InputChatApi';
import {
  addChooseQuickReply,
  chooseFileFromClient,
  closePreview,
  fullFilledUploadFile,
  getQuickReplies,
  inputChatSelector,
  resetQuickReply,
  updateIsEmoji,
  updateMessage,
} from './InputChatSlice';
import InputOnPreview from './Preview/InputOnPreview';
import PreviewFile from './Preview/PreviewFile';

const TooltipContent = React.memo(
  function TooltipContent(params) {
    const {
      isOpenEmoji,
      isQuickChat,
      EmojiData,
      dataQuickReplies,
      handlerChooseEmoji,
      layoutMode,
      handlerChooseQuickReply,
    } = params;

    if (isOpenEmoji) {
      return (
        <div className="d-none d-sm-none d-md-block d-lg-block">
          <EmojiPicker
            data={EmojiData}
            onEmojiSelect={handlerChooseEmoji}
            autoFocus={true}
            skin="1"
            emojiVersion={14}
            previewPosition="none"
            theme="auto"
            skinTonePosition="search"
            searchPosition="none"
          />
        </div>
      );
    } else {
      if (isQuickChat) {
        if (dataQuickReplies.length > 0) {
          return (
            <Row>
              <Col xs="12">
                <Card className={`text-white m-4 tooltip-${layoutMode}`}>
                  <div className="mt-3 tooltip-body">
                    <List type="inline" className="d-flex">
                      {dataQuickReplies.map((value, key) => {
                        return (
                          <ListInlineItem
                            key={key}
                            className="text-nowrap"
                            onClick={() => handlerChooseQuickReply(value)}
                          >
                            <span className="content">/{value.shortcut}</span>
                          </ListInlineItem>
                        );
                      })}
                    </List>
                  </div>
                </Card>
              </Col>
            </Row>
          );
        }
      }
    }
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isOpenEmoji === nextProps.isOpenEmoji &&
      prevProps.isQuickChat === nextProps.isQuickChat &&
      prevProps.dataQuickReplies === nextProps.dataQuickReplies
    );
  }
);

function InputChatClient(props) {
  /* configuration */
  const { rightBarMenu } = props;

  const dispatch = useDispatch();

  /* config display */
  const isDisplay992 = useMediaQuery({ query: '(max-width:992px)' });
  const isDisplay991 = useMediaQuery({ query: '(max-width:991px)' });
  const isDisplay768 = useMediaQuery({ query: '(max-width:768px)' });

  // Mobile detection langsung dari window.innerWidth
  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobileView(width < 768);
    };
    // Check immediately
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* state */
  const { chatId, detailClient } = useSelector(detailChatClientSelector);
  const {
    messageClient,
    uploadFileResult,
    isOpenEmoji,
    isQuickChat,
    dataQuickReplies,
  } = useSelector(inputChatSelector);
  const { layoutMode } = useSelector(layoutSetupSelector);
  const { user } = useSelector(authSelector);
  const [file, setFile] = useState();
  const [previewFileModal, setPreviewFileModal] = useState(false);
  const [styleInput, setStyleInput] = useState();
  const setRefMsg = useRef(messageClient);

  /* handler */
  const getInputMessage = () => {
    const mobileInput = document.getElementById('input-message-mobile');
    const desktopInput = document.getElementById('input-message');
    return mobileInput || desktopInput;
  };

  const handlerResetMessage = () => {
    const elMsg = getInputMessage();
    if (elMsg) elMsg.innerHTML = '';
  };

  const togglePreviewFileModal = (val) => {
    let isOpen = false;
    if (!Boolean(val)) {
      isOpen = true;
    } else {
      isOpen = false;
      clearChooseFile();
      dispatch(closePreview());
      handlerGetQuickReplies(messageClient);
    }
    setPreviewFileModal(isOpen);
  };

  const handleChangeFile = (event) => {
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

  const clearChooseFile = () => {
    document.getElementById('inputAllType').value = null;
    document.getElementById('inputFileImage').value = null;
  };

  const handlerSendMessage = () => {
    const lengthMsg = messageClient
      .replace(/<\/div>/gi, '')
      .replace(/<br\s*[\/]?>/gi, '')
      .replace(/\s\s+/g, '')
      .replace(/&nbsp;/g, '');

    if (lengthMsg.length < 1) {
      notify('error', 3000, 'Please type message or send file!');
      dispatch(updateMessage(''));
    } else {
      const reformatMsg = messageClient
        .replace(/&nbsp;/g, '')
        .replace(/<br\s*[\/]?>/gi, '\n')
        .trim();
      sendMessage(chatId, reformatMsg);
      dispatch(updateMessage(''));
    }

    handlerResetMessage();

    let setupHeightChatConversation = 0;
    let transition = '';
    if (Boolean(isDisplay992)) {
      setupHeightChatConversation = '100vh - 210px';
    } else if (Boolean(isDisplay991)) {
    } else if (Boolean(isDisplay768)) {
    } else {
      setupHeightChatConversation = '100vh - 185px';
    }

    document
      .querySelector('.chat-conversation')
      .setAttribute(
        'style',
        `height: calc(${setupHeightChatConversation});${transition}`
      );
    dispatch(updateIsEmoji(false));
  };

  const handlerSetupCardBody = (value) => {
    let setupHeightChatConversation = 0;
    let transition = '';
    if (Boolean(isDisplay992)) {
      if (value > 100) {
        setupHeightChatConversation = '100vh - 290px';
      } else if (value > 79) {
        setupHeightChatConversation = '100vh - 270px';
      } else if (value > 58) {
        setupHeightChatConversation = '100vh - 250px';
      } else if (value > 41) {
        setupHeightChatConversation = '100vh - 230px';
      } else {
        setupHeightChatConversation = '100vh - 210px';
      }
    } else if (Boolean(isDisplay991)) {
    } else if (Boolean(isDisplay768)) {
    } else {
      if (value > 100) {
        setupHeightChatConversation = '100vh - 270px';
      } else if (value > 79) {
        setupHeightChatConversation = '100vh - 255px';
      } else if (value > 58) {
        setupHeightChatConversation = '100vh - 230px';
      } else if (value > 41) {
        setupHeightChatConversation = '100vh - 200px';
      } else {
        setupHeightChatConversation = '100vh - 185px';
      }
    }

    document
      .querySelector('.chat-conversation')
      .setAttribute(
        'style',
        `height: calc(${setupHeightChatConversation});${transition}`
      );
  };

  const handlerKeyupMessage = (event) => {
    if (event.which === 13 && !event.shiftKey) {
      handlerSendMessage();

      event.preventDefault();
    }
  };

  const handlerGetQuickReplies = (value) => {
    if (value.length < 1) {
      dispatch(resetQuickReply());
      handlerFocusInputChat();
    } else {
      const splitMsg = value.split('');

      if (splitMsg[0] === '/') {
        const queryMessage = value.substring(1);
        const dataRequest = {
          token: user.token,
          query: queryMessage,
        };
        dispatch(getQuickReplies(dataRequest));
      } else {
        dispatch(resetQuickReply());
      }
    }
  };

  const handlerOnInputMessage = (event) => {
    const element = event.target;
    const message = element.innerText;
    const replaceMsg = message.replace(/\n/g, ' <br> ');

    handlerGetQuickReplies(message);

    dispatch(updateMessage(replaceMsg));
    const clientHeight = event.target.clientHeight;
    handlerSetupCardBody(clientHeight);
  };

  const handlerSendMessagePreview = () => {
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

  const handlerOnPasteMessage = (event) => {
    event.stopPropagation();
    event.preventDefault();

    let cbPayload = [
      ...(event.clipboardData || event.originalEvent.clipboardData).items,
    ];

    const dataFile = cbPayload[0].getAsFile();
    if (dataFile) {
      setFile(dataFile);
    } else {
      let txtPaste = event.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, txtPaste);
      const elMsg = getInputMessage();
      if (elMsg) handlerSetupCardBody(elMsg.clientHeight);
    }
  };

  const handlerPasteValue = (value) => {
    let sel, range;

    /* call auto focus on input message */
    if (window.getSelection) {
      sel = window.getSelection();
      handlerFocusInputChat();

      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();

        /* create element use to node counting */
        const createEl = document.createElement('div');
        createEl.innerHTML = value;
        let frag = document.createDocumentFragment(),
          node,
          lastNode;

        while ((node = createEl.firstChild)) {
          lastNode = frag.appendChild(node);
        }

        range.insertNode(frag);
        // Preserve the selection
        if (lastNode) {
          range = range.cloneRange();
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);

          const elInputMessage = getInputMessage();
          if (elInputMessage) dispatch(updateMessage(elInputMessage.innerHTML));
        }
      }
    } else if (document.selection && document.selection.type !== 'Control') {
      document.selection.createRange().pasteHTML(value);
      const elInputMessage = getInputMessage();
      if (elInputMessage) dispatch(updateMessage(elInputMessage.innerHTML));
    }
  };

  const handlerFocusInputChat = () => {
    const elMsg = getInputMessage();
    if (elMsg) elMsg.focus();
  };

  const handlerShowEmoji = () => {
    const status = isOpenEmoji ? false : true;
    dispatch(updateIsEmoji(status));
  };

  const handlerChooseEmoji = (value) => {
    handlerPasteValue(value.native);
  };

  const handlerConditionEmoji = () => {
    const className =
      layoutMode === 'light' ? 'emoji-chat-light' : 'emoji-chat-dark';
    if (isOpenEmoji) {
      const el = document.getElementsByTagName('em-emoji-picker');
      el[0].setAttribute('class', className);
    }
  };

  const handlerChooseQuickReply = (value) => {
    dispatch(updateMessage(''));
    handlerResetMessage();

    handlerPasteValue(value.message);
    dispatch(addChooseQuickReply(value));
  };

  useEffect(() => {
    if (Boolean(file)) {
      const getExtFile = getExtensionFile(file.name);
      const categoryFile = getCategoryFile(getExtFile);

      if (!Boolean(categoryFile)) {
        clearChooseFile();
        setFile(null);
        notify('warn', 3000, `Extension ${getExtFile} not allowed!`);
      } else if (categoryFile.name === 'code') {
        clearChooseFile();
        setFile(null);
        notify('warn', 3000, `Extension ${getExtFile} not allowed!`);
      } else if (!Boolean(validationSizeFile(categoryFile, file.size))) {
        clearChooseFile();

        setFile(null);
        notify(
          'warn',
          3000,
          `File ${getExtFile} max size: ${categoryFile.unit}!`
        );
      } else {
        uploadFile(user.token, detailClient.channel_id, file, getExtFile)
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
            dispatch(updateIsEmoji(false));
            dispatch(resetQuickReply());
            togglePreviewFileModal(false);
          })
          .catch((err) => {
            clearChooseFile();
            notify('error', 5000, `Server Not Responed, please try again!`);
          });
      }
    } else {
      clearChooseFile();
      setFile(null);
    }
  }, [file]);

  useEffect(() => {
    handlerFocusInputChat();

    const elMsg = getInputMessage();
    if (elMsg) {
      elMsg.addEventListener('paste', handlerOnPasteMessage);
    }
  }, []);

  useEffect(() => {
    if (layoutMode === 'dark') {
      if (Boolean(rightBarMenu)) {
        setStyleInput(styles.formContenteditableDarkRightBarActive);
      } else {
        setStyleInput(styles.formContenteditableDark);
      }
    } else {
      if (Boolean(rightBarMenu)) {
        setStyleInput(styles.formContenteditableLightBarActive);
      } else {
        setStyleInput(styles.formContenteditableLight);
      }
    }
  }, [layoutMode, rightBarMenu]);

  useEffect(() => {
    const elMsg = getInputMessage();
    if (elMsg) {
      if (previewFileModal) {
        setRefMsg.current = messageClient;
        elMsg.innerHTML = messageClient;
        const clientHeight = elMsg.clientHeight;
        handlerSetupCardBody(clientHeight);
      } else {
        const clientHeight = elMsg.clientHeight;
        handlerSetupCardBody(clientHeight);
      }
    }
  }, [previewFileModal, messageClient]);

  useEffect(() => {
    handlerConditionEmoji();
    handlerFocusInputChat();
  }, [isOpenEmoji]);

  useEffect(() => {
    if (isQuickChat) {
      const splitMsg = messageClient.split('');
      if (splitMsg[0] !== '/') {
        dispatch(resetQuickReply());
      }
    }
  }, [isQuickChat]);

  return (
    <>
      <style>
        {`
          @media (max-width: 767px) {
            #input-message-mobile {
              width: calc(100% - 56px) !important;
              max-width: calc(100% - 56px) !important;
              min-width: 0 !important;
              box-sizing: border-box !important;
            }
            .mobile-send-button {
              display: flex !important;
              visibility: visible !important;
              opacity: 1 !important;
              z-index: 1001 !important;
              position: relative !important;
            }
            .border-top.mb-0 {
              padding-left: 20px !important;
              padding-right: 20px !important;
              padding-bottom: calc(16px + env(safe-area-inset-bottom)) !important;
              background-color: #fff !important;
              box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1) !important;
              position: fixed !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              z-index: 1000 !important;
              width: 100% !important;
            }
            .detail-chat {
              display: flex !important;
              flex-direction: column !important;
              overflow: visible !important;
            }
            .detail-chat > div {
              overflow: visible !important;
            }
            .chat-conversation {
              padding-bottom: 120px !important;
            }
          }
          @media (min-width: 768px) {
            #input-message-mobile {
              display: none !important;
            }
            .mobile-send-button {
              display: none !important;
            }
          }
        `}
      </style>
      <div className="position-relative">
        <TooltipContent
          isOpenEmoji={isOpenEmoji}
          isQuickChat={isQuickChat}
          dataQuickReplies={dataQuickReplies}
          EmojiData={EmojiData}
          handlerChooseEmoji={handlerChooseEmoji}
          layoutMode={layoutMode}
          handlerChooseQuickReply={handlerChooseQuickReply}
        />
      </div>
      <div className={`border-top mb-0 ${isMobileView ? 'py-2' : 'p-3 p-lg-4'}`} style={isMobileView ? {
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
        backgroundColor: '#fff',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        width: '100%'
      } : {}}>
        <Row className="g-0">
          {/* Mobile version - input dan button di tengah */}
          {isMobileView ? (
            <Col className="col-12" style={{ padding: '0', width: '100%', maxWidth: '100%' }}>
              <div style={{ width: '100%', maxWidth: '100%', padding: '0', boxSizing: 'border-box' }}>
                {/* Baris pertama: Input dan tombol kirim */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  maxWidth: '100%',
                  padding: '0',
                  margin: '0',
                  boxSizing: 'border-box'
                }}>
                  <div style={{
                    width: 'calc(100% - 56px)',
                    maxWidth: 'calc(100% - 56px)',
                    minWidth: 0,
                    padding: '0',
                    margin: '0',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}>
                    <DivContentEditable
                      attrProps={{
                        id: 'input-message-mobile',
                        className: `bg-light border-light ${styleInput}`,
                        placeholder: 'Type message...',
                        contentEditable: true,
                        style: {
                          width: '100%',
                          maxWidth: '100%',
                          boxSizing: 'border-box',
                          padding: '8px 12px',
                          margin: '0',
                          fontSize: '14px',
                          minWidth: 0,
                          border: '1px solid #dee2e6',
                          borderRadius: '0.375rem',
                          backgroundColor: '#f8f9fa',
                          outline: 'none',
                          overflow: 'hidden',
                          wordWrap: 'break-word'
                        }
                      }}
                      handlerKey={handlerKeyupMessage}
                      handlerInput={handlerOnInputMessage}
                      setupRef={setRefMsg}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handlerSendMessage()}
                    className="mobile-send-button"
                    style={{
                      padding: '0',
                      minWidth: '48px',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      borderRadius: '4px',
                      backgroundColor: '#ff8c00',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                      zIndex: 10,
                      position: 'relative',
                      margin: '0'
                    }}
                  >
                    <i className="ri-send-plane-2-fill"></i>
                  </button>
                </div>
                {/* Baris kedua: Tombol-tombol lainnya */}
                <div className="d-flex align-items-center justify-content-center" style={{ gap: '12px', width: '100%', paddingTop: '4px' }}>
                  <button
                    type="button"
                    id="emoji-mobile-btn"
                    onClick={() => handlerShowEmoji()}
                    className="btn btn-link text-decoration-none"
                    style={{
                      padding: '8px',
                      minWidth: 'auto',
                      fontSize: '20px',
                      color: '#6c757d',
                      border: 'none',
                      background: 'transparent'
                    }}
                  >
                    {isOpenEmoji ? (
                      <i className="ri-close-circle-line"></i>
                    ) : (
                      <i className="ri-emotion-happy-line"></i>
                    )}
                  </button>
                  <UncontrolledTooltip target="emoji-mobile-btn" placement="top">
                    {isOpenEmoji ? 'Close' : 'Show'} emoji
                  </UncontrolledTooltip>
                  <Label
                    htmlFor="inputAllType-mobile"
                    id="files-mobile-label"
                    className="btn btn-link text-decoration-none"
                    style={{
                      padding: '8px',
                      minWidth: 'auto',
                      fontSize: '20px',
                      color: '#6c757d',
                      border: 'none',
                      background: 'transparent',
                      margin: '0',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="ri-attachment-line"></i>
                    <Input
                      id="inputAllType-mobile"
                      type="file"
                      name="fileInput"
                      size="60"
                      onChange={handleChangeFile}
                      style={{ display: 'none' }}
                    />
                  </Label>
                  <UncontrolledTooltip target="files-mobile-label" placement="top">
                    Attached File
                  </UncontrolledTooltip>
                  <Label
                    htmlFor="inputFileImage-mobile"
                    id="images-mobile-label"
                    className="btn btn-link text-decoration-none"
                    style={{
                      padding: '8px',
                      minWidth: 'auto',
                      fontSize: '20px',
                      color: '#6c757d',
                      border: 'none',
                      background: 'transparent',
                      margin: '0',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="ri-image-fill"></i>
                    <Input
                      id="inputFileImage-mobile"
                      accept=".gif,.ico,.jpg,.jpeg,.png,.svg,.tif,.tiff,.webp"
                      type="file"
                      name="fileInput"
                      size="60"
                      onChange={handleChangeFile}
                      style={{ display: 'none' }}
                    />
                  </Label>
                  <UncontrolledTooltip target="images-mobile-label" placement="top">
                    Images
                  </UncontrolledTooltip>
                </div>
              </div>
            </Col>
          ) : (
            <>
              {/* Desktop version */}
              <Col className="d-none d-md-block d-lg-block">
                <DivContentEditable
                  attrProps={{
                    id: 'input-message',
                    className: `form-control form-control-lg bg-light border-light ${styleInput}`,
                    placeholder: 'Type message...',
                    contentEditable: true,
                  }}
                  handlerKey={handlerKeyupMessage}
                  handlerInput={handlerOnInputMessage}
                  setupRef={setRefMsg}
                />
              </Col>
              <Col className="d-none d-md-block d-lg-block" xs="auto">
                <div className="chat-input-links ms-md-2">
                  <ul className="list-inline mb-0 ms-0">
                    <li className="list-inline-item input-file">
                      <Label
                        id="emoji"
                        onClick={() => handlerShowEmoji()}
                        className="btn btn-link text-decoration-none font-size-16 btn-lg waves-effect"
                      >
                        {isOpenEmoji ? (
                          <i className="ri-close-circle-line"></i>
                        ) : (
                          <i className="ri-emotion-happy-line"></i>
                        )}
                      </Label>

                      <UncontrolledTooltip target="emoji" placement="top">
                        {isOpenEmoji ? 'Close' : 'Show'} emoji
                      </UncontrolledTooltip>
                    </li>
                    <li className="list-inline-item input-file">
                      <Label
                        id="files"
                        className="btn btn-link text-decoration-none font-size-16 btn-lg waves-effect"
                      >
                        <i className="ri-attachment-line"></i>
                        <Input
                          id="inputAllType"
                          type="file"
                          name="fileInput"
                          size="60"
                          onChange={handleChangeFile}
                        />
                      </Label>
                      <UncontrolledTooltip target="files" placement="top">
                        Attached File
                      </UncontrolledTooltip>
                    </li>
                    <li className="list-inline-item input-file">
                      <Label
                        id="images"
                        className="me-1 btn btn-link text-decoration-none font-size-16 btn-lg waves-effect"
                      >
                        <i className="ri-image-fill"></i>
                        <Input
                          id="inputFileImage"
                          accept=".gif,.ico,.jpg,.jpeg,.png,.svg,.tif,.tiff,.webp"
                          type="file"
                          name="fileInput"
                          size="60"
                          onChange={handleChangeFile}
                        />
                      </Label>
                      <UncontrolledTooltip target="images" placement="top">
                        Images
                      </UncontrolledTooltip>
                    </li>
                    <li className="list-inline-item">
                      <Button
                        type="button"
                        color="tangerin"
                        className="font-size-16 btn-lg chat-send waves-effect waves-light"
                        onClick={() => handlerSendMessage()}
                      >
                        <i className="ri-send-plane-2-fill"></i>
                      </Button>
                    </li>
                  </ul>
                </div>
              </Col>
            </>
          )}
        </Row>
      </div>
      <ModalMd
        isOpen={previewFileModal}
        handlerFunc={togglePreviewFileModal}
        title="Preview File"
        headerModal={true}
        unmountOnClose={true}
        keyboard={true}
        centered={true}
        footerModal={
          <ButtonMessagePreview handlerAction={handlerSendMessagePreview} />
        }
        backdrop="static"
      >
        <div
          className={`d-flex justify-content-center align-items-center ${uploadFileResult.fileType === 'image' ? 'image-preview' : ''
            }  `}
        >
          <Row>
            <Col sm="12" md="12" lg="12">
              <PreviewFile resultUpload={uploadFileResult} />
            </Col>
            <Col sm="12" md="12" lg="12">
              <InputOnPreview togglePreviewFileModal={togglePreviewFileModal} />
            </Col>
          </Row>
        </div>
      </ModalMd>
    </>
  );
}

export default InputChatClient;
