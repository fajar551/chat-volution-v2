import { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';
import ClientListChat from '../../../../Common/Components/ListChat/ClientListChat';
import Skeletons from '../../../../Common/Components/Skeletons';
import whatsappIntegration from '../../../../whatsapp-integration';
import { detailChatClientSelector } from '../../DetailChat/DetailChatClientSlice';

function WhatsAppHistory() {
  const { chatId } = useSelector(detailChatClientSelector);
  const [whatsappChats, setWhatsappChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Listen for WhatsApp integration events
    whatsappIntegration.on('connected', () => {
      setIsConnected(true);
    });

    whatsappIntegration.on('disconnected', () => {
      setIsConnected(false);
    });

    whatsappIntegration.on('chatsLoaded', (chats) => {
      setWhatsappChats(chats);
      setIsLoading(false);
    });

    // REMOVED: newMessage event listener to prevent duplicate processing
    // WhatsAppHistory only needs to listen for chatsUpdated events
    // The whatsapp-integration.js already handles all message processing

    // REMOVED: AI response event listener to prevent duplicate logging
    // The whatsapp-integration.js already handles AI response processing
    // We don't need to listen for aiResponse events in history component

    whatsappIntegration.on('chatsUpdated', (updatedChats) => {
      setWhatsappChats(updatedChats);
    });

    whatsappIntegration.on('error', (error) => {
      console.error('WhatsApp error in history:', error);
      setIsLoading(false);
    });

    // Load initial chats
    whatsappIntegration.loadChats();

    // Fallback: check connection status after 3 seconds
    const timeoutId = setTimeout(() => {
      if (whatsappChats.length > 0) {
        setIsConnected(true);
      }
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
      // Clean up event listeners
      whatsappIntegration.off('connected');
      whatsappIntegration.off('disconnected');
      whatsappIntegration.off('chatsLoaded');
      // REMOVED: newMessage event listener cleanup (no longer listening)
      // REMOVED: aiResponse event listener cleanup (no longer listening)
      whatsappIntegration.off('chatsUpdated');
      whatsappIntegration.off('error');
    };
  }, [whatsappChats.length]);

  const { SkeletonListChat } = Skeletons;

  const Items = (params) => {
    const { data, loaderHistory } = params;

    if (loaderHistory) {
      return <SkeletonListChat />;
    }

    if (data.length < 1) {
      return (
        <li id="conversation-chat-empty" className="active">
          <div className="d-flex justify-content-center p-5">
            <h5 className="mb-2 font-size-14">
              {isConnected ? 'No WhatsApp chat history found' : 'WhatsApp not connected'}
            </h5>
          </div>
        </li>
      );
    }

    return data.map((chat, index) => {
      let isActive = '';
      if (chatId === `whatsapp-${chat.phone}`) {
        isActive = 'active';
      }

      // Transform WhatsApp chat data to match ClientListChat format
      const getLastMessagePreview = (chat) => {
        if (chat.lastMessage) {
          return chat.lastMessage;
        }
        if (chat.hasMedia) {
          return '📎 Media file';
        }
        return 'No message';
      };

      const transformedData = {
        chat_id: `whatsapp-${chat.phone}`,
        user_name: chat.phone, // Use user_name instead of client_name
        client_name: chat.phone,
        last_message: getLastMessagePreview(chat),
        last_message_time: chat.lastMessageTime || new Date().toISOString(),
        unread_count: chat.unreadCount || 0,
        unread_count_agent: chat.unreadCount || 0, // Add unread_count_agent for badge
        type: 'whatsapp',
        phone: chat.phone,
        message: getLastMessagePreview(chat), // Add message field for display
        formatted_date: chat.lastMessageTime || new Date().toISOString(),
        status: 1, // Add status for display
        // Add more fields for better display
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.phone)}&background=25D366&color=fff`,
        channel_id: 2 // WhatsApp channel ID
      };

      return (
        <ClientListChat
          key={index}
          index={index}
          data={transformedData}
          isActive={`listChatClient ${isActive}`}
          chatIdActive={chatId}
          detailType="WA"
        />
      );
    });
  };

  return (
    <Fragment>
      <div>
        <div className="px-4 pt-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-2 font-size-16">WhatsApp History</h5>
            <div className="d-flex align-items-center">
              <div
                className={`badge ${isConnected ? 'bg-success' : 'bg-danger'} me-2`}
                style={{ fontSize: '10px' }}
              >
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>
        </div>
        <hr />
        <SimpleBar
          style={{ maxHeight: '100%' }}
          className="chat-message-list chat-group-list"
        >
          <ul
            className="list-unstyled chat-list chat-user-list px-4"
            id="chat-list"
          >
            <Items loaderHistory={isLoading} data={whatsappChats} />
          </ul>
        </SimpleBar>
      </div>
    </Fragment>
  );
}

export default WhatsAppHistory;
