import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  formModalLabel: false,
  isAboutCollapse: false,
  isLabelCollapse: false,
  isChatActionCollapse: false,
};

export const UserProfileSidebarSlice = createSlice({
  name: 'UserProfileSidebarSetup',
  initialState,
  reducers: {
    updateFormModalLabel: (state, action) => {
      state.formModalLabel = action.payload;
    },
    updateCollapse: (state, action) => {
      const actionCollapse = action.payload;
      switch (actionCollapse.name) {
        case 'about':
          state.isAboutCollapse = !actionCollapse.status ? true : false;
          state.isLabelCollapse = false;
          state.isChatActionCollapse = false;
          break;
        case 'chat_action':
          state.isAboutCollapse = false;
          state.isLabelCollapse = false;
          state.isChatActionCollapse = !actionCollapse.status ? true : false;
          break;
        default:
          state.isAboutCollapse = false;
          state.isLabelCollapse = !actionCollapse.status ? true : false;
          state.isChatActionCollapse = false;
          break;
      }
    },
  },
});

export const UserProfileSidebarSelector = (state) =>
  state.UserProfileSidebarSetup;

export const { updateFormModalLabel, updateCollapse } =
  UserProfileSidebarSlice.actions;

export default UserProfileSidebarSlice.reducer;
