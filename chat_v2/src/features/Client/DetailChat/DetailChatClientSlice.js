import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { joinRoom } from '../../../Common/WebSocket/Clients/ClientActions';
import {
  getChatAction,
  getClientDetailChat,
  getDetailChat,
  getDetailHistory,
} from './DetailChatClientAPI';

const initialState = {
  /* info open: not_open|open|error|loader */
  isOpen: 'not_open',

  errorMessage: null,
  chatId: null,
  listBubbleChat: [],
  detailClient: {},
  labelChoosed: [],
  runNavigateClose: false,
  actionHistory: [],

  /* actionStatus: join|error|null */
  actionStatus: null,

  /* true === open, false === close */
  rightBarMenu: false,
};

/* get chat detail */
export const getChatDetailClient = createAsyncThunk(
  'detailChatCLientSetup/getChatDetail',
  async (chatId) => {
    const response = await getDetailChat(chatId);
    if (response.status === 200) {
      const dataRes = response.data.data;
      if ([0, 2].includes(dataRes.status)) {
        joinRoom(dataRes.chat_id);
      }
    }
    return response;
  }
);

/* get detail client chat */
export const getDetailClientChat = createAsyncThunk(
  'detailChatClientSetup/getDetailClient',
  async (chatId) => {
    const response = await getClientDetailChat(chatId);
    return response;
  }
);

export const getDetailHistoryChat = createAsyncThunk(
  'detailChatClientSetup/getDetailHistory',
  async (chatId) => {
    const response = await getDetailHistory(chatId);
    return response;
  }
);

export const getHistoryChatAction = createAsyncThunk(
  'detailChatClientSetup/getHistoryChatAction',
  async (chatId) => {
    const response = await getChatAction(chatId);
    return response;
  }
);

export const DetailChatClientSlice = createSlice({
  name: 'detailChatCLientSetup',
  initialState,
  reducers: {
    updateOpenChat: (state, action) => {
      state.isOpen = 'loader';
      state.chatId = action.payload.chat_id;
    },
    closeChat: (state) => {
      state.isOpen = 'not_open';
      state.chatId = null;
      state.detailClient = {};
      state.listBubbleChat = [];
      state.runNavigateClose = true;
      state.rightBarMenu = false;
    },
    updateStatusNavigate: (state) => {
      state.runNavigateClose = false;
    },
    addMessage: (state, action) => {
      state.listBubbleChat.push(action.payload);
    },
    updateStatusRightBar: (state, action) => {
      state.rightBarMenu = action.payload;
    },
    updateLabelChoose: (state, action) => {
      state.labelChoosed = action.payload;
    },
    updateBeforeJoinRoom: (state, action) => {
      const resData = action.payload.chat_detail;

      state.labelChoosed = Boolean(resData.chat_labels)
        ? resData.chat_labels
        : [];

      state.isOpen = 'open';
      state.rightBarMenu = false;
      state.chatId = resData.chat_id;
      state.listBubbleChat = resData.chat_reply;

      state.detailClient = {
        chat_id: resData.chat_id,
        topic_name: resData.topic_name,
        user_name: resData.user_name,
        user_email: resData.user_email,
        agent_id: resData.agent_id,
        agent_name: resData.agent_name,
        agent_email: resData.agent_email,
        status: resData.status,
        channel_name: resData.channel_name,
        channel_id: resData.channel_id,
        department_id: resData.department_id,
        department_name: resData.department_name,
      };

      state.actionStatus = 'join';

      return state;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChatDetailClient.pending, (state) => {
        state.rightBarMenu = false;
        state.isOpen = 'loader';
        state.listBubbleChat = [];
        state.labelChoosed = [];
        state.actionStatus = null;
        return state;
      })
      .addCase(getChatDetailClient.fulfilled, (state, action) => {
        const resData = action.payload.data.data;
        state.labelChoosed = Boolean(resData.chat_labels)
          ? resData.chat_labels
          : [];
        state.isOpen = 'open';
        state.rightBarMenu = false;
        state.detailClient = {
          chat_id: resData.chat_id,
          topic_name: resData.topic_name,
          user_name: resData.user_name,
          user_email: resData.user_email,
          agent_id: resData.agent_id,
          agent_name: resData.agent_name,
          agent_email: resData.agent_email,
          status: resData.status,
          channel_name: resData.channel_name,
          channel_id: resData.channel_id,
          department_id: resData.department_id,
          department_name: resData.department_name,
        };

        state.chatId = resData.chat_id;

        state.listBubbleChat = resData.chat_reply;

        state.actionStatus = 'join';

        return state;
      })
      .addCase(getChatDetailClient.rejected, (state, action) => {
        state.isOpen = 'error';
        state.chatId = null;
        state.listBubbleChat = [];
        state.detailClient = {};
        state.labelChoosed = [];

        state.actionStatus = 'error';

        return state;
      })
      .addCase(getDetailHistoryChat.pending, (state) => {
        state.rightBarMenu = false;
        state.isOpen = 'loader';
        state.listBubbleChat = [];
        state.labelChoosed = [];
        state.actionStatus = null;
        state.detailClient = {};
        return state;
      })
      .addCase(getDetailHistoryChat.fulfilled, (state, action) => {
        const resData = action.payload.data.data;

        state.labelChoosed = Boolean(resData.chat_labels)
          ? resData.chat_labels
          : [];
        state.isOpen = 'open';
        state.rightBarMenu = false;
        state.detailClient = {
          chat_id: resData.chat_id,
          topic_name: resData.topic_name,
          user_name: resData.user_name,
          user_email: resData.user_email,
          status: resData.status,
          channel_name: resData.channel_name,
          channel_id: resData.channel_id,
          department_name: resData.department_name,
          department_id: resData.department_id,
        };

        state.chatId = resData.chat_id;

        state.listBubbleChat = resData.chat_reply;

        state.actionStatus = 'join';

        return state;
      })
      .addCase(getDetailHistoryChat.rejected, (state) => {
        state.isOpen = 'error';
        state.chatId = null;
        state.listBubbleChat = [];
        state.detailClient = {};
        state.labelChoosed = [];

        state.actionStatus = 'error';

        return state;
      })
      .addCase(getHistoryChatAction.pending, (state) => {
        state.actionHistory = [];
        return state;
      })
      .addCase(getHistoryChatAction.fulfilled, (state, action) => {
        const resData = action.payload.data;
        state.actionHistory = resData.data;
        return state;
      })
      .addCase(getHistoryChatAction.rejected, (state) => {
        state.isOpen = 'error';
        state.chatId = null;
        state.listBubbleChat = [];
        state.detailClient = {};
        state.labelChoosed = [];
        state.actionHistory = [];
        state.actionStatus = 'error';

        return state;
      });
  },
});

export const detailChatClientSelector = (state) => state.detailChatCLientSetup;

export const {
  updateOpenChat,
  closeChat,
  addMessage,
  updateStatusNavigate,
  updateStatusRightBar,
  updateLabelChoose,
  updateBeforeJoinRoom,
} = DetailChatClientSlice.actions;

export default DetailChatClientSlice.reducer;
