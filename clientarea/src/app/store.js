import { configureStore } from '@reduxjs/toolkit';
import AuthReducer from '../app/Auth/AuthSlice';
import LayoutReducer from '../app/Layouts/LayoutSlice';
import MessageReducer from '../app/Message/MessageSlice';
import SelectReducer from '../app/Select/SelectSlice';

const SESSION_STORAGE_KEY = 'clientarea_session';

/** Load session dari localStorage agar tetap ada setelah reload */
export function loadPersistedSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !data.clientSessions || !data.clientSessions.chatId) return null;
    return {
      auth: {
        clientSessions: data.clientSessions,
        agentSessions: data.agentSessions || {},
        statusConnect: data.statusConnect || 'connected',
      },
      feature: data.feature || 'chat',
    };
  } catch (e) {
    return null;
  }
}

/** Simpan session ke localStorage (dipanggil dari subscribe) */
export function savePersistedSession(state) {
  try {
    const auth = state?.authSetup;
    const chatId = auth?.clientSessions?.chatId;
    if (chatId) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        clientSessions: auth.clientSessions,
        agentSessions: auth.agentSessions || {},
        statusConnect: auth.statusConnect || 'connected',
        feature: 'chat',
      }));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (e) {
    // ignore
  }
}

const persisted = loadPersistedSession();
const defaultAuth = {
  idUserCompany: null,
  userCompanyName: 'Demo Company',
  status: 'active',
  uuid: 'demo-uuid',
  apiKey: '$2y$10$TOqIq4oC0JGJiGuhMRRs.eLLeX73f6Bqf/f12NmN4..Zhv/VypIwi',
  clientSessions: {},
  agentSessions: {},
  isLoaderButtonLogin: false,
  statusConnect: 'not_action',
};

const defaultLayout = {
  feature: 'not_opened',
  featureBefore: 'not_opened',
  bodyMaxH: '400px',
  bodyMinH: '400px',
  deviceVersion: 'large_desktop',
  volumeAlert: 0,
  runAlert: false,
};

const defaultMessage = {
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
  emojiProps: { perLine: 8, emojiSize: 14, emojiButtonSize: 38 },
};

const { REACT_APP_DEV } = process.env;
export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'selectSetup/getListTopics/fulfilled',
          'selectSetup/getListDepartments/fulfilled',
          'selectSetup/getSocialMediaList/fulfilled',
          'authSetup/clientLogin/fulfilled',
        ],
      },
    }),
  reducer: {
    selectSetup: SelectReducer,
    layoutSetup: LayoutReducer,
    authSetup: AuthReducer,
    messageSetup: MessageReducer,
  },
  preloadedState: {
    authSetup: persisted
      ? { ...defaultAuth, ...persisted.auth }
      : defaultAuth,
    layoutSetup: persisted
      ? { ...defaultLayout, feature: persisted.feature, featureBefore: 'not_opened' }
      : defaultLayout,
    messageSetup: persisted?.auth?.clientSessions?.chatId
      ? { ...defaultMessage, chatId: persisted.auth.clientSessions.chatId }
      : defaultMessage,
  },
  devTools: REACT_APP_DEV === 'false' ? false : true,
});

// Simpan session ke localStorage setiap kali auth berubah
store.subscribe(() => {
  savePersistedSession(store.getState());
});
