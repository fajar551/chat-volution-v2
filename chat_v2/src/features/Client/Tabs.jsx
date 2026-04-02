import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TabContent, TabPane } from 'reactstrap';
import { layoutSetupSelector } from '../../../app/Layouts/LayoutSlice';
import { refreshData } from '../../../Common/WebSocket/Clients/ClientActions';
import ChatHistory from './ChatHistory/ChatHistory';
import ChatWithClients from './ChatWithClients/ChatWithClients';
import { changeLoaderStatusAllChat } from './ChatWithClients/ListChat/ListChatClientSlice';
import { changeLoaderStatusListAgents } from './ChatWithClients/OnlineUsers/OnlineUsersSlice';
import Profile from './Profile/Profile';

const Tabs = (props) => {
  /* config */
  const dispatch = useDispatch();
  const { activeTab } = useSelector(layoutSetupSelector);

  useEffect(() => {
    dispatch(changeLoaderStatusListAgents());
    dispatch(changeLoaderStatusAllChat());
  }, []);

  useEffect(() => {
    setTimeout(() => {
      refreshData();
    }, 3000);
  }, []);

  return (
    <>
      {activeTab !== 'Report-Chat-w-history' && (
        <div className="chat-leftsidebar me-lg-1">
          <TabContent activeTab={activeTab}>
            <TabPane tabId="profile" id="pills-user">
              <Profile />
            </TabPane>
            <TabPane tabId="Chat-w-clients" id="pills-user">
              <ChatWithClients />
            </TabPane>
            <TabPane tabId="Chat-w-history" id="pills-user">
              <ChatHistory />
            </TabPane>
          </TabContent>
        </div>
      )}
    </>
  );
};

export default Tabs;
