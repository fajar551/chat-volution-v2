import { updateIsLogout } from '../../../app/Auth/AuthSlice';
import {
  changeStatusAlertRunned,
  changeVolumeAlert,
} from '../../../app/Layouts/LayoutSlice';
import { store } from '../../../app/store';
import {
  addMessage,
  closeChat,
  updateBeforeJoinRoom,
  updateLabelChoose,
} from '../../../features/Client/DetailChat/DetailChatClientSlice';
import {
  getListResolveChat,
  updateCountingOngoing,
  updateOngoingList,
  updatePendingList,
  updateTransferList,
} from '../../../features/Client/Tabs/ChatWithClients/ListChat/ListChatClientSlice';
import {
  updateListAgents,
  updateListDepartments,
} from '../../../features/Client/Tabs/ChatWithClients/OnlineUsers/OnlineUsersSlice';
import { notify } from '../../utils/helpers';
import { handlerResetChat } from './ClientActions';

/* update agent online from listener socket */
export const updateListAgentOnline = (data) => {
  store.dispatch(updateListAgents(data));
};

/* update department agent online from listener socket */
export const updateListDepartmentOnline = (data) => {
  store.dispatch(updateListDepartments(data));
};

/* update list pendig */
export const updateDataListPending = (data) => {
  const state = store.getState();

  const session = state.authSetup.user;

  if (session.roles_id === 4) {
    const newListPending = data.length;
    const lengthOriginListPending = state.listChatClientSetup.pending.length;

    if (newListPending > lengthOriginListPending) {
      store.dispatch(changeVolumeAlert(1));
      store.dispatch(changeStatusAlertRunned(true));
    }
    store.dispatch(updatePendingList(data));
  }
};

/* update list ongoing */
export const updateDataListOngoing = (data) => {
  store.dispatch(
    updateCountingOngoing({
      unread_bubble_chat: data.unread_bubble_count,
      unread_count: data.unread_count,
    })
  );
  store.dispatch(updateOngoingList(data.list));
};

/* update list transfer */
export const updateListTransfer = (data) => {
  const state = store.getState();
  const newListTransfer = data.length;
  const originListTransferLength = state.listChatClientSetup.transfer.length;

  const session = state.authSetup.user;

  if (session.roles_id === 4) {
    if (newListTransfer > originListTransferLength) {
      store.dispatch(changeVolumeAlert(1));
      store.dispatch(changeStatusAlertRunned(true));
    }
    store.dispatch(updateTransferList(data));
  }
};

/* update list bubble chat */
export const updateListBubbleChat = (data) => {
  if (!data.success) {
    console.error('❌ Error from system in updateListBubbleChat:', data);
    return; // Only log error, no popup
  } else {
    const stateList = store.getState();
    const chatId = stateList.detailChatCLientSetup.chatId;
    if (data.chat_id === chatId) {
      store.dispatch(addMessage(data));
      if (data.from === stateList.authSetup.user.agent_id) {
        handlerResetChat(data.chat_id);
        store.dispatch(changeVolumeAlert(1));
        store.dispatch(changeStatusAlertRunned(true));
      } else {
        handlerResetChat(data.chat_id);
        store.dispatch(changeVolumeAlert(0));
        store.dispatch(changeStatusAlertRunned(true));
      }
    } else {
      if (data.from === stateList.authSetup.user.agent_id) {
        store.dispatch(changeVolumeAlert(0));
        store.dispatch(changeStatusAlertRunned(true));
      }
    }
  }
};

/* alert transfer chat */
export const alertTransferChat = (response) => {
  if (response.success === true) {
    return notify('success', 3000, 'Transfer Chat Success!');
  } else {
    return notify('error', 4000, response.message);
  }
};

/* update State before chat solved */
export const beforeSolveChat = (response) => {
  const session = store.getState().authSetup.user;

  if (response.success) {
    store.dispatch(closeChat());
    store.dispatch(getListResolveChat(session.uuid));
    return notify('success', 4000, response.message);
  } else {
    return notify('error', 4000, response.message);
  }
};

export const updateDataLabel = (response) => {
  store.dispatch(updateLabelChoose(response.data));
  return notify('success', 3000, 'Label is updated!');
};

export const handlerUpdateJoinRoom = (response) => {
  const { data, success } = response;

  if (!success) {
    console.warn('error joined room!');
  } else {
    store.dispatch(updateBeforeJoinRoom(data));
  }
};

export const logoutResponse = (response) => {
  const state = store.getState();
  const user = state.authSetup.user;
  if (user.uuid === response.data.uuid) {
    localStorage.clear();
    store.dispatch(updateIsLogout());
    return notify('success', 3000, 'Agent logout on all device');
  }
};
