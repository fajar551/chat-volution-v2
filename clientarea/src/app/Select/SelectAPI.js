import Service from '../../common/Services';

export const getTopics = async (apiKey) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  };
  const path = `api/available-topics/list?api_key=${apiKey}`;

  const response = await Service.getTopics(config, path);
  return response;
};

export const getDepartments = async (apiKey) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  };
  const path = `api/available-departments/list?api_key=${apiKey}`;

  const response = await Service.getDepartments(config, path);
  return response;
};

export const getSocialMedia = async (apiKey) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  };
  const path = `api/available-channel-account/list?api_key=${apiKey}`;

  const response = await Service.getSocialMedia(config, path);
  return response;
};
