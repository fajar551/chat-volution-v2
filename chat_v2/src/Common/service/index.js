/* import not thunk method */
import Get from './Get';
import Post from './Post';

/* import service api for thunk method */
import GetThunk from './GetThunks';
import PostThunk from './PostThunks';

/* service get */
const getChattAgent = () => Get('chatting');
const validateSession = (config) => Get('api/validate', false, 'v1', config);
const getListChatClient = () => Get('chatting');
const getDetailChatClient = (path, config) =>
  GetThunk(path, true, 'socket', config);
const getDetailClientChat = (path, config) =>
  GetThunk(path, true, 'socket', config);
const getLabels = (config) =>
  GetThunk('api/chat/agent/chat-label/list', false, 'v1', config);

/* service post */
const authUserToSocket = (data) => Post('login', true, data, 'socket');
const uploadFileChat = (path, data, config, urlType) =>
  Post(path, false, data, urlType, config);
const getListResolveChat = (path, data, config) =>
  Post(path, true, data, 'socket', config);
const getDetailHistoryChat = (path, data, config) =>
  PostThunk(path, true, data, 'socket', config);
const getHistoryChatAction = (path, data, config) =>
  PostThunk(path, true, data, 'socket', config);
const apiSendHistoryChat = (path, data, config) =>
  PostThunk(path, true, data, 'socket', config);
const getQuickReplies = (path, data, config) =>
  PostThunk(path, false, data, 'v1', config);
const logoutV1 = (config) => PostThunk('api/logout', false, {}, 'v1', config);
const getListReport = (path, data, config) =>
  PostThunk(path, true, data, 'socket', config);
const getListAgent = (path, data, config) =>
  PostThunk(path, false, data, 'v1', config);

/* declare routing */
const Service = {
  getChattAgent,
  validateSession,
  authUserToSocket,
  getListChatClient,
  getDetailChatClient,
  getDetailClientChat,
  uploadFileChat,
  getLabels,
  getListResolveChat,
  getDetailHistoryChat,
  getHistoryChatAction,
  getQuickReplies,
  logoutV1,
  getListReport,
  getListAgent,
  apiSendHistoryChat,
};

export default Service;
