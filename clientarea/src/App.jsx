import { SimpleGrid } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { ToastContainer } from 'react-toastify';
import useSound from 'use-sound';
import { validateAuth } from './app/Auth/AuthAPI';
import {
  authSelector,
  updateApiKey,
  updateDataAuth
} from './app/Auth/AuthSlice';
import {
  changeStatusAlertRunned,
  changeVolumeAlert,
  layoutSetupSelector,
  updateDeviceVersion,
  updateFeatureActive,
  updateFeatureBefore,
  updateHeightBody,
} from './app/Layouts/LayoutSlice';
import {
  messageSelector,
  updateBubbleChatFirstRefresh,
  updateChatId,
  updateEmojiProps,
} from './app/Message/MessageSlice';
import swushSFX from './assets/sound/swush.mp3';
import BodyCards from './common/Components/BodyCards/BodyCards';
import BottomButton from './common/Components/BottomButton/BottomButton';
import Footers from './common/Components/FooterCards/Footers';
import HeaderCards from './common/Components/HeaderCards/HeaderCards';
import MessagePolling from './common/Components/MessagePolling/MessagePolling';
import clientAPI from './common/API/ClientAPI';
import { joinChatRoom } from './common/WebSocket/Clients/ClientActions';
import Socket from './common/WebSocket/Socket';

