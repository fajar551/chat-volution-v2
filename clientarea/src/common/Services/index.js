import Get from './Get';
import GetThunk from './GetThunk';
import Post from './Post';
import PostThunk from './PostThunk';

/* service post */
const loginClientAPI = (path, data, config) =>
  PostThunk(path, true, data, 'socket', config);
const uploadFile = (path, data, config) =>
  Post(path, false, data, 'v1', config);
const ApiSendRate = (path, data, config) =>
  Post(path, true, data, 'socket', config);

/* service get */
const validateAuth = (config, path) => Get(path, false, 'v1', config);
const getTopics = (config, path) => GetThunk(path, false, 'v1', config);
const getDepartments = (config, path) => GetThunk(path, false, 'v1', config);
const getSocialMedia = (config, path) => GetThunk(path, false, 'v1', config);
const infoClientAPI = (config, path) => GetThunk(path, true, 'socket', config);
const fakeAPIBubbleChat = () => GetThunk('chat_reply', false, 'faker', {});
/* service update */

/* service delete */

const Service = {
  validateAuth,
  getTopics,
  getDepartments,
  getSocialMedia,
  loginClientAPI,
  infoClientAPI,
  fakeAPIBubbleChat,
  uploadFile,
  ApiSendRate,
};

export default Service;
