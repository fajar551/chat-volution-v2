import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { quickRepliesApi } from './InputChatApi';

const initialState = {
  fileClientObject: null,
  isSelectedFileClient: false,
  messageClient: '',
  uploadFileResult: {},
  isOpenEmoji: false,
  isQuickChat: false,
  dataQuickReplies: [],
  chooseQuickReply: {},
  isChooseQuickReply: false,
};

export const getQuickReplies = createAsyncThunk(
  'inputChatSetup/getQuickReplies',
  async (params) => {
    const response = await quickRepliesApi(params);
    return response;
  }
);

export const InputChatSlice = createSlice({
  name: 'inputChatSetup',
  initialState,
  reducers: {
    closePreview: (state) => {
      state.uploadFileResult = {};
      state.isSelectedFileClient = false;
    },
    chooseFileFromClient: (state, action) => {
      state.isSelectedFileClient = action.payload;
      state.uploadFileResult = {};
    },
    updateMessage: (state, action) => {
      state.messageClient = action.payload;
    },
    fullFilledUploadFile: (state, action) => {
      const result = action.payload;
      state.uploadFileResult = result;
    },
    updateIsEmoji: (state, action) => {
      state.isOpenEmoji = action.payload;
    },
    addChooseQuickReply: (state, action) => {
      state.isOpenEmoji = false;
      state.isQuickChat = false;
      state.messageClient = action.payload.message;
      state.dataQuickReplies = [];
      state.chooseQuickReply = action.payload;
    },
    resetQuickReply: (state) => {
      state.dataQuickReplies = [];
      state.isQuickChat = false;
      state.chooseQuickReply = {};
    },
    resetAllStateInputChat: (state) => {
      state.fileClientObject = null;
      state.isSelectedFileClient = false;
      state.messageClient = '';
      state.uploadFileResult = {};
      state.isOpenEmoji = false;
      state.isQuickChat = false;
      state.dataQuickReplies = [];
      state.chooseQuickReply = {};
      state.isChooseQuickReply = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getQuickReplies.pending, (state) => {
        state.isQuickChat = false;
        state.dataQuickReplies = [];
      })
      .addCase(getQuickReplies.fulfilled, (state, action) => {
        const resData = action.payload.data;
        state.isQuickChat = true;
        state.dataQuickReplies = resData.data;
      });
  },
});

export const inputChatSelector = (state) => state.inputChatSetup;

export const {
  chooseFileFromClient,
  updateMessage,
  fullFilledUploadFile,
  closePreview,
  updateIsEmoji,
  resetQuickReply,
  addChooseQuickReply,
  resetAllStateInputChat,
} = InputChatSlice.actions;

export default InputChatSlice.reducer;
