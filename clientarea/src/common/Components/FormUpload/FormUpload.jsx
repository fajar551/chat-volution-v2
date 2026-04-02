import {
  Button,
  Flex,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import React from 'react';
import {
  FaFile,
  FaFileAlt,
  FaFileArchive,
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
  FaFileSignature,
  FaFileWord,
  FaPaperPlane,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearFileData,
  messageSelector,
  resetMessage,
  updateIsModalPrev,
  updateIsResetMessage,
  updateListBubbleChat,
} from '../../../app/Message/MessageSlice';
import { getExtensionFile, notify } from '../../Utils/helpers';
import { sendMessage } from '../../WebSocket/Clients/ClientActions';

function FormUpload() {
  const {
    fileType,
    fileName,
    fileUrl,
    filePath,
    fileId,
    isModalPreview,
    chatId,
  } = useSelector(messageSelector);
  const dispatch = useDispatch();

  const handlerClose = () => {
    dispatch(updateIsModalPrev(false));
  };

  const handlerSendFileMsg = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!chatId) {
      notify('error', 4000, 'Chat ID tidak ditemukan. Silakan refresh halaman.');
      return;
    }

    const dataFile = {
      file_type: fileType,
      file_name: fileName,
      file_url: fileUrl,
      file_path: filePath,
      file_id: fileId,
    };

    try {
      const result = await sendMessage(chatId, '', dataFile);
      
      if (result && result.success === true) {
        const responseData = result.data?.data || result.data || {};
        const responseMediaData = responseData.mediaData || responseData.media_data;

        const finalFileData = responseMediaData ? {
          file_id: responseMediaData.fileId || responseMediaData.file_id || fileId,
          file_name: responseMediaData.fileName || responseMediaData.file_name || fileName,
          file_path: responseMediaData.filePath || responseMediaData.file_path || filePath,
          file_url: responseMediaData.fileUrl || responseMediaData.file_url || fileUrl,
          file_type: responseMediaData.fileType || responseMediaData.file_type || fileType,
        } : (dataFile.file_id ? {
          file_id: fileId || null,
          file_name: fileName || null,
          file_path: filePath || null,
          file_url: fileUrl || null,
          file_type: fileType || null,
        } : null);

        const sentMessage = {
          id: responseData.messageId || responseData.id || Date.now(),
          message: '',
          from: 'client',
          created_at: responseData.timestamp || new Date().toISOString(),
          is_sender: true,
          is_netral: false,
          netral_type: null,
          agent_name: 'You',
          agent_avatar: null,
          file_id: finalFileData?.file_id || fileId || null,
          file_name: finalFileData?.file_name || fileName || null,
          file_path: finalFileData?.file_path || filePath || null,
          file_url: finalFileData?.file_url || fileUrl || null,
          file_type: finalFileData?.file_type || fileType || null,
          success: true,
          updated_at: new Date().toISOString(),
          user_email: responseData.user_email || null,
          user_name: responseData.user_name || null,
          user_phone: responseData.user_phone || null,
          no_telegram: responseData.no_telegram || null,
          no_whatsapp: responseData.no_whatsapp || null,
          telegram_id: responseData.telegram_id || null,
          formatted_date: new Date().toISOString()
        };
        
        dispatch(updateListBubbleChat(sentMessage));
        dispatch(updateIsModalPrev(false));
        dispatch(clearFileData());
        dispatch(updateIsResetMessage(true));
        dispatch(resetMessage());
      } else {
        if (result && result.code === 'CHAT_NOT_FOUND') {
          notify('error', 5000, 'Chat tidak ditemukan. Silakan refresh halaman dan coba lagi.');
        } else {
          notify('error', 4000, 'Gagal mengirim file. Silakan coba lagi.');
        }
      }
    } catch (error) {
      notify('error', 4000, 'Gagal mengirim file. Silakan coba lagi.');
    }
  };

  const BodyModal = (params) => {
    if (params.fileType === 'image') {
      return (
        <Image
          borderRadius="15px"
          p="0.5"
          borderColor="primary"
          objectFit="cover"
          alt="img-thumbnail"
          alignContent="center"
          align="center"
          w="100%"
          h="auto"
          maxH="calc(100vh - 380px)"
          loading="lazy"
          src={params.fileUrl}
        />
      );
    } else {
      const exFile = getExtensionFile(params.fileName);
      let icon = <FaFile />;

      if (params.fileType === 'other') {
        if (['pdf'].includes(exFile)) {
          icon = <FaFilePdf />;
        } else if (['crt', 'csr'].includes(exFile)) {
          icon = <FaFileSignature />;
        } else if (['txt'].includes(exFile)) {
          icon = <FaFileAlt />;
        } else if (['xlsx', 'xls'].includes(exFile)) {
          icon = <FaFileExcel />;
        } else if (['csv'].includes(exFile)) {
          icon = <FaFileCsv />;
        } else if (['doc', 'docx'].includes(exFile)) {
          icon = <FaFileWord />;
        }
      } else if (params.fileType === 'archived') {
        icon = <FaFileArchive />;
      }

      const propsIcon = {
        bg: 'primary',
        color: 'whitePrimary',
        'aria-label': params.fileType,
        size: 'lg',
        fontSize: 'xl',
        borderColor: 'transparent',
        borderRadius: '100%',
        _hover: {
          bg: 'primary',
          color: 'whitePrimary',
          cursor: 'text',
        },
      };

      const propsTooltip = {
        placement: 'top',
        label: params.fileName,
        'aria-label': params.fileName,
        zIndex: 'inherit',
        hasArrow: true,
        bg: 'darkGray',
      };

      return (
        <>
          <Flex
            justifyContent="center"
            alignItems="center"
            h="calc(100vh - 400px)"
            flexWrap="wrap"
            flexDirection="column"
          >
            <IconButton {...propsIcon} icon={icon} />
            <Tooltip {...propsTooltip}>
              <Text
                noOfLines={1}
                mt="4"
                fontSize="lg"
                textAlign="center"
                fontWeight="700"
                maxW="100%"
                color="primary"
                cursor="help"
              >
                {params.fileName}
              </Text>
            </Tooltip>
          </Flex>
        </>
      );
    }
  };

  return (
    <>
      <Modal
        isOpen={isModalPreview}
        isCentered={true}
        id="preview-content"
        onClose={handlerClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Preview File</ModalHeader>
          <ModalCloseButton
            backgroundColor="transparent"
            border="none"
            cursor="pointer"
          />
          <form onSubmit={(e) => handlerSendFileMsg(e)}>
            <ModalBody minH="calc(100vh - 380px)" maxH="calc(100vh-50%)">
              <BodyModal
                fileType={fileType}
                fileName={fileName}
                fileUrl={fileUrl}
                filePath={filePath}
                fileId={fileId}
              />
            </ModalBody>
            <ModalFooter justifyContent="center">
              <Button
                type="submit"
                bg="primary"
                borderColor="transparent"
                color="whitePrimary"
                w="50%"
                aria-label="send-message-icon"
                size="sm"
                fontSize="md"
                fontWeight="500"
                cursor="pointer"
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
                rightIcon={<FaPaperPlane />}
              >
                Kirim
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}

export default FormUpload;