function App(props) {
  /* state */
  const { feature, featureBefore, deviceVersion, volumeAlert, runAlert } =
    useSelector(layoutSetupSelector);
  const authData = useSelector(authSelector);
  const status = authData?.status || 'not_active';
  const { isOpenEmoji, chatId } = useSelector(messageSelector);
  const [propsGrid, setPropsGrid] = useState({});

  /* config */
  const { apiKey } = props;
  const dispatch = useDispatch();

  const [play] = useSound(swushSFX, {
    volume: volumeAlert,
  });

  /* config display */
  const isDisplay250 = useMediaQuery({ query: '(min-width:250px)' });
  const isDisplay374 = useMediaQuery({ query: '(min-width:374px)' });
  const isDisplay424 = useMediaQuery({ query: '(min-width:424px)' });
  const isDisplay765 = useMediaQuery({ query: '(min-width:765px)' });
  const isDisplay1020 = useMediaQuery({ query: '(min-width:1020px)' });
  const isDisplay1400 = useMediaQuery({ query: '(min-width:1400px)' });
  const isDisplay2000 = useMediaQuery({ query: '(min-width:2000px)' });

  /* handler */
  const handlerButtonUpdateFeature = (feature, oldFeature = false) => {
    const valueOldFeature = !oldFeature ? 'not_opened' : oldFeature;
    dispatch(updateFeatureBefore(valueOldFeature));

    if (feature === 'not_opened') {
      dispatch(updateFeatureActive('home'));
    } else {
      dispatch(updateFeatureActive(feature));
    }
  };

  const handlerPlaySound = () => {
    play();
    dispatch(changeStatusAlertRunned(false));
  };

  /* useEffect */
  useEffect(() => {
    if (Boolean(apiKey)) {
      dispatch(updateApiKey(apiKey));

      validateAuth(apiKey)
        .then((response) => {
          const dataRes = response.data.data;
          dispatch(updateDataAuth(dataRes));
        })
        .catch((err) => {
          console.warn('integration failed, message error:', err);
          // Reset auth state when validation fails
          dispatch(updateDataAuth({}));
        });
    }
    // Tidak perlu else karena initial state sudah memiliki default values
  }, [apiKey]);
  
  // Restore session dari localStorage setelah reload: connect socket, join room, load messages
  useEffect(() => {
    const chatId = authData?.clientSessions?.chatId;
    if (!chatId) return;
    if (Socket.connected) return;

    const restore = async () => {
      try {
        Socket.io.opts.reconnection = true;
        Socket.connect();
        window.__activeChatId = chatId;
        joinChatRoom(chatId);
        dispatch(updateChatId(chatId));
        dispatch(updateFeatureActive('chat'));

        const messagesResult = await clientAPI.getMessages(chatId);
        if (messagesResult.success && Array.isArray(messagesResult.messages)) {
          const transformedMessages = messagesResult.messages
            .filter((msg) => {
              const messageText = msg.message || msg.body || '';
              const isEncrypted =
                messageText.includes('chatisencrypted:') || messageText.includes('U2FsdGVkX1+');
              const hasText = messageText.trim() !== '';
              const hasMedia = !!(msg.mediaData || msg.media_data) ||
                !!(msg.messageType === 'image' || msg.message_type === 'image');
              if (isEncrypted) return false;
              // Tampilkan pesan yang punya teks ATAU punya media (gambar/file-only)
              return hasText || hasMedia;
            })
            .map((msg) => {
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
                agent_name: msg.agent_name || msg.name,
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
                formatted_date: msg.formatted_date || new Date().toISOString(),
              };
            });
          dispatch(updateBubbleChatFirstRefresh(transformedMessages));
        }
      } catch (err) {
        console.warn('Restore session error:', err);
      }
    };

    restore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- run once on mount for restored session

  // Prevent auto-redirect to chat when session is cleared
  useEffect(() => {
    const { clientSessions } = authData;

    // Check if we're in the middle of creating a new chat
    const isCreatingChat = window.__isCreatingChat || false;

    // Also check if we have a chatId in Redux message state
    const hasChatId = Boolean(chatId);

    //console.log('🔍 App useEffect - clientSessions:', clientSessions);
    //console.log('🔍 App useEffect - isCreatingChat:', isCreatingChat);
    //console.log('🔍 App useEffect - feature:', feature);
    //console.log('🔍 App useEffect - hasChatId:', hasChatId);

    if (!clientSessions || !clientSessions.chatId) {
      // If no active chat session and not creating a new chat, ensure we're on home page
      if (feature === 'chat' && !isCreatingChat && !hasChatId) {
        //console.log('🏠 No active chat session, redirecting to home');
        dispatch(updateFeatureActive('home'));
      } else if (isCreatingChat) {
        //console.log('🔄 Creating new chat, skipping auto-redirect');
        // Ensure we stay in chat feature during creation
        if (feature !== 'chat') {
          //console.log('🔄 Forcing chat feature during creation');
          dispatch(updateFeatureActive('chat'));
        }
      } else if (hasChatId) {
        //console.log('🔄 Has chatId in Redux, skipping auto-redirect');
        // Ensure we stay in chat feature if we have chatId
        if (feature !== 'chat') {
          //console.log('🔄 Forcing chat feature with chatId');
          dispatch(updateFeatureActive('chat'));
        }
      } else {
        //console.log('🔄 Not in chat feature, no redirect needed');
      }
    } else {
      //console.log('✅ Active chat session found, no redirect needed');
      const userMinimized = window.__userMinimizedChat === true;
      if (feature !== 'chat' && !userMinimized) {
        //console.log('🔄 Forcing chat feature with active session');
        dispatch(updateFeatureActive('chat'));
      }
    }
  }, [authData, feature, dispatch, chatId]);

  useEffect(() => {
    let device = '';

    if (isDisplay2000) {
      device = '4k';
    } else if (isDisplay1400) {
      device = 'large_desktop';
    } else if (isDisplay1020) {
      device = 'small_desktop';
    } else if (isDisplay765) {
      device = 'tablet';
    } else if (isDisplay424) {
      device = 'large_mobile';
    } else if (isDisplay374) {
      device = 'medium_mobile';
    } else {
      device = 'small_mobile';
    }

    dispatch(updateDeviceVersion(device));
  }, [
    isDisplay250,
    isDisplay374,
    isDisplay424,
    isDisplay765,
    isDisplay1020,
    isDisplay1400,
    isDisplay2000,
  ]);

  useEffect(() => {
    let propGrids = {};
    let propBody = {};
    let emojiProps = {};

    if (Boolean(isOpenEmoji)) {
      if (
        ['tablet', 'large_mobile', 'medium_mobile', 'small_mobile'].includes(
          deviceVersion
        )
      ) {
        propBody = {
          maxHeight: '170px',
          minHeight: '170px',
        };

        propGrids = {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        };
      } else if (['small_desktop'].includes(deviceVersion)) {
        propBody = {
          maxHeight: '120px',
          minHeight: '120px',
        };

        propGrids = {
          maxW: '350px',
          minW: '350px',
          borderRadius: '15px',
          bottom: '25px',
          right: '3%',
          m: '1rem',
          boxShadow: 'md',
        };

        emojiProps = {
          perLine: 8,
          emojiSize: 20,
          emojiButtonSize: 38,
        };
        dispatch(updateEmojiProps(emojiProps));
      } else {
        propBody = {
          maxHeight: '170px',
          minHeight: '170px',
        };

        propGrids = {
          maxW: '340px',
          minW: '340px',
          borderRadius: '15px',
          bottom: '25px',
          right: '3%',
          m: '1rem',
          boxShadow: 'md',
        };

        emojiProps = {
          perLine: 8,
          emojiSize: 20,
          emojiButtonSize: 38,
        };
        dispatch(updateEmojiProps(emojiProps));
      }
    } else {
      if (
        ['tablet', 'large_mobile', 'medium_mobile', 'small_mobile'].includes(
          deviceVersion
        )
      ) {
        propGrids = {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        };

        propBody = {
          maxHeight: '400px',
          minHeight: '400px',
        };
      } else if (['small_desktop'].includes(deviceVersion)) {
        propBody = {
          maxHeight: '350px',
          minHeight: '350px',
        };

        propGrids = {
          maxW: '350px',
          minW: '350px',
          borderRadius: '15px',
          bottom: '25px',
          right: '3%',
          m: '1rem',
          boxShadow: 'md',
        };

        emojiProps = {
          perLine: 8,
          emojiSize: 20,
          emojiButtonSize: 38,
        };
        dispatch(updateEmojiProps(emojiProps));
      } else {
        propBody = {
          maxHeight: '400px',
          minHeight: '400px',
        };

        propGrids = {
          maxW: '340px',
          minW: '340px',
          borderRadius: '15px',
          bottom: '25px',
          right: '3%',
          m: '1rem',
          boxShadow: 'md',
        };
      }
    }

    setPropsGrid(propGrids);

    dispatch(updateHeightBody(propBody));
  }, [deviceVersion, isOpenEmoji]);

  useEffect(() => {
    window.addEventListener('click', () => {
      dispatch(changeVolumeAlert(0));
      handlerPlaySound();
    });
  }, [status]);

  useEffect(() => {
    handlerPlaySound();
  }, [runAlert]);

  /* component */
  // Tampilkan form tanpa validasi API key terlebih dahulu
  return (
    <>
      <ToastContainer limit={5} />
      {/* {REACT_APP_DEV && <DummyPage />} */}

      {/* Message Polling Component - Always active when there's a chat session */}
      <MessagePolling />

      {feature !== 'not_opened' && (
        <SimpleGrid
          direction="row"
          pos="fixed"
          zIndex="999"
          bg="bgColor"
          fontFamily={`'Inter', sans-serif`}
          {...propsGrid}
        >
          <HeaderCards />
          <BodyCards />
          <Footers />
        </SimpleGrid>
      )}

      {feature === 'not_opened' && (
        <BottomButton
          featureBefore={featureBefore}
          openFeature={(val) => {
            window.__userMinimizedChat = false;
            handlerButtonUpdateFeature(val);
          }}
        />
      )}
    </>
  );
}

export default App;
