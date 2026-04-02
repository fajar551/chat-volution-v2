import Service from '../../service';

export const uploadFile = async (token, channelId, file, getExtensionFile) => {
  const formData = new FormData();
  let url = '';
  let urlType = '';
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  if (channelId !== 1) {
    formData.append('files', file);
    url = 'api-socket/upload-file';
    urlType = 'socket';
  } else {
    formData.append('file', file);
    config.headers = {
      'X-Requested-With': 'xmlhttprequest',
      Authorization: `Bearer ${token}`,
    };
    url = 'api/chat/agent/upload-file';
    urlType = 'v1';
  }

  const response = await Service.uploadFileChat(url, formData, config, urlType);
  return response;
};

export const quickRepliesApi = async ({ token, query }) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      Authorization: `Bearer ${token}`,
    },
  };

  const path = `api/quick/reply/list`;
  const data = { q: query };
  const response = await Service.getQuickReplies(path, data, config);
  return response;
};
