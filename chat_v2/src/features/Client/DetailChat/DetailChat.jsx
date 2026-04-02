import React, { Fragment, useEffect } from 'react';

/* reduxer */
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { layoutSetupSelector } from '../../../app/Layouts/LayoutSlice';
import ReportChat from '../../ReportChat';
import {
  detailChatClientSelector,
  getChatDetailClient,
  updateStatusNavigate,
} from './DetailChatClientSlice';
import Error from './Error';

/* component */
import BackendDetail from './BackendDetail';
import LiveChatDetail from './LiveChatDetail';
import NotOpened from './NotOpened';
import Opened from './Opened';
import WhatsAppDetail from './WhatsAppDetail';
import WhatsAppDetailClose from './WhatsAppDetailClose';

const Features = (params) => {
  const { isOpen, layoutMode, listBubbleChat, detailClient, chatId, activeTab } = params;

  // Check if this is a WhatsApp chat
  if (chatId && chatId.startsWith('whatsapp-')) {
    // Use WhatsAppDetailClose for history tab, WhatsAppDetail for active chats
    if (activeTab === 'Chat-w-history') {
      return <WhatsAppDetailClose />;
    }
    return <WhatsAppDetail />;
  }

  // Check if this is a Backend V2 chat
  if (chatId && chatId.startsWith('backend-')) {
    return <BackendDetail />;
  }
  
  // Check if this is a LiveChat
  if (chatId && chatId.startsWith('livechat-')) {
    return <LiveChatDetail />;
  }

  if (isOpen === 'not_open') {
    return <NotOpened layoutMode={layoutMode} />;
  } else if (isOpen === 'error') {
    return <Error layoutMode={layoutMode} />;
  } else {
    return (
      <Opened
        statusDetail={isOpen}
        detailClient={detailClient}
        listBubbleChat={listBubbleChat}
      />
    );
  }
};

function DetailChat(props) {
  /* config */
  const { chatId } = props;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* selector from reducer*/
  const { layoutMode, activeTab } = useSelector(layoutSetupSelector);
  const { isOpen, listBubbleChat, detailClient, runNavigateClose } =
    useSelector(detailChatClientSelector);

  useEffect(() => {
    if (runNavigateClose) {
      navigate('/chat-with-client');
      dispatch(updateStatusNavigate());
    }
  }, [runNavigateClose]);

  useEffect(() => {
    if (Boolean(chatId)) {
      setTimeout(() => {
        // Skip API call for WhatsApp chats - they are handled by WhatsAppDetail component
        if (chatId.startsWith('whatsapp-')) {
          return;
        }
        
         // Skip API call for Backend V2 - they are handled by BackendDetail component
        if (chatId.startsWith('backend-')) {
          return;
        }

        // Skip API call for LiveChat - they are handled by LiveChatDetail component
        if (chatId.startsWith('livechat-')) {
          return;
        }

        const splitParams = chatId.split('-');
        if (splitParams[1] !== 'CH') {
          dispatch(getChatDetailClient(splitParams[0]));
        }
      }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Fragment>
      <style>
        {`
          @keyframes slideInFromRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .whatsapp-detail-animate {
            animation: slideInFromRight 0.25s cubic-bezier(0.4, 0.0, 0.2, 1);
          }
        `}
      </style>
      {activeTab === 'Report-Chat-w-history' && <ReportChat />}

      {activeTab !== 'Report-Chat-w-history' && (
        <div
          className={`w-100 ${isOpen === 'open' ? 'user-chat' : 'non-user-chat'
            } user-chat-show ${chatId && chatId.startsWith('whatsapp-') ? 'whatsapp-detail-animate' : ''}`}
          key={chatId}
        >
          <Features
            isOpen={isOpen}
            layoutMode={layoutMode}
            listBubbleChat={listBubbleChat}
            detailClient={detailClient}
            chatId={chatId}
            activeTab={activeTab}
          />
        </div>
      )}
    </Fragment>
  );
}

export default DetailChat;
