import { Fragment, useState } from 'react';

/* redux and reducer */
import { useSelector } from 'react-redux';
import { onlineUsersSelector } from './OnlineUsers/OnlineUsersSlice';

/* component and library ui */
import ClientHeaderTab from '../../../../Common/Components/HeaderTab/ClientHeaderTab';
import ListChat from './ListChat/ListChat';
import OnlineUsers from './OnlineUsers/OnlineUsers';
import TabCategoryChat from './TabCategoryChat/CategoryChat';

const ChatWithClients = () => {
  /* selector */
  const { agent_online, loader_list_online } = useSelector(onlineUsersSelector);
  const [categoryChat, setCategoryChat] = useState('chat-whatsapp');

  return (
    <Fragment>
      <div>
        <div className="px-3 pt-3">
          <ClientHeaderTab attrClass="mb-3" value="Chats" />

          <OnlineUsers
            listAgentOnline={agent_online}
            statusLoader={loader_list_online}
          />
        </div>

        <div className="px-3 pt-0">
          <TabCategoryChat
            activeMenu={categoryChat}
            setCategoryChat={setCategoryChat}
          />
          <hr />
          <ListChat activeMenu={categoryChat} />
        </div>
      </div>
    </Fragment>
  );
};
export default ChatWithClients;
