import {
  clearAllSessionsFromResolveChat,
  updateSessionsAgent,
  updateSessionsClient,
  updateStatusConnect,
} from '../../../app/Auth/AuthSlice';
import {
  changeStatusAlertRunned,
  changeVolumeAlert,
  updateFeatureActive,
  updateFeatureBefore,
} from '../../../app/Layouts/LayoutSlice';
import {
  clearAllInputMessage,
  clearAllStateMessageSetup,
  updateBubbleChatFirstRefresh,
  updateChatId,
  updateEmojiStatus,
  updateListBubbleChat,
} from '../../../app/Message/MessageSlice';
import { updateNewMessage } from '../../../app/Select/SelectSlice';
import { store } from '../../../app/store';
import { createDate, notify } from '../../Utils/helpers';

export const actionsUpdateStateStatusConnect = (params) => {
  if (params.length < 1) {
    store.dispatch(updateFeatureActive('not_opened'));
    store.dispatch(updateFeatureBefore('not_opened'));
    return false;
  } else {
    const clientSessions = {
      companyUuid: params.company_uuid,
      companyName: params.company_name,
      departmentId: params.department_id,
      departmentName: params.department_name,
      emailClient: params.user_email,
      nameClient: params.user_name,
      topicId: params.topic_id,
      topicName: params.topic_name,
      chatId: params.chat_id,
      channelId: params.channel_id,
      channelName: params.channel_name,
      firstChatDate: params.formatted_date,
      room: params.room,
    };

    const agentSessions = {
      companyUuid: params.company_uuid,
      companyName: params.company_name,
      departmentId: params.department_id,
      departmentName: params.department_name,
      room: params.room,
      agentAvatar: params.agent_avatar,
      agentEmail: params.agent_email,
      agentId: params.agent_id,
      agentName: params.agent_name,
      agentUuid: params.agent_uuid,
      isTransfered: params.being_transferred,
    };

    let dataMessage = [];
    if (params.chat_reply.length > 0) {
      dataMessage = params.chat_reply.map((val, key) => {
        return Object.assign(val, { is_netral: false, netral_type: null });
      });
    }

    store.dispatch(updateStatusConnect());
    store.dispatch(updateBubbleChatFirstRefresh(dataMessage));
    store.dispatch(updateSessionsClient(clientSessions));
    store.dispatch(updateSessionsAgent(agentSessions));
    store.dispatch(updateChatId(params.chat_id));
    store.dispatch(updateFeatureActive('chat'));
    store.dispatch(updateFeatureBefore('not_opened'));
    return notify('success', 3000, 'Terhubung dengan chat!');
  }
};

export const actionsUpdateStateTransfer = (params) => {
  const agentSessions = {
    companyUuid: params.company_uuid,
    companyName: params.company_name,
    departmentId: params.department_id,
    departmentName: params.department_name,
    room: params.room,
    agentAvatar: params.agent_avatar,
    agentEmail: params.agent_email,
    agentId: params.agent_id,
    agentName: params.agent_name,
    agentUuid: params.agent_uuid,
    isTransfered: params.being_transferred,
  };

  store.dispatch(updateSessionsAgent(agentSessions));
};

export const actionSaveMessage = (params) => {
  // Get current user email for proper message positioning
  const currentUserEmail = window.__currentUserEmail || null;

  // Determine if this is a client message (should be on the right)
  const isClientMessage = params.from === 'client' ||
    (currentUserEmail && params.from === currentUserEmail) ||
    (params.from && params.from.includes('@') && params.from !== 'agent');

  // Set proper is_sender based on message source
  params = Object.assign(params, {
    is_netral: false,
    netral_type: null,
    is_sender: isClientMessage, // Client messages go to the right, agent messages go to the left
    messageId: params.id || params.messageId || `${params.message}_${params.timestamp}_${params.from}` // Add unique ID
  });

  console.log('📨 WebSocket message positioning:', {
    from: params.from,
    isClientMessage,
    is_sender: params.is_sender,
    currentUserEmail
  });

  if (!params.is_sender) {
    store.dispatch(changeVolumeAlert(1));
    store.dispatch(changeStatusAlertRunned(true));
  }
  store.dispatch(updateListBubbleChat(params));
  store.dispatch(updateNewMessage(true));
};

export const actionResolveMessage = (params) => {
  const state = store.getState();
  let date = createDate();
  if (!Boolean(state.authSetup?.agentSessions?.agentId)) {
    store.dispatch(updateFeatureActive('home'));
    store.dispatch(clearAllSessionsFromResolveChat());
    store.dispatch(clearAllSessionsFromResolveChat());
    store.dispatch(clearAllStateMessageSetup());
  } else {
    const message = {
      agent_avatar: null,
      agent_name: '',
      channel_id: 1,
      company_name: '',
      created_at: date,
      file_id: null,
      file_name: null,
      file_path: null,
      file_url: null,
      formatted_date: date,
      from: '',
      is_netral: true,
      netral_type: 'rating',
      is_sender: false,
      messsage: '',
      no_telegram: null,
      no_whatsapp: null,
      success: true,
      telegram_id: null,
      updated_at: date,
      user_email: null,
      user_name: null,
      user_phone: null,
    };

    store.dispatch(updateFeatureActive('rate_form'));
    store.dispatch(clearAllInputMessage());
    store.dispatch(updateListBubbleChat(message));
    store.dispatch(updateNewMessage(true));
  }

  store.dispatch(updateEmojiStatus(false));
  store.dispatch(updateFeatureBefore('not_opened'));
  return notify('success', 3000, 'Chat telah di akhiri');
};
