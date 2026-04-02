import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Heading,
  Input,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import React, { useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { authSelector, clientLogin, updateSessionsClient } from '../../../app/Auth/AuthSlice';
import {
  updateFeatureActive,
  updateFeatureBefore,
} from '../../../app/Layouts/LayoutSlice';
import { updateBubbleChatFirstRefresh, updateChatId, updateListBubbleChat } from '../../../app/Message/MessageSlice';
import {
  getSocialMediaList,
  selectSelector
} from '../../../app/Select/SelectSlice';
import clientAPI from '../../API/ClientAPI';
import { generateAIResponse } from '../../Services/openai-service';
import { notify } from '../../Utils/helpers';
import { joinChatRoom, refreshAuth } from '../../WebSocket/Clients/ClientActions';
import ButtonSosmed from '../Button/ButtonSosmed';
import FormButton from '../Button/FormButton';

function Form() {
  const dispatch = useDispatch();

  const initialValues = {
    name: '',
    email: '',
    message: '',
  };

  const schemas = Yup.object({
    name: Yup.string().required('Nama wajib di isi!'),
    email: Yup.string()
      .email('Harus format email!')
      .required('Email wajib di isi!'),
    message: Yup.string()
      .min(5, 'Panjang pesan minimal 5!')
      .required('Pesan wajib di isi!'),
  });

  const handlerButtonUpdateFeature = (feature, oldFeature = false) => {
    dispatch(updateFeatureBefore('form_message'));
    dispatch(updateFeatureActive('home'));
  };

  /* state and selector */
  const { apiKey, uuid, userCompanyName, clientSessions } = useSelector(authSelector);
  const { socialMediaList } = useSelector(selectSelector);

  /* useEffect */
  useEffect(() => {
    if (apiKey) {
      dispatch(getSocialMediaList(apiKey));
    }
  }, [apiKey, dispatch]);

  /* handler */
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: schemas,
    onSubmit: async (values, actions) => {
      const message = values.message.trim();

      if (message.length < 1) {
        return notify(
          'error',
          5000,
          'Pesan harus berupa text ataupun angka, minimal 5 karakter'
        );
      }

      const dataSender = {
        name: values.name,
        email: values.email,
        company_uuid: uuid,
        company_name: userCompanyName,
        message,
        api_key: apiKey,
      };

      // Check if there's already an active chat session
      if (clientSessions && clientSessions.chatId) {
        console.log('🔄 Existing chat found, continuing chat:', clientSessions.chatId);
        console.log('🔍 Checking if existing chat is still valid...');

        // Stop any existing polling first
        clientAPI.stopMessagePolling();

        // Load existing messages for the chat
        try {
          const messagesResult = await clientAPI.getMessages(clientSessions.chatId);
          if (messagesResult.success && messagesResult.messages.length > 0) {
            console.log('📨 Loading existing messages:', messagesResult.messages.length);

            // Transform and load existing messages (filter out encrypted; keep pesan berteks atau punya media)
            const transformedMessages = messagesResult.messages
              .filter(msg => {
                const messageText = msg.message || msg.body || '';
                const isEncrypted =
                  messageText.includes('chatisencrypted:') || messageText.includes('U2FsdGVkX1+');
                const hasText = messageText.trim() !== '';
                const hasMedia = !!(msg.mediaData || msg.media_data) ||
                  !!(msg.messageType === 'image' || msg.message_type === 'image');
                if (isEncrypted) return false;
                return hasText || hasMedia;
              })
              .map(msg => {
                const media = msg.mediaData || msg.media_data;
                const file_id = msg.file_id ?? media?.fileId ?? media?.file_id ?? null;
                const file_name = msg.file_name ?? media?.fileName ?? media?.file_name ?? null;
                const file_path = msg.file_path ?? media?.filePath ?? media?.file_path ?? null;
                const file_url = msg.file_url ?? media?.fileUrl ?? media?.file_url ?? null;
                const file_type = msg.file_type ?? media?.fileType ?? media?.file_type ?? null;
                return {
                  id: msg.id || Date.now() + Math.random(),
                  messageId: msg.messageId || msg.message_id || null,
                  message: msg.message || msg.body,
                  from: msg.from || 'agent',
                  created_at: msg.created_at || msg.timestamp || new Date().toISOString(),
                  is_sender: msg.from === 'client',
                  is_netral: false,
                  netral_type: null,
                  agent_name: msg.agent_name || 'Agent',
                  agent_avatar: msg.agent_avatar || null,
                  file_id,
                  file_name,
                  file_path,
                  file_url,
                  file_type,
                  success: true,
                  updated_at: msg.updated_at || new Date().toISOString(),
                  user_email: msg.user_email || null,
                  user_name: msg.user_name || null,
                  user_phone: msg.user_phone || null,
                  no_telegram: msg.no_telegram || null,
                  no_whatsapp: msg.no_whatsapp || null,
                  telegram_id: msg.telegram_id || null,
                  formatted_date: msg.formatted_date || new Date().toISOString()
                };
              });

            // Load all existing messages
            dispatch(updateBubbleChatFirstRefresh(transformedMessages));
          }

          // If existing chat is valid, continue with it
          dispatch(updateChatId(clientSessions.chatId));
          dispatch(updateFeatureBefore('form_message'));
          dispatch(updateFeatureActive('chat'));
          notify('success', 3000, 'Melanjutkan chat yang sudah ada');
          return;
        } catch (error) {
          console.error('❌ Error loading existing messages:', error);
          console.log('🚫 Existing chat is invalid, creating new chat...');
          // Clear invalid chat ID and continue with new chat creation
          dispatch(updateChatId(''));
        }
      }

      // Set flag to prevent auto-redirect during chat creation (set early)
      window.__isCreatingChat = true;
      console.log('🔄 Setting chat creation flag to prevent redirect');

      // Validate session cookie first
      console.log('🔍 Validating session cookie before chat creation...');
      const sessionCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('connect.sid='));
      if (!sessionCookie) {
        console.warn('⚠️ No connect.sid cookie found, creating temporary session...');
        // Create temporary session cookie if none exists
        document.cookie = 'connect.sid=temp; path=/; secure; samesite=strict';
      } else {
        console.log('✅ Session cookie found:', sessionCookie.substring(0, 50) + '...');
      }

      // Use API instead of WebSocket for chat creation
      try {
        const result = await refreshAuth(dataSender);
        if (result.success) {
          console.log('✅ Chat created successfully via API');

          // Store chatId before dispatch
          const chatId = result.data?.data?.chatId;
          console.log('🔍 Form - Chat ID from API response:', chatId);
          console.log('🔍 Form - Chat ID type:', typeof chatId);
          console.log('🔍 Form - Chat ID length:', chatId?.length);

          // Store user email for echo detection
          if (dataSender.email) {
            window.__currentUserEmail = dataSender.email;
            console.log('👤 Stored user email for echo detection:', dataSender.email);
          }

          // Simpan session ke Redux (dan localStorage) langsung agar tetap ada setelah reload
          dispatch(updateSessionsClient({
            chatId,
            companyUuid: dataSender.company_uuid || uuid,
            companyName: dataSender.company_name || userCompanyName,
            emailClient: dataSender.email,
            nameClient: dataSender.name,
            topicId: '',
            topicName: '',
            room: '',
            channelName: '',
            channelId: '',
          }));

          // Pass chatId to clientLogin
          dispatch(clientLogin({ ...dataSender, chatId }));

          // Update chatId in message state
          dispatch(updateChatId(chatId));
          console.log('🔍 Form - Chat ID dispatched to Redux:', chatId);

          // Join chat room for real-time communication
          if (chatId) {
            joinChatRoom(chatId);
          }

          // Add initial message to chat
          const initialMessage = {
            id: Date.now(),
            message: message,
            from: values.name,
            created_at: new Date().toISOString(),
            is_sender: true,
            is_netral: false
          };
          dispatch(updateListBubbleChat(initialMessage));

          // Switch to chat interface after successful login
          dispatch(updateFeatureBefore('form_message'));
          dispatch(updateFeatureActive('chat'));

          console.log('Chat ID:', chatId);

          // Panggil AI untuk balas pesan pertama (non-blocking, skip jika chat sudah di-assign)
          (async () => {
            try {
              const trimmedMsg = (message || '').trim();
              if (!trimmedMsg) return;
              const assigned = await clientAPI.isChatAssigned(chatId);
              if (assigned) {
                console.log('🤖 AI skip (pesan pertama): chat sudah di-assign ke agent');
                return;
              }
              const aiResult = await generateAIResponse(chatId, trimmedMsg);
              if (typeof aiResult === 'string' && aiResult) {
                dispatch(updateListBubbleChat({
                  id: `ai_${Date.now()}_${chatId}`,
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
                }));
                // Simpan balasan AI ke backend supaya muncul di chat_v2 dan database
                clientAPI.sendAgentMessage(chatId, aiResult).catch((e) =>
                  console.warn('🤖 Gagal simpan AI ke backend (pesan pertama):', e?.message)
                );
              } else if (aiResult && typeof aiResult === 'object' && aiResult.error) {
                notify('warning', 5000, aiResult.message || 'AI sibuk, coba lagi nanti.');
              }
            } catch (err) {
              console.error('🤖 AI response (pesan pertama):', err?.message);
            }
          })();

          // Clear flag after successful chat creation with longer delay
          setTimeout(() => {
            window.__isCreatingChat = false;
            console.log('✅ Chat creation flag cleared');
          }, 3000); // Increased from 1000ms to 3000ms
        } else {
          console.error('❌ Failed to create chat via API:', result.error);
          notify('error', 5000, 'Gagal membuat chat. Silakan coba lagi.');
          // Clear flag on error
          window.__isCreatingChat = false;
        }
      } catch (error) {
        console.error('❌ Error creating chat:', error);
        notify('error', 5000, 'Gagal membuat chat. Silakan coba lagi.');
        // Clear flag on error
        window.__isCreatingChat = false;
      }

      actions.resetForm();
    },
  });

  return (
    <>
      <Flex mx="3" mt="10" mb="25px" align="center" position="relative" justify="center">
        <Button
          size="sm"
          py="0"
          my="0"
          backgroundColor="transparent"
          color="darkGray"
          cursor="pointer"
          border="none"
          boxShadow="none"
          position="absolute"
          left="12px"
          _hover={{
            backgroundColor: 'whitePrimaryHover',
            color: 'darkSecondary',
          }}
          title="Kembali"
          onClick={() => handlerButtonUpdateFeature()}
        >
          <FaArrowLeft />
        </Button>
        <Heading my={0} as="h6" size="sm" textAlign="center">
          Live Chat
        </Heading>
      </Flex>
      <VStack as="form" mx="3" mt="2" onSubmit={formik.handleSubmit}>
        <FormControl
          isInvalid={formik.errors.name && formik.touched.name}
          paddingInlineStart={5}
          paddingInlineEnd={5}
        >
          <Input
            id="name"
            name="name"
            type="text"
            onChange={formik.handleChange}
            value={formik.values.name}
            placeholder="   Nama"
            borderRadius="12px"
            bg="whitePrimary"
            borderColor="lightGray"
            color="darkPrimary"
            focusBorderColor="primary"
            borderWidth="1.5px"
            transition="all 0.2s ease"
            _focus={{
              borderColor: 'primary',
              boxShadow: '0 0 0 3px rgba(255, 140, 0, 0.1)',
            }}
            size="sm"
            _placeholder={{ color: 'normalGray' }}
            paddingInlineEnd={0}
            paddingInlineStart={0}
            paddingLeft={0.5}
            css={{
              '&:not(:placeholder-shown)': {
                paddingLeft: '10px',
              },
            }}
          />
          <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
        </FormControl>
        <FormControl
          isInvalid={formik.errors.email && formik.touched.email}
          paddingInlineStart={5}
          paddingInlineEnd={5}
        >
          <Input
            id="email"
            name="email"
            type="email"
            onChange={formik.handleChange}
            value={formik.values.email}
            placeholder="   Email"
            borderRadius="12px"
            bg="whitePrimary"
            borderColor="lightGray"
            color="darkPrimary"
            focusBorderColor="primary"
            borderWidth="1.5px"
            transition="all 0.2s ease"
            _focus={{
              borderColor: 'primary',
              boxShadow: '0 0 0 3px rgba(255, 140, 0, 0.1)',
            }}
            size="sm"
            _placeholder={{ color: 'normalGray' }}
            paddingInlineEnd={0}
            paddingInlineStart={0}
            paddingLeft={0.5}
            css={{
              '&:not(:placeholder-shown)': {
                paddingLeft: '10px',
              },
            }}
          />
          <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
        </FormControl>
        <FormControl
          isInvalid={formik.errors.message && formik.touched.message}
          paddingInlineStart={5}
          paddingInlineEnd={5}
        >
          <Textarea
            id="message"
            name="message"
            onChange={formik.handleChange}
            value={formik.values.message}
            placeholder=" Tulis Pertanyaan disini"
            borderRadius="12px"
            bg="whitePrimary"
            borderColor="lightGray"
            focusBorderColor="primary"
            color="darkPrimary"
            borderWidth="1.5px"
            transition="all 0.2s ease"
            _focus={{
              borderColor: 'primary',
              boxShadow: '0 0 0 3px rgba(255, 140, 0, 0.1)',
            }}
            _placeholder={{ color: 'normalGray' }}
            size="sm"
            maxHeight="50px"
            resize="none"
            paddingInlineEnd={0}
            paddingInlineStart={0}
            paddingLeft={0.5}
            css={{
              '&:not(:placeholder-shown)': {
                paddingLeft: '10px',
              },
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                width: '1px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#D9D9D9',
                borderRadius: '24px',
              },
            }}
          />
          <FormErrorMessage>{formik.errors.message}</FormErrorMessage>
        </FormControl>
        <Box mt="20px" paddingInlineStart={5} paddingInlineEnd={5} w="100%">
          <FormButton />
        </Box>
      </VStack>
      <ButtonSosmed data={socialMediaList} />
    </>
  );
}

export default Form;