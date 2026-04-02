/* package */
import { configureStore } from '@reduxjs/toolkit';

/* reducer list */
import OnlineUsersReducer from '../features/Client/Tabs/ChatWithClients/OnlineUsers/OnlineUsersSlice';
import LayoutReducer from './Layouts/LayoutSlice';
import AuthReducer from './Auth/AuthSlice';
import ListChatClientReducer from '../features/Client/Tabs/ChatWithClients/ListChat/ListChatClientSlice';
import DetailChatClientReducer from '../features/Client/DetailChat/DetailChatClientSlice';
import InputChatReducer from '../Common/Components/InputChat/InputChatSlice';
import LabelReducer from '../Common/Components/Labels/LabelSlice';
import UserProfileReducer from '../Common/Components/UserProfileSidebar/UserProfileSidebarSlice';
import ReportChatReducer from '../features/ReportChat/ReportChatSlice';

const { REACT_APP_DEV } = process.env;

/* config reducer from list reducer */
export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    // https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'detailChatCLientSetup/getChatDetail/fulfilled',
          'detailChatClientSetup/getDetailClient/fulfilled',
          'labelSetup/getDataLabels/fulfilled',
          'listChatClientSetup/getListResolve/fulfilled',
          'detailChatClientSetup/getDetailHistory/fulfilled',
          'detailChatClientSetup/getHistoryChatAction/fulfilled',
          'inputChatSetup/getQuickReplies/fulfilled',
          'ReportChatSetup/getListReport/fulfilled',
          'ReportChatSetup/getListAgent/fulfilled',
          'ReportChatSetup/getDetailChatReport/fulfilled',
        ],
      },
    }),
  reducer: {
    onlineUserSetup: OnlineUsersReducer,
    layoutSetup: LayoutReducer,
    authSetup: AuthReducer,
    listChatClientSetup: ListChatClientReducer,
    detailChatCLientSetup: DetailChatClientReducer,
    inputChatSetup: InputChatReducer,
    labelSetup: LabelReducer,
    UserProfileSidebarSetup: UserProfileReducer,
    ReportChatSetup: ReportChatReducer,
  },
  devTools: REACT_APP_DEV === 'false' ? false : true,
});

/* used update localstorage or another db browser */
store.subscribe(() => {
  const state = store.getState();
  document.body.setAttribute('data-layout-mode', state.layoutSetup.layoutMode);
});
