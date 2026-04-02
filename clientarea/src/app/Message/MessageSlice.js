import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: '',
  fileType: null,
  fileName: null,
  fileSize: 0,
  fileUrl: null,
  filePath: null,
  fileId: null,
  listBubbleChat: [],
  chatId: null,
  isModalPreview: false,
  isResetMessage: false,
  isOpenEmoji: false,
  emojiProps: {
    perLine: 8,
    emojiSize: 14,
    emojiButtonSize: 38,
  },
};

export const MessageSlice = createSlice({
  name: 'messageSetup',
  initialState,
  reducers: {
    updateChatId: (state, action) => {
      state.chatId = action.payload;
    },
    updateMessage: (state, action) => {
      state.message = action.payload;
    },
    resetMessage: (state) => {
      state.message = '';
    },
    updateListBubbleChat: (state, action) => {
      state.listBubbleChat.push(action.payload);
    },
    updateBubbleChatFirstRefresh: (state, action) => {
      state.listBubbleChat = action.payload;
    },
    clearListBubble: (state) => {
      state.listBubbleChat = [];
    },
    updateFileData: (state, action) => {
      const data = action.payload;
      state.fileType = data.fileType;
      state.fileName = data.fileName;
      state.fileUrl = data.fileUrl;
      state.filePath = data.filePath;
      state.fileId = data.fileId;
    },
    clearFileData: (state) => {
      state.fileType = null;
      state.fileName = null;
      state.fileUrl = null;
      state.filePath = null;
      state.fileId = null;
    },
    updateIsModalPrev: (state, action) => {
      state.isModalPreview = action.payload;
    },
    updateIsResetMessage: (state, action) => {
      state.isResetMessage = action.payload;
    },
    clearAllInputMessage: (state) => {
      state.message = '';
      state.fileType = null;
      state.fileName = null;
      state.fileSize = 0;
      state.fileUrl = null;
      state.filePath = null;
      state.fileId = null;
      state.isModalPreview = false;
      state.isResetMessage = false;
    },
    clearAllStateMessageSetup: (state) => {
      state.message = '';
      state.fileType = null;
      state.fileName = null;
      state.fileSize = 0;
      state.fileUrl = null;
      state.filePath = null;
      state.fileId = null;
      state.listBubbleChat = [];
      state.chatId = null;
      state.isModalPreview = false;
      state.isResetMessage = false;
    },
    updateEmojiStatus: (state, action) => {
      state.isOpenEmoji = action.payload;
    },
    updateEmojiProps: (state, action) => {
      state.emojiProps = action.payload;
    },
  },
});

export const messageSelector = (state) => state.messageSetup;

export const {
  updateMessage,
  updateListBubbleChat,
  clearListBubble,
  updateBubbleChatFirstRefresh,
  resetMessage,
  updateChatId,
  updateFileData,
  clearFileData,
  updateIsModalPrev,
  updateIsResetMessage,
  clearAllInputMessage,
  clearAllStateMessageSetup,
  updateEmojiStatus,
  updateEmojiProps,
} = MessageSlice.actions;

export default MessageSlice.reducer;
