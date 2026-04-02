import { createSlice } from '@reduxjs/toolkit';

/* layout mode default */
const layoutMode = !Boolean(localStorage.getItem('layoutMode'))
  ? 'light'
  : localStorage.getItem('layoutMode');

/* active tab with session exist */
const session = !Boolean(localStorage.getItem('user'))
  ? null
  : JSON.parse(localStorage.getItem('user'));

let activeTab = '';
if (Boolean(session)) {
  if ([4].includes(session.roles_id)) {
    activeTab = 'Chat-w-clients';
  } else {
    activeTab = 'profile';
  }
} else {
  activeTab = 'profile';
}

const initialState = {
  layoutMode: layoutMode,
  activeTab: activeTab,
  activeCategoryChat: 'chat-pending',
  isAnnouncement: true,
  volumeAlert: 0,
  runAlert: false,
};

export const LayoutClientAreaSlice = createSlice({
  name: 'layoutSetup',
  initialState,
  reducers: {
    changeLayoutMode: (state, action) => {
      state.layoutMode = action.payload;
      localStorage.setItem('layoutMode', action.payload);
      document.body.setAttribute('data-layout-mode', action.payload);
    },
    changeTabMenu: (state, action) => {
      state.activeTab = action.payload;
    },
    changeCategoryChat: (state, action) => {
      state.activeCategoryChat = action.payload;
    },
    changeIsAnnouncement: (state, action) => {
      state.isAnnouncement = action.payload;
    },
    changeVolumeAlert: (state, action) => {
      state.volumeAlert = action.payload;
    },
    changeStatusAlertRunned: (state, action) => {
      state.runAlert = action.payload;
    },
  },
});

/* export state */
export const layoutSetupSelector = (state) => state.layoutSetup;

/* export command function from reducer*/
export const {
  changeLayoutMode,
  changeTabMenu,
  changeCategoryChat,
  changeIsAnnouncement,
  changeVolumeAlert,
  changeStatusAlertRunned,
} = LayoutClientAreaSlice.actions;

/* exporting all reduxer layout slice*/
export default LayoutClientAreaSlice.reducer;
