import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginClient } from './AuthAPI';

const initialState = {
  idUserCompany: null,
  userCompanyName: 'Demo Company',
  status: 'active',
  uuid: 'demo-uuid',
  apiKey: '$2y$10$TOqIq4oC0JGJiGuhMRRs.eLLeX73f6Bqf/f12NmN4..Zhv/VypIwi',

  clientSessions: {},
  agentSessions: {},
  isLoaderButtonLogin: false,

  /* please read on readme.md */
  statusConnect: 'not_action',
};

/* login client */
export const clientLogin = createAsyncThunk(
  'authSetup/clientLogin',
  async (data) => {
    const response = await loginClient(data);
    if (response.status === 200) {
      // Don't call refreshAuth here - it's already called in Form.jsx
      return response;
    }
    return response;
  }
);

export const AuthSlice = createSlice({
  name: 'authSetup',
  initialState,
  reducers: {
    removeAuthValidate: (state) => {
      state.idUserCompany = null;
      state.userCompanyName = null;
      state.status = 'not_active';
      state.uuid = null;
      state.apiKey = null;
    },
    updateDataAuth: (state, action) => {
      const dataAuth = action.payload;
      state.uuid = dataAuth.uuid || dataAuth.company_uuid;
      state.status = dataAuth.status_name || dataAuth.status;
      state.idUserCompany = dataAuth.id;
      state.userCompanyName = dataAuth.name || dataAuth.company_name;
      if (dataAuth.apiKey) {
        state.apiKey = dataAuth.apiKey;
      }
    },
    updateApiKey: (state, action) => {
      state.apiKey = action.payload;
    },
    updateStatusConnect: (state) => {
      state.isLoaderButtonLogin = false;
      state.statusConnect = 'connected';
    },
    updateStatusFromAction: (state, action) => {
      state.statusConnect = action.payload;
    },
    updateSessionsClient: (state, action) => {
      state.clientSessions = action.payload;
    },
    updateSessionsAgent: (state, action) => {
      state.agentSessions = action.payload;
    },
    clearAllSessionsFromResolveChat: (state) => {
      state.clientSessions = {};
      state.agentSessions = {};
      state.isLoaderButtonLogin = false;
      state.statusConnect = 'not_action';
      try {
        localStorage.removeItem('clientarea_session');
      } catch (e) {
        // ignore
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(clientLogin.pending, (state) => {
        state.isLoaderButtonLogin = true;
        state.statusConnect = 'pending';
        // state.clientSessions = {};
      })
      .addCase(clientLogin.fulfilled, (state, action) => {
        const dataRes = action.payload.data.data;
        const chatId = action.meta.arg.chatId || ''; // Get chatId from the argument
        const session = {
          companyUuid: dataRes.company_uuid,
          companyName: dataRes.company_name,
          departmentId: dataRes.department_id,
          departmentName: dataRes.department_name,
          emailClient: dataRes.email,
          nameClient: dataRes.name,
          topicId: dataRes.topic_id,
          topicName: dataRes.topic_name,
          chatId: chatId,
          room: '',
          channelName: '',
          channelId: '',
        };

        state.clientSessions = session;
        state.isLoaderButtonLogin = false; // Reset loading state
        state.statusConnect = 'integrate_socket';
      })
      .addCase(clientLogin.rejected, (state) => {
        state.isLoaderButtonLogin = false; // Reset loading state
        state.statusConnect = 'rejected';
      });
  },
});

export const authSelector = (state) => state.authSetup || {
  idUserCompany: null,
  userCompanyName: 'Demo Company',
  status: 'active',
  uuid: 'demo-uuid',
  apiKey: '$2y$10$TOqIq4oC0JGJiGuhMRRs.eLLeX73f6Bqf/f12NmN4..Zhv/VypIwi',
  clientSessions: {},
  agentSessions: {},
  isLoaderButtonLogin: false,
  statusConnect: 'not_action'
};
export const {
  removeAuthValidate,
  updateDataAuth,
  updateApiKey,
  updateStatusConnect,
  updateSessionsClient,
  updateSessionsAgent,
  clearAllSessionsFromResolveChat,
  updateStatusFromAction,
} = AuthSlice.actions;
export default AuthSlice.reducer;
