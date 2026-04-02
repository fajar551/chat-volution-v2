import Service from '../../common/Services';

export const uploadFile = async (apiKey, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const path = `api/chat/upload-file?api_key=${apiKey}`;

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-Requested-With': 'xmlhttprequest',
    },
  };

  const response = await Service.uploadFile(path, formData, config);
  return response;
};
