import Service from '../../../../../Common/service';

export const getListChatCLient = () => {
  return Service.getListChatClient()
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err;
    });
};

export const getListHistoryChat = async (uuid) => {
  // Disabled to prevent 404 errors - this endpoint is not working
  // const path = 'api-socket/chats/resolve-chat-from-backups';
  // const data = {
  //   // with_pagination: false,
  //   // company_uuid: uuid,
  //   // set_per_page: 20,
  //   // page: 1,
  // };
  // const config = {
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // };

  // const response = await Service.getListResolveChat(path, data, config);
  // return response;

  // Return empty result to prevent errors
  return {
    data: {
      data: {
        list: []
      }
    }
  };
};
