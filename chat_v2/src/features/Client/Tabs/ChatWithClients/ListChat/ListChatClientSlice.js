import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getListHistoryChat } from './ListChatClientAPI';

const initialState = {
  pending: [],
  transfer: [],
  ongoing: [],
  history: [],
  ongoing_unread_count: 0,
  ongoing_unread_bubble_count: 0,
  transfer_unread_count: 0,
  transfer_unread_bubble_count: 0,
  pending_unread_count: 0,
  pending_unread_bubble_count: 0,
  loader_list_chat: false,
  loader_ongoing: false,
  loader_transfer: false,
  loader_history: false,
  isStatusListResolve: true,
  queryListHistory: '',
};

export const getListResolveChat = createAsyncThunk(
  'listChatClientSetup/getListResolve',
  async (uuid) => {
    const response = await getListHistoryChat(uuid);
    return response;
  }
);

export const ListChatClientSlice = createSlice({
  name: 'listChatClientSetup',
  initialState,
  reducers: {
    changeLoaderStatusAllChat: (state) => {
      state.loader_pending = true;
      state.loader_ongoing = true;
      state.loader_transfer = true;
      state.loader_history = true;
      state.pending = [];
      state.transfer = [];
      state.ongoing = [];
      state.history = [];
      state.chat_active = null;
    },
    updatePendingList: (state, action) => {
      state.pending = action.payload;
      state.loader_pending = false;
    },
    updateOngoingList: (state, action) => {
      state.ongoing = action.payload;
      state.loader_ongoing = false;
    },
    updateTransferList: (state, action) => {
      state.transfer = action.payload;
      state.loader_transfer = false;
    },
    updateResolveList: (state, action) => {
      state.history = action.payload;
      state.loader_history = false;
    },
    closeChat: (state) => {
      return state;
    },
    updateStatusResolveList: (state, action) => {
      state.isStatusListResolve = action.payload;
    },
    updateCountingOngoing: (state, action) => {
      state.ongoing_unread_count = action.payload.unread_count;
      state.ongoing_unread_bubble_count = action.payload.unread_bubble_count;
    },
    updateCountingTransfer: (state, action) => {
      state.transfer_unread_count = action.payload.unread_count;
      state.transfer_unread_bubble_count = action.payload.unread_bubble_count;
    },
    updateCountingPending: (state, action) => {
      state.pending_unread_count = action.payload.unread_count;
      state.pending_unread_bubble_count = action.payload.unread_bubble_count;
    },
    updateQueryListHistory: (state, action) => {
      state.queryListHistory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getListResolveChat.pending, (state) => {
        state.loader_history = false;
        state.isStatusListResolve = true;
        state.history = [];
      })
      .addCase(getListResolveChat.fulfilled, (state, action) => {
        const resData = action.payload.data.data;
        state.loader_history = false;
        state.isStatusListResolve = true;
        state.history = resData.list;
      })
      .addCase(getListResolveChat.rejected, (state) => {
        state.isStatusListResolve = false;
      });
  },
});

/* export state */
export const listChatClientSelector = (state) => state.listChatClientSetup;

/* export command function from reducer */
export const {
  updatePendingList,
  updateOngoingList,
  updateTransferList,
  closeChat,
  changeLoaderStatusAllChat,
  updateResolveList,
  updateStatusResolveList,
  updateCountingOngoing,
  updateCountingTransfer,
  updateCountingPending,
  updateQueryListHistory,
} = ListChatClientSlice.actions;

/* export all reduxer ListChatClientSlice */
export default ListChatClientSlice.reducer;
