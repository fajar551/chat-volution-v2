import Service from '../../Common/service/';

export const validateSession = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Requested-With': 'xmlhttprequest',
    },
  };

  const response = await Service.validateSession(config);
  return response;
};
