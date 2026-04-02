import {
  alertTransferChat,
  beforeSolveChat,
  handlerUpdateJoinRoom,
  logoutResponse,
  updateDataLabel,
  updateDataListOngoing,
  updateDataListPending,
  updateListAgentOnline,
  updateListBubbleChat,
  updateListDepartmentOnline,
  updateListTransfer,
} from './ClientUpdateState';

const ClientListens = (Socket) => {
  Socket.on('users.online', (data) => {
    updateListAgentOnline(data);
  });

  Socket.on('room.onlineuser', (response) => {});

  Socket.on('departments.online', (data) => {
    updateListDepartmentOnline(data);
  });

  Socket.on('chat.pending', (data) => {
    updateDataListPending(data);
  });

  Socket.on('chat.ongoing', (data) => {
    updateDataListOngoing(data);
  });

  Socket.on('chat.pendingtransfer', (data) => {
    updateListTransfer(data);
  });

  Socket.on('chat.transferresult', (response) => {
    alertTransferChat(response);
  });

  Socket.on('room.joinresult', (response) => {
    handlerUpdateJoinRoom(response);
  });

  Socket.on('message', (data) => {
    updateListBubbleChat(data);
  });

  Socket.on('chat.endresult', (response) => {
    beforeSolveChat(response);
  });

  Socket.on('chat.read.result', (response) => {
    if (response.success) {
      console.warn('read success');
    } else {
      console.warn('read error:', response.message);
    }
  });

  Socket.on('label.updateresult', (response) => {
    updateDataLabel(response);
  });

  Socket.on('logoutresult', (response) => {
    logoutResponse(response);
  });
};

export default ClientListens;
