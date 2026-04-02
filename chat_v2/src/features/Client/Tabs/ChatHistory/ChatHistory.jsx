import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';
import { authSelector } from '../../../../app/Auth/AuthSlice';
import { layoutSetupSelector } from '../../../../app/Layouts/LayoutSlice';
import ClientHeaderTab from '../../../../Common/Components/HeaderTab/ClientHeaderTab';
import ClientListChat from '../../../../Common/Components/ListChat/ClientListChat';
import Skeletons from '../../../../Common/Components/Skeletons';
import { filterChatHistory } from '../../../../Common/utils/helpers';
import { detailChatClientSelector } from '../../DetailChat/DetailChatClientSlice';
import {
  getListResolveChat,
  listChatClientSelector,
} from '../ChatWithClients/ListChat/ListChatClientSlice';
// WhatsAppHistory hidden per request

function ChatHistory() {
  /* config and selector */
  const { history, loader_history, queryListHistory } = useSelector(
    listChatClientSelector
  );
  const { user } = useSelector(authSelector);
  const { chatId } = useSelector(detailChatClientSelector);
  const dispatch = useDispatch();
  const { activeTab } = useSelector(layoutSetupSelector);
  const [whatsappHistory, setWhatsappHistory] = useState([]);
  const [loadingWhatsappHistory, setLoadingWhatsappHistory] = useState(false);

  // Function to get instance label based on instance name (same as WhatsApp.jsx)
  const getInstanceLabel = (instance) => {
    const instanceMap = {
      'wa1': 'qwords',
      'wa2': 'gfn',
      'wa3': 'relabs',
      'wa4': 'aksara',
      'wa5': 'gssl',
      'wa6': 'bw'
    };

    return instanceMap[instance?.toLowerCase()] || instance?.toUpperCase() || 'WA';
  };

  const loadWhatsappHistory = useCallback(async () => {
    try {
      setLoadingWhatsappHistory(true);

      // Fetch closed chats from all instances (wa1-wa6)
      const allChats = [];
      const instances = ['wa1', 'wa2', 'wa3', 'wa4', 'wa5', 'wa6'];

      // Fetch from all instances in parallel
      const fetchPromises = instances.map(async (instanceName) => {
        try {
          const response = await fetch(`https://waserverlive.genio.id/${instanceName}/api/whatsapp/closed-chats`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          if (data.success && data.chats) {
            data.chats.forEach(chat => {
              allChats.push({
                ...chat,
                instance: chat.instance || instanceName // Use instance from API, fallback to current instanceName
              });
            });
          }
        } catch (error) {
          console.warn(`Error loading WhatsApp history from ${instanceName}:`, error);
        }
      });

      await Promise.all(fetchPromises);

      // Don't remove duplicates - keep chats with same phone but different instances separate
      // Each instance should have its own chat entry even if phone number is the same
      // This allows users to see separate chat histories for the same phone from different instances
      const uniqueChats = allChats;

      if (uniqueChats.length > 0) {
        // Transform WhatsApp chats to match history format
        const transformedChats = uniqueChats.map(chat => {
          const instance = chat.instance || 'wa1';
          const instanceBadge = getInstanceLabel(instance);
          
          // Make chat_id unique by including instance to differentiate same phone from different instances
          // Format: whatsapp-{phone}-{instance} to ensure uniqueness
          const uniqueChatId = chat.chat_id 
            ? `${chat.chat_id}-${instance}` 
            : `whatsapp-${chat.phone}-${instance}`;

          return {
            chat_id: uniqueChatId,
            user_name: chat.phone,
            client_name: chat.phone,
            last_message: chat.lastMessage || 'No message',
            last_message_time: chat.lastMessageTime || new Date().toISOString(),
            formatted_date: chat.lastMessageTime || new Date().toISOString(),
            status: 9, // Closed status
            type: 'whatsapp',
            phone: chat.phone,
            unread_count: 0,
            unread_count_agent: 0,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.phone)}&background=ff8c00&color=fff`,
            channel_id: 2, // WhatsApp channel ID
            instance: instance, // Use instance from chat object (already set from API response)
            instanceBadge: instanceBadge // Use getInstanceLabel to get proper badge label (qwords, gfn, relabs, etc.)
          };
        });

        // Sort by last message time (most recent first)
        transformedChats.sort((a, b) => {
          const timeA = new Date(a.last_message_time || 0).getTime();
          const timeB = new Date(b.last_message_time || 0).getTime();
          return timeB - timeA;
        });

        setWhatsappHistory(transformedChats);
      } else {
        setWhatsappHistory([]);
      }
    } catch (error) {
      console.error('Error loading WhatsApp history:', error);
      setWhatsappHistory([]);
    } finally {
      setLoadingWhatsappHistory(false);
    }
  }, []);

  const handlerRefreshListHistory = useCallback(() => {
    dispatch(getListResolveChat(user.uuid));
    loadWhatsappHistory();
  }, [dispatch, user.uuid, loadWhatsappHistory]);

  const delayedQuery = useCallback(() => {
    const debouncedFn = _.debounce(() => handlerRefreshListHistory(), 20000);
    return debouncedFn();
  }, [handlerRefreshListHistory]);

  useEffect(() => {
    if (activeTab === 'Chat-w-history') {
      delayedQuery();
    }
  }, [activeTab, delayedQuery]);

  useEffect(() => {
    handlerRefreshListHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for WhatsApp chat closed event to refresh history
  useEffect(() => {
    const handleChatClosed = () => {
      loadWhatsappHistory();
    };

    window.addEventListener('whatsapp:chatClosed', handleChatClosed);
    return () => {
      window.removeEventListener('whatsapp:chatClosed', handleChatClosed);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* component */
  const { SkeletonListChat } = Skeletons;

  const Items = (params) => {
    const { data, loaderHistory, whatsappData = [], loadingWhatsapp } = params;

    if (loaderHistory || loadingWhatsapp) {
      return <SkeletonListChat />;
    }

    // Combine regular history and WhatsApp history
    const combinedHistory = [...data, ...whatsappData];

    const dataListHistory = !queryListHistory
      ? combinedHistory
      : filterChatHistory(combinedHistory, queryListHistory);

    if (dataListHistory.length < 1) {
      return (
        <li id="conversation-chat-empty" className="active">
          <div className="d-flex justify-content-center p-5">
            <h5 className="mb-2 font-size-14">Chat Not Found!</h5>
          </div>
        </li>
      );
    }

    return dataListHistory.map((val, index) => {
      let isActive = '';
      if (chatId === val.chat_id) {
        isActive = 'active';
      }

      // Determine detail type based on chat type
      // For WhatsApp chats from history, use 'WA' to open WhatsApp detail
      const detailType = val.type === 'whatsapp' ? 'WA' : 'CH';

      return (
        <ClientListChat
          key={index}
          index={index}
          data={val}
          isActive={`listChatClient ${isActive}`}
          chatIdActive={chatId}
          detailType={detailType}
        />
      );
    });
  };

  return (
    <>
      <div>
        <div className="px-4 pt-3">
          <ClientHeaderTab
            attrClass="mb-3"
            value="Chat History"
            isFieldSearch={true}
          />
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
            <Items
              loaderHistory={loader_history}
              data={history}
              whatsappData={whatsappHistory}
              loadingWhatsapp={loadingWhatsappHistory}
            />
          </ul>
        </SimpleBar>
      </div>
      {/** WhatsAppHistory hidden */}
    </>
  );
}

export default ChatHistory;
