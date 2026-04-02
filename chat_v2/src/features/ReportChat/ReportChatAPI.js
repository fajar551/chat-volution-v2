import Service from '../../Common/service';
import axios from 'axios';

/* get detail chat */
export const apiGetListReport = async (params) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'xmlhttprequest',
    },
    method: 'POST',
    url: 'https://admin-chat.genio.id/api/whatsapp/report/list',
    data: {
      page: params.page || 1,
      start_date: params.start_date || '',
      end_date: params.end_date || '',
      chat_id: params.chat_id || '',
      user_name: params.user_name || '',
      user_email: params.user_email || '',
      message: params.message || '',
      agent_id: params.agent_id || '',
      site_url: params.site_url || '',
    },
  };

  const response = await axios(config);
  return response.data;
};

export const apiGetListAgent = async (token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'xmlhttprequest',
      Authorization: `Bearer ${token}`,
    },
  };

  const path = `api/agent/all-agents`;
  const data = {
    id_roles: 4,
    id_department: null,
  };

  const response = await Service.getListAgent(path, data, config);
  return response;
};
