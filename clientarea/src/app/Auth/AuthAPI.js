import Service from '../../common/Services';

export const validateAuth = async (apiKey) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  };
  const path = `api/validate-client?api_key=${apiKey}`;

  const response = await Service.validateAuth(config, path);
  return response;
};

export const loginClient = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const path = 'login-client';
  const response = await Service.loginClientAPI(path, data, config);
  return response;
};

export const fakeBubbleChatAPI = async () => {
  const response = await Service.fakeAPIBubbleChat();
  return response;
};

export const getInfoClient = async () => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const path = 'login-info';
  const response = await Service.infoClientAPI(config, path);
  return response;
};

export const handlerCloseSendRate = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const path = 'api-socket/send-chat-rating';

  const response = await Service.ApiSendRate(path, data, config);
  return response;
};
