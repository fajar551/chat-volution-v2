import axios from 'axios';

const {
  REACT_APP_LIVE_ENDPOINT,
  REACT_APP_LIVE_ENDPOINT_V1,
  REACT_APP_FAKER_ENDPOINT,
  REACT_APP_LOCAL_ENDPOINT,
  REACT_APP_SERVICE_WEB_SOCKET,
} = process.env;

const Put = (path, data, custom_url = false, config = {}) => {
  let BASE_URL = '';

  switch (custom_url) {
    case 'v1':
      BASE_URL = `${REACT_APP_LIVE_ENDPOINT_V1}/${path}`;
      break;
    case 'live':
      BASE_URL = `${REACT_APP_LIVE_ENDPOINT}/${path}`;
      break;
    case 'local':
      BASE_URL = `${REACT_APP_LOCAL_ENDPOINT}/${path}`;
      break;
    case 'socket':
      BASE_URL = `${REACT_APP_SERVICE_WEB_SOCKET}/${path}`;
      break;
    default:
      BASE_URL = `${REACT_APP_FAKER_ENDPOINT}/${path}`;
      break;
  }

  config.url = BASE_URL;
  config.data = data;
  config.method = 'PUT';

  const promise = new Promise((resolve, reject) => {
    axios(config)
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });

  return promise;
};

export default Put;
