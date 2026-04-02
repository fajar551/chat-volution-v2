import { store } from '../../../app/store';
import { closeChat } from '../../../features/Client/DetailChat/DetailChatClientSlice';
import { updateMessage } from '../../Components/InputChat/InputChatSlice';
import Service from '../../service';
import Socket from '../Socket';

export const refreshData = () => {
  Socket.disconnect();
  Socket.connect();
  setTimeout(() => {
    Socket.emit('reload');
  }, 3000);
};

export const reloadOnly = () => {
  Socket.emit('reload');
};

export const joinRoom = (chatId) => {
  Socket.emit('room.join', chatId);
};

export const sendMessage = (chatId, message, file = {}) => {
  const dataSenderDefault = { chatId, message };
  const resultDataSender = Object.assign(dataSenderDefault, file);
  Socket.emit('message', resultDataSender);
  store.dispatch(updateMessage(null));
};

export const solveChat = (chatId) => {
  Socket.emit('chat.end', { chatId });
};

export const handlerTransferChat = (chatId, id, type) => {
  const data = {
    chatId,
  };

  if (type === 'user') {
    data.toAgent = id;
  } else {
    data.toDepartment = id;
  }

  Socket.emit('chat.transfer', data);
  store.dispatch(closeChat());
};

export const handlerUpdateLabels = (chatId, labels) => {
  const dataEmit = {
    chatId: chatId,
    labels: labels,
  };
  Socket.emit('label.update', dataEmit);
};

export const handlerLogoutAllSession = () => {
  const state = store.getState();
  const user = state.authSetup.user;

  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
      'X-Requested-With': 'xmlhttprequest',
    },
  };

  Service.logoutV1(config)
    .then((response) => {
      Socket.emit('logout');
    })
    .catch((err) => {
      localStorage.clear();
      const urlRedirect = `${process.env.REACT_APP_LIVE_ENDPOINT_V1}/login`;
      window.location.replace(urlRedirect);
    });
};

export const handlerResetChat = (chatId) => {
  Socket.emit('chat.read.reset', {
    chatId: chatId,
    withRefresh: true,
  });
};
