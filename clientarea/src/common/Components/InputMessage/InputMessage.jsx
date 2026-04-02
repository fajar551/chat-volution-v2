import { Box, Flex, IconButton, Input } from '@chakra-ui/react';
import EmojiData from '@emoji-mart/data';
import EmojiPicker from '@emoji-mart/react';
import React, { useEffect, useRef, useState } from 'react';
import { FaGrinWink, FaPaperclip } from 'react-icons/fa';
import { IoPaperPlaneOutline } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { authSelector } from '../../../app/Auth/AuthSlice.js';
import {
  layoutSetupSelector,
  updateHeightBody,
} from '../../../app/Layouts/LayoutSlice';
import { uploadFile } from '../../../app/Message/MessageApi';
import {
  clearFileData,
  messageSelector,
  resetMessage,
  updateChatId,
  updateEmojiStatus,
  updateFileData,
  updateIsModalPrev,
  updateIsResetMessage,
  updateListBubbleChat,
  updateMessage,
} from '../../../app/Message/MessageSlice';
import {
  getCategoryFile,
  getExtensionFile,
  notify,
  validationSizeFile,
} from '../../Utils/helpers';
import clientAPI from '../../API/ClientAPI';
import { generateAIResponse } from '../../Services/openai-service';
import { sendMessage } from '../../WebSocket/Clients/ClientActions';
import DivContenteditable from '../DivContenteditable/DivContenteditable';
import './Emoji.css';
import styles from './InputMessage.module.css';

