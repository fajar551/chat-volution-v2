import React, { Fragment } from 'react';
import { TabPane } from 'reactstrap';
import SimpleBar from 'simplebar-react';

/* component */
import ClientListChat from '../../../../../Common/Components/ListChat/ClientListChat';
import Skeletons from '../../../../../Common/Components/Skeletons';

function OnGoing(props) {
  const { data, isLoader, chatIdActive } = props;
  const { SkeletonListChat } = Skeletons;

  const Items = (params) => {
    const { isLoader, data } = params;

    if (isLoader) {
      return <SkeletonListChat />;
    }

    if (data.length < 1) {
      return (
        <li id="conversation-chat-empty" className="active">
          <div className="d-flex justify-content-center p-5">
            <h5 className="mb-2 font-size-14">Chat Not Found!</h5>
          </div>
        </li>
      );
    }

    return data.map((val, index) => {
      let isActive = '';
      if (chatIdActive === val.chat_id) {
        isActive = 'active';
      }

      return (
        <ClientListChat
          key={index}
          index={index}
          data={val}
          isActive={`listChatClient ${isActive}`}
          chatIdActive={chatIdActive}
          detailType="CO"
        />
      );
    });
  };

  return (
    <Fragment>
      <TabPane tabId="chat-ongoing">
        <div>
          <h5 className="mb-2 font-size-16">On Going Chat</h5>
          <hr />
          <SimpleBar
            style={{ maxHeight: '100%' }}
            className="chat-message-list"
          >
            <ul
              className="list-unstyled chat-list chat-user-list"
              id="chat-list"
            >
              <Items isLoader={isLoader} data={data} />
            </ul>
          </SimpleBar>
        </div>
      </TabPane>
    </Fragment>
  );
}

export default OnGoing;
