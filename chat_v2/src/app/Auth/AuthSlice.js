import { createSlice } from '@reduxjs/toolkit';

/* layout mode default */
const getAuthSessions = !Boolean(localStorage.getItem('user'))
  ? {}
  : JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: getAuthSessions,
  isLogout: false,
  isReloadAll: false,
};

export const AuthSlice = createSlice({
  name: 'authSetup',
  initialState,
  reducers: {
    saveSessions: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    updateIsLogout: (state) => {
      state.isLogout = true;
    },
    updateStatusReloadAll: (state, action) => {
      state.isReloadAll = action.payload;
    },
  },
});

/* export state */
export const authSelector = (state) => state.authSetup;

/* export command function from reducer */
export const { saveSessions, updateStatusReloadAll, updateIsLogout } =
  AuthSlice.actions;

/* export all reducer auth slice */
export default AuthSlice.reducer;