function InputMessage() {
  /* general config */
  const dispatch = useDispatch();
  const { deviceVersion } = useSelector(layoutSetupSelector);
  const {
    message,
    chatId,
    isModalPreview,
    isResetMessage,
    isOpenEmoji,
    emojiProps,
    fileType,
    fileName,
    fileUrl,
    filePath,
    fileId,
  } = useSelector(messageSelector);
  const { apiKey, clientSessions } = useSelector(authSelector) || {};
  const activeChatId = clientSessions?.chatId || chatId;
  const [objContainerFooter, setObjContainerFooter] = useState({});
  const [file, setFile] = useState();
  const setRefMsg = useRef(message);
  const triggerFileInput = useRef();

  /* handler */
  const handlerSendMessage = async () => {
    const elMsg = document.getElementById('input-message');

    const customizeMsg = elMsg.innerText
      .replace(/&nbsp;/g, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .trim();

    console.log('🔍 Send message - chatId (message):', chatId, '| clientSessions.chatId:', clientSessions?.chatId, '| activeChatId:', activeChatId, '| ada teks:', !!customizeMsg?.trim());
    if (!activeChatId) {
      console.error('🔍 Send message GAGAL: activeChatId kosong, tidak bisa kirim/AI');
      notify('error', 4000, 'Sesi chat tidak ditemukan. Silakan refresh atau buka chat lagi.');
      return;
    }

    // Kosongkan input langsung saat send (bukan nunggu AI selesai)
    if (elMsg) {
      elMsg.innerText = '';
    }
    setRefMsg.current = '';
    dispatch(resetMessage());
    dispatch(updateIsResetMessage(true));

    // Check if there's a file to send (hanya kirim file ketika pesan tanpa teks, agar teks tidak ikut dapat media_data)
    const fileData = fileId ? {
      file_type: fileType,
      file_name: fileName,
      file_url: fileUrl,
      file_path: filePath,
      file_id: fileId,
    } : null;

    const hasText = !!customizeMsg.trim();
    // Jangan kirim file dari state (fileData) ketika user kirim teks, agar media_data tidak ikut; file baru (File object) tetap dikirim
    const fileToSend = (file instanceof File) ? file : (hasText ? null : fileData);

    try {
      const result = await sendMessage(activeChatId, customizeMsg, fileToSend);
      if (result.success) {
        console.log('✅ Message sent successfully via API');
        console.log('📦 Response data:', result.data);

        // Extract file data from response if available
        const responseData = result.data?.data || result.data || {};
        const responseMediaData = responseData.mediaData || responseData.media_data;

        // Use file data from response, or fallback to local file data
        const finalFileData = responseMediaData ? {
          file_id: responseMediaData.fileId || responseMediaData.file_id || fileId,
          file_name: responseMediaData.fileName || responseMediaData.file_name || fileName,
          file_path: responseMediaData.filePath || responseMediaData.file_path || filePath,
          file_url: responseMediaData.fileUrl || responseMediaData.file_url || fileUrl,
          file_type: responseMediaData.fileType || responseMediaData.file_type || fileType,
        } : (fileData ? {
          file_id: fileId || null,
          file_name: fileName || null,
          file_path: filePath || null,
          file_url: fileUrl || null,
          file_type: fileType || null,
        } : null);

        // Display sent message locally immediately
        const sentMessage = {
          id: responseData.messageId || responseData.id || Date.now(),
          message: customizeMsg,
          from: 'client',
          created_at: responseData.timestamp || new Date().toISOString(),
          is_sender: true, // Client messages should be on the right
          is_netral: false,
          netral_type: null,
          agent_name: 'You',
          agent_avatar: null,
          file_id: finalFileData?.file_id || null,
          file_name: finalFileData?.file_name || null,
          file_path: finalFileData?.file_path || null,
          file_url: finalFileData?.file_url || null,
          file_type: finalFileData?.file_type || null,
          success: true,
          updated_at: new Date().toISOString(),
          user_email: null,
          user_name: null,
          user_phone: null,
          no_telegram: null,
          no_whatsapp: null,
          telegram_id: null,
          formatted_date: new Date().toISOString()
        };

        // Add sent message to chat immediately
        dispatch(updateListBubbleChat(sentMessage));

        // Balasan AI setelah user kirim pesan teks (skip jika chat sudah di-assign ke agent)
        const trimmedMsg = customizeMsg && customizeMsg.trim();
        console.log('🤖 AI debug - activeChatId:', activeChatId, '| trimmedMsg:', JSON.stringify(trimmedMsg), '| length:', trimmedMsg?.length ?? 0);
        if (!trimmedMsg) {
          console.log('🤖 AI skip: tidak ada teks (trimmedMsg kosong)');
        } else {
          try {
            const assigned = await clientAPI.isChatAssigned(activeChatId);
            if (assigned) {
              console.log('🤖 AI skip: chat sudah di-assign ke agent');
            } else {
              console.log('🤖 AI memanggil generateAIResponse...', { activeChatId, trimmedMsg: trimmedMsg.slice(0, 50) });
              const aiResult = await generateAIResponse(activeChatId, trimmedMsg);
              console.log('🤖 AI result:', { type: typeof aiResult, isString: typeof aiResult === 'string', hasError: aiResult?.error, preview: typeof aiResult === 'string' ? aiResult?.slice(0, 80) : JSON.stringify(aiResult)?.slice(0, 120) });
              if (typeof aiResult === 'string' && aiResult) {
              console.log('🤖 AI sukses, menambah balasan ke chat');
              const aiMessage = {
                id: `ai_${Date.now()}_${activeChatId}`,
                message: aiResult,
                from: 'agent',
                created_at: new Date().toISOString(),
                is_sender: false,
                is_netral: false,
                netral_type: null,
                agent_name: 'Qiara',
                agent_avatar: null,
                file_id: null,
                file_name: null,
                file_path: null,
                file_url: null,
                file_type: null,
                success: true,
                updated_at: new Date().toISOString(),
                formatted_date: new Date().toISOString(),
              };
              dispatch(updateListBubbleChat(aiMessage));
              // Simpan balasan AI ke backend supaya muncul di chat_v2 dan database
              clientAPI.sendAgentMessage(activeChatId, aiResult).catch((e) =>
                console.warn('🤖 Gagal simpan AI ke backend:', e?.message)
              );
              } else if (aiResult && typeof aiResult === 'object' && aiResult.error) {
                console.log('🤖 AI mengembalikan error:', aiResult.message || aiResult);
                notify('warning', 5000, aiResult.message || 'AI sibuk, coba lagi nanti.');
              } else {
                console.log('🤖 AI result tidak valid (bukan string dan bukan object error):', aiResult);
              }
            }
          } catch (err) {
            console.error('🤖 AI response error (catch):', err?.message, err?.stack || err);
            console.warn('AI response skipped:', err?.message || err);
          }
        }

        // Clear file data after sending
        if (fileData || fileToSend) {
          dispatch(clearFileData());
          handlerClearChooseFile();
          setFile(null);
        }
      } else {
        console.error('❌ Failed to send message via API:', result.error);

        // Handle specific error cases
        if (result.code === 'CHAT_NOT_FOUND') {
          notify('error', 5000, 'Chat tidak ditemukan. Silakan refresh halaman dan coba lagi.');
          // Clear invalid chat ID from Redux store
          dispatch(updateChatId(''));
        } else {
          notify('error', 4000, 'Gagal mengirim pesan. Silakan coba lagi.');
        }
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      notify('error', 4000, 'Gagal mengirim pesan. Silakan coba lagi.');
    }

    handlerUpdateStatusEmoji(false);
    return dispatch(updateIsResetMessage(true));
  };

  const handlerSetupCardBody = (val) => {
    const dataHeight = {
      minHeight: '0px',
      maxHeight: '0px',
    };
    if (Boolean(isOpenEmoji)) {
      if (deviceVersion === 'small_desktop') {
        switch (true) {
          case val >= 150:
            dataHeight.maxHeight = '50px';
            dataHeight.minHeight = '50px';
            break;
          case val >= 131:
            dataHeight.maxHeight = '60px';
            dataHeight.minHeight = '60px';
            break;
          case val >= 110:
            dataHeight.maxHeight = '70px';
            dataHeight.minHeight = '70px';
            break;
          case val >= 89:
            dataHeight.maxHeight = '80px';
            dataHeight.minHeight = '80px';
            break;
          case val >= 68:
            dataHeight.maxHeight = '100px';
            dataHeight.minHeight = '100px';
            break;
          default:
            dataHeight.maxHeight = '120px';
            dataHeight.minHeight = '120px';
            break;
        }
      } else {
        switch (true) {
          case val >= 150:
            dataHeight.maxHeight = '76px';
            dataHeight.minHeight = '76px';
            break;
          case val >= 131:
            dataHeight.maxHeight = '95px';
            dataHeight.minHeight = '95px';
            break;
          case val >= 110:
            dataHeight.maxHeight = '116px';
            dataHeight.minHeight = '116px';
            break;
          case val >= 89:
            dataHeight.maxHeight = '137px';
            dataHeight.minHeight = '137px';
            break;
          case val >= 68:
            dataHeight.maxHeight = '158px';
            dataHeight.minHeight = '158px';
            break;
          default:
            dataHeight.maxHeight = '170px';
            dataHeight.minHeight = '170px';
            break;
        }
      }
    } else {
      if (deviceVersion === 'small_desktop') {
        switch (true) {
          case val >= 150:
            dataHeight.maxHeight = '280px';
            dataHeight.minHeight = '280px';
            break;
          case val >= 131:
            dataHeight.maxHeight = '290px';
            dataHeight.minHeight = '290px';
            break;
          case val >= 110:
            dataHeight.maxHeight = '300px';
            dataHeight.minHeight = '300px';
            break;
          case val >= 89:
            dataHeight.maxHeight = '310px';
            dataHeight.minHeight = '310px';
            break;
          case val >= 68:
            dataHeight.maxHeight = '325px';
            dataHeight.minHeight = '325px';
            break;
          default:
            dataHeight.maxHeight = '350px';
            dataHeight.minHeight = '350px';
            break;
        }
      } else {
        switch (true) {
          case val >= 150:
            dataHeight.maxHeight = '306px';
            dataHeight.minHeight = '306px';
            break;
          case val >= 131:
            dataHeight.maxHeight = '325px';
            dataHeight.minHeight = '325px';
            break;
          case val >= 110:
            dataHeight.maxHeight = '346px';
            dataHeight.minHeight = '346px';
            break;
          case val >= 89:
            dataHeight.maxHeight = '367px';
            dataHeight.minHeight = '367px';
            break;
          case val >= 68:
            dataHeight.maxHeight = '388px';
            dataHeight.minHeight = '388px';
            break;
          default:
            dataHeight.maxHeight = '400px';
            dataHeight.minHeight = '400px';
            break;
        }
      }
    }
    dispatch(updateHeightBody(dataHeight));
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

          const elInputMessage = document.getElementById('input-message');
          dispatch(updateMessage(elInputMessage.innerHTML));
        }
      }
    } else if (document.selection && document.selection.type !== 'Control') {
      document.selection.createRange().pasteHTML(value);
      const elInputMessage = document.getElementById('input-message');
      dispatch(updateMessage(elInputMessage.innerHTML));
    }
  };

  const handlerOnInputMessage = (event) => {
    const element = event.target;
    const elClientHeight = element.clientHeight;
    dispatch(updateMessage(element.innerHTML));
    handlerSetupCardBody(elClientHeight);
  };

  const handlerOnPasteMessage = (event) => {
    event.stopPropagation();
    event.preventDefault();

    let cbPayload = [
      ...(event.clipboardData || event.originalEvent.clipboardData).items,
    ];

    const dataFile = cbPayload[0].getAsFile();
    if (dataFile) {
      handlerUpdateStatusEmoji(false);
      setFile(dataFile);
    } else {
      let txtPaste = event.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, txtPaste);
      const elMsg = document.getElementById('input-message');
      handlerSetupCardBody(elMsg.clientHeight);
    }
  };

  const handlerKey = (event) => {
    if (event.ctrlKey && [66, 73, 85].includes(event.keyCode)) {
      event.preventDefault();
      return false;
    }

    let customizeMessage = message
      .replace(/<\/div>/gi, '')
      .replace(/<br\s*\/?>/gi, '')
      .replace(/\s\s+/g, '')
      .replace(/&nbsp;/g, '')
      .trim();
    if (event.which === 13 && !event.shiftKey) {
      if (customizeMessage.length < 1) {
        event.preventDefault();
        return notify('error', 4000, 'Masukan pesan text atau file!');
      } else if (customizeMessage.length > 300) {
        event.preventDefault();
        return notify('warn', 4000, 'Maksimal panjang pesan 300 karakter!');
      } else {
        event.preventDefault();
        return handlerSendMessage();
      }
    }

    if ([46, 8].includes(event.which)) {
      if (customizeMessage.length < 1) {
        dispatch(updateIsResetMessage(true));
        return dispatch(resetMessage(''));
      }
    }
  };

  const handlerClickSend = async () => {
    let customizeMessage = message
      .replace(/<\/div>/gi, '')
      .replace(/^(<br>)+|(<br>)+$/g, '')
      .replace(/\s\s+/g, '')
      .replace(/&nbsp;/g, '')
      .trim();

    if (customizeMessage.length < 1) {
      notify('error', 4000, 'Masukan pesan text atau file!');
    } else if (customizeMessage.length > 300) {
      return notify('warn', 4000, 'Maksimal panjang pesan 300 karakter!');
    } else {
      await handlerSendMessage();
    }
  };

  const handlerClickChooseFile = () => {
    triggerFileInput.current.click();
  };

  const handlerChooseFile = (event) => {
    const fileChoosed = !Boolean(event.target.files[0])
      ? null
      : event.target.files[0];
    setFile(fileChoosed);
  };

  const handlerClearChooseFile = () => {
    document.getElementById('idInputFile').value = null;
  };

  const handlerUpdateStatusEmoji = (value) => {
    dispatch(updateEmojiStatus(value));
  };

  const handlerButtonEmoji = () => {
    const isStatusUpdate = !Boolean(isOpenEmoji) ? true : false;
    handlerUpdateStatusEmoji(isStatusUpdate);
  };

  const handlerChooseEmoji = (value) => {
    handlerPasteValue(value.native);
  };

  const handlerFocusInputChat = () => {
    document.getElementById('input-message').focus();
  };

  useEffect(() => {
    if (
      ['tablet', 'large_mobile', 'medium_mobile', 'small_mobile'].includes(
        deviceVersion
      )
    ) {
      setObjContainerFooter({
        borderRadius: '0',
      });
    } else {
      setObjContainerFooter({
        boxSizing: 'border-box',
        borderRadius: '0 0 15px 15px',
        borderTopStyle: 'solid',
        borderTopWidth: '1px',
        boxShadow: 'lg',
        borderTopColor: 'lightGray',
      });
    }
  }, [deviceVersion]);

  useEffect(() => {
    if (isResetMessage) {
      const elMsg = document.getElementById('input-message');
      elMsg.innerText = message;
      dispatch(updateIsResetMessage(false));
      const dataHeight = {
        minHeight: '0',
        maxHeight: '0',
      };
      if (isOpenEmoji) {
        if (deviceVersion === 'small_desktop') {
          dataHeight.minHeight = '120px';
          dataHeight.maxHeight = '120px';
        } else {
          dataHeight.minHeight = '170px';
          dataHeight.maxHeight = '170px';
        }
      } else {
        if (deviceVersion === 'small_desktop') {
          dataHeight.minHeight = '350px';
          dataHeight.maxHeight = '350px';
        } else {
          dataHeight.minHeight = '400px';
          dataHeight.maxHeight = '400px';
        }
      }
      dispatch(updateHeightBody(dataHeight));
    }
  }, [isResetMessage]);

  useEffect(() => {
    if (Boolean(file)) {
      const getExtFile = getExtensionFile(file.name);
      const categoryFile = getCategoryFile(getExtFile);
      dispatch(clearFileData());
      dispatch(updateIsModalPrev(false));

      if (!Boolean(categoryFile)) {
        handlerClearChooseFile();
        setFile(null);
        notify('warn', 3000, `Ekstensi ${getExtFile} tidak tersedia!`);
      } else if (!Boolean(validationSizeFile(categoryFile, file.size))) {
        handlerClearChooseFile();
        setFile(null);

        notify(
          'warn',
          3000,
          `File ${getExtFile} maks ukuran: ${categoryFile.unit}!`
        );
      } else {
        // For live chat, we can either:
        // Option 1: Upload file first then send (current approach)
        // Option 2: Send file directly with message (new approach)
        // We'll support both - if apiKey exists, upload first, otherwise send directly

        if (apiKey) {
          // Upload file first (for compatibility with existing flow)
          uploadFile(apiKey, file)
            .then((response) => {
              const uploadFile = response.data.data;
              const data = {
                fileName: uploadFile.name,
                filePath: uploadFile.path,
                fileType: uploadFile.type,
                fileUrl: uploadFile.url,
                fileId: uploadFile.id,
              };
              dispatch(updateFileData(data));
              dispatch(updateIsModalPrev(true));
            })
            .catch((err) => {
              handlerClearChooseFile();
              notify('error', 5000, `Server tidak merespon, mohon coba lagi!`);
            });
        } else {
          // For live chat without apiKey, keep file in state to send directly
          // File will be sent when user clicks send button
          dispatch(updateIsModalPrev(true));
        }
      }
    } else {
      dispatch(clearFileData());
      handlerClearChooseFile(apiKey, file);
      setFile(null);
    }
  }, [file]);

  useEffect(() => {
    if (!Boolean(isModalPreview)) {
      dispatch(clearFileData());
      handlerClearChooseFile(apiKey, file);
    }
  }, [isModalPreview]);

  useEffect(() => {
    handlerFocusInputChat();

    document
      .getElementById('input-message')
      .addEventListener('paste', handlerOnPasteMessage);
  }, []);

  return (
    <>
      <Box w="100%" bg="whitePrimary" {...objContainerFooter}>
        {Boolean(isOpenEmoji) &&
          !['tablet', 'large_mobile', 'medium_mobile', 'small_mobile'].includes(
            deviceVersion
          ) && (
            <EmojiPicker
              data={EmojiData}
              onEmojiSelect={handlerChooseEmoji}
              autoFocus={true}
              skin="1"
              emojiVersion={14}
              previewPosition="none"
              theme="light"
              skinTonePosition="none"
              searchPosition="none"
              noCountryFlags={false}
              {...emojiProps}
            />
          )}
        <Flex>
          <Box w="100%">
            <DivContenteditable
              attrProps={{
                id: 'input-message',
                className: styles['input-message'],
                placeholder: 'Masukan pesan...',
                contentEditable: true,
              }}
              handlerInput={handlerOnInputMessage}
              handlerKey={handlerKey}
              setupRef={setRefMsg}
            />
          </Box>

          <Box py="3" px="5">
            <Flex justify="center">
              {![
                'tablet',
                'large_mobile',
                'medium_mobile',
                'small_mobile',
              ].includes(deviceVersion) && (
                  <IconButton
                    bg="transparent"
                    color="normalGray"
                    aria-label="icon-attachment"
                    mr="0.5"
                    size="sm"
                    fontSize="lg"
                    border="none"
                    shadow="none"
                    cursor="pointer"
                    isActive={isOpenEmoji}
                    onClick={() => handlerButtonEmoji()}
                    _hover={{
                      bg: 'transparent',
                      color: 'darkGray',
                    }}
                    _focus={{
                      bg: 'transparent',
                      color: 'darkGray',
                    }}
                    _focusVisible={{
                      bg: 'transparent',
                      color: 'darkGray',
                    }}
                    _active={{
                      bg: 'whitePrimaryHover',
                      color: 'darkGray',
                      borderRadius: '50%',
                    }}
                    icon={<FaGrinWink />}
                  />
                )}
              <IconButton
                bg="transparent"
                color="normalGray"
                aria-label="icon-attachment"
                mr="0.5"
                border="none"
                shadow="none"
                cursor="pointer"
                size="sm"
                fontSize="lg"
                onClick={() => handlerClickChooseFile()}
                _hover={{
                  bg: 'transparent',
                  color: 'darkGray',
                }}
                _focus={{
                  bg: 'transparent',
                  color: 'darkGray',
                }}
                _focusVisible={{
                  bg: 'transparent',
                  color: 'darkGray',
                }}
                _active={{
                  bg: 'transparent',
                  color: 'darkGray',
                }}
                icon={<FaPaperclip />}
              />
              <IconButton
                borderRadius="50%"
                bg="primary"
                borderColor="transparent"
                color="whitePrimary"
                aria-label="send-message-icon"
                size="sm"
                fontSize="lg"
                cursor="pointer"
                onClick={() => handlerClickSend()}
                _hover={{
                  bg: 'primaryHover',
                  color: 'whitePrimaryHover',
                }}
                _focus={{
                  bg: 'primaryHover',
                  color: 'whitePrimaryHover',
                }}
                _focusVisible={{
                  bg: 'primaryHover',
                  color: 'whitePrimaryHover',
                }}
                _active={{
                  bg: 'primaryHover',
                  color: 'whitePrimaryHover',
                }}
                icon={<IoPaperPlaneOutline />}
              />
            </Flex>
            <Input
              type="file"
              id="idInputFile"
              ref={triggerFileInput}
              display="none"
              onChange={handlerChooseFile}
              accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.crt,.csr,.zip,.rar"
            />
          </Box>
        </Flex>
      </Box>
    </>
  );
}

export default InputMessage;
