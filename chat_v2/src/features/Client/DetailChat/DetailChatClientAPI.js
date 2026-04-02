import Service from '../../../Common/service';

/* get detail chat */
export const getDetailChat = async (chatId) => {
  if (chatId && chatId.startsWith('whatsapp-')) {
    return {
      status: 200,
      data: {
        data: {
          chat_id: chatId,
          status: 1,
          chat_reply: [],
          chat_labels: []
        }
      }
    };
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const path = `chat-details/${chatId}`;

  const response = await Service.getDetailChatClient(path, config);
  return response;
};

/* get detail client chat*/
export const getClientDetailChat = async (chatId) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const path = `client-details/${chatId}`;

  const response = await Service.getDetailClientChat(path, config);
  return response;
};

export const getDetailHistory = async (chatId) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const path = `api-socket/chats/show-detail-from-backups`;
  const data = { chat_id: chatId };

  const response = await Service.getDetailHistoryChat(path, data, config);
  return response;
};

export const getChatAction = async (chatId) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const path = `api-socket/chats/history-chat-actions`;
  const data = { chat_id: chatId };

  const response = await Service.getHistoryChatAction(path, data, config);
  return response;
};

export const sendChatHistory = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const path = 'api-socket/send-chat-history';
  const response = await Service.apiSendHistoryChat(path, data, config);
  return response;
};
