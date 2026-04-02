import Service from '../../../Common/service';

export const getLabels = async (token) => {
  const config = {
    headers: {
      'Content-type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await Service.getLabels(config);
  return response;
};
