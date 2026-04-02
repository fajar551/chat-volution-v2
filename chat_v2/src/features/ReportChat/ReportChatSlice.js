import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getDetailHistory } from '../Client/DetailChat/DetailChatClientAPI';
import { apiGetListAgent, apiGetListReport } from './ReportChatAPI';

const initialState = {
  dataHistoryReportChat: [],
  page: 1,
  totalDataHistory: 0,
  currentPageHistory: 0,
  firstPageHistory: 0,
  lastPageHistory: 0,
  nextPageHistory: '',
  prevPageHistory: '',
  totalPageHistory: 1,
  filterMessage: '',
  filterChatId: '',
  filterNameClient: '',
  filterEmailClient: '',
  filterAgentId: '',
  filterSiteUserUrl: '',
  filterStartDate: '',
  filterEndDate: '',
  dataListAgentFilter: [],
  dataChatReplies: [],
  dataDetailReportChat: {},
  isModal: false,
};

export const getListReport = createAsyncThunk(
  'ReportChatSetup/getListReport',
  async (params) => {
    const data = {
      page: params.page,
      start_date: params.start_date,
      end_date: params.end_date,
      chat_id: params.chat_id,
      user_name: params.user_name,
      user_email: params.user_email,
      message: params.message,
      agent_id: params.agent_id,
      site_url: params.site_url,
      with_pagination: true,
      set_per_page: 10,
    };
    const response = await apiGetListReport(data);
    return response;
  }
);

export const getListChoosedAgent = createAsyncThunk(
  'ReportChatSetup/getListAgent',
  async (token) => {
    const response = await apiGetListAgent(token);
    return response;
  }
);

export const getDetailReportChat = createAsyncThunk(
  'ReportChatSetup/getDetailChatReport',
  async (chatId) => {
    const response = await getDetailHistory(chatId);
    return response;
  }
);

export const ReportChatSlice = createSlice({
  name: 'ReportChatSetup',
  initialState,
  reducers: {
    updateDataReportChat: (state, action) => {
      state.dataHistoryReportChat = action.payload;
    },
    updateNumberPage: (state, action) => {
      state.page = action.payload;
    },
    updateFilter: (state, action) => {
      switch (action.payload.field) {
        case 'chat_id':
          state.filterChatId = action.payload.value;
          break;
        case 'nama_client':
          state.filterNameClient = action.payload.value;
          break;
        case 'email_client':
          state.filterEmailClient = action.payload.value;
          break;
        case 'agent':
          state.filterAgentId = action.payload.value;
          break;
        case 'user_site_url':
          state.filterSiteUserUrl = action.payload.value;
          break;
        default:
          state.filterMessage = action.payload.value;
          break;
      }
      return state;
    },
    updateFilterDateRange: (state, action) => {
      state.filterStartDate = action.payload.startDate;
      state.filterEndDate = action.payload.endDate;
      return state;
    },
    resetFilter: (state) => {
      state.filterMessage = '';
      state.filterChatId = '';
      state.filterNameClient = '';
      state.filterEmailClient = '';
      state.filterNameAgent = '';
      state.filterEmailAgent = '';
      state.filterStartDate = '';
      state.filterAgentId = '';
      state.filterEndDate = '';
      state.filterSiteUserUrl = '';
      return state;
    },
    changeStatusModal: (state, action) => {
      state.isModal = action.payload;
      if (!action.payload) {
        state.dataChatReplies = [];
        state.dataDetailReportChat = {};
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getListReport.fulfilled, (state, action) => {
      console.log('getListReport.fulfilled - action.payload:', action.payload);
      const data = action.payload.data.data;
      console.log('getListReport.fulfilled - data:', data);
      state.dataHistoryReportChat = data.list || [];
      state.totalDataHistory = parseInt(data.total) || 0;
      state.currentPageHistory = data.current_page || 0;
      state.firstPageHistory = data.first_page || 0;
      state.lastPageHistory = data.last_page || 0;
      state.nextPageHistory = data.next_page || null;
      state.prevPageHistory = data.prev_page || null;
      state.totalPageHistory = data.total_page || 1;
    });
    builder.addCase(getListReport.rejected, (state) => {
      state.dataHistoryReportChat = [];
      state.totalDataHistory = 0;
      state.currentPageHistory = 0;
      state.firstPageHistory = 0;
      state.lastPageHistory = 0;
      state.nextPageHistory = '';
      state.prevPageHistory = '';
      state.totalPageHistory = 1;
    });
    builder.addCase(getListChoosedAgent.fulfilled, (state, action) => {
      const data = action.payload.data.data;
      state.dataListAgentFilter = data;
      return state;
    });
    builder.addCase(getDetailReportChat.fulfilled, (state, action) => {
      const data = action.payload.data.data;
      state.dataChatReplies = data.chat_reply;
      state.dataDetailReportChat = {
        chat_id: data.chat_id,
        chat_labels: data.chat_labels,
        channel_name: data.channel_name,
        channel_id: data.channel_id,
        agent_name: data.agent_name,
        agent_email: data.agent_email,
        company_name: data.company_name,
        company_uuid: data.company_uuid,
        department_id: data.department_id,
        department_name: data.department_name,
        formatted_date: data.formatted_date,
        message: data.message,
        rating: data.rating,
        topic_id: data.topic_id,
        topic_name: data.topic_name,
        user_email: data.user_email,
        user_name: data.user_name,
        user_phone: data.user_phone,
        user_site_url: data.user_site_url,
        user_ip: data.user_ip,
        user_client_agent: data.user_client_agent,
      };

      state.isModal = true;
      return state;
    });
  },
});

export const reportChatSelector = (state) => state.ReportChatSetup;

export const {
  updateDataReportChat,
  updateNumberPage,
  updateFilterDateRange,
  updateFilter,
  resetFilter,
  changeStatusModal,
} = ReportChatSlice.actions;

export default ReportChatSlice.reducer;
