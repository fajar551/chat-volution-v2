import React from 'react';
import { Link } from 'react-router-dom';
import { TabContent, TabPane } from 'reactstrap';
import SimpleBar from 'simplebar-react';
import {
  capitalizeFirstLetter,
  validateDepartmentOnline,
  validateUsersOnline,
} from '../../../utils/helpers';
import { handlerTransferChat } from '../../../WebSocket/Clients/ClientActions';

function Content(props) {
  const { activeTab, dataAgent, dataDepartment, sessionUser, chatIdActive } =
    props;

  const ItemsListDepartment = (params) => {
    const { data, sessions, chatIdActive } = params;

    let validateData = validateDepartmentOnline(data, sessions);
    if (validateData.length < 1) {
      return (
        <>
          <div className="d-flex justify-content-center pt-3 border-top">
            No User Online Other Department
          </div>
        </>
      );
    }

    return validateData.map((val, index) => {
      return (
        <li
          key={index}
          onClick={() =>
            handlerTransferChat(chatIdActive, val.slug, 'department')
          }
        >
          <Link to="#">
            <div className="d-flex">
              <div className="chat-user-img online align-self-center me-3 ms-0">
                <i className="fas fa-building fa-2x"></i>
              </div>
              <div className="flex-grow-1 overflow-hidden">
                <h5 className="text-truncate font-size-15 mb-1">
                  {capitalizeFirstLetter(val.name)}
                </h5>
                {/* <p className="chat-user-message text-truncate mb-0">
                  Users Online: 50
                </p> */}
              </div>
            </div>
          </Link>
        </li>
      );
    });
  };

  const ItemsListUsers = (params) => {
    const { data, sessions, chatIdActive } = params;
    let validateData = validateUsersOnline(data, sessions);

    if (validateData.length < 1) {
      return (
        <>
          <div className="d-flex justify-content-center pt-3 border-top">
            No Agent Online
          </div>
        </>
      );
    }

    return validateData.map((val, index) => {
      return (
        <li
          key={index}
          onClick={() => handlerTransferChat(chatIdActive, val.id, 'user')}
        >
          <Link to="#">
            <div className="d-flex">
              <div className="chat-user-img online align-self-center me-3 ms-0">
                <img
                  src={val.avatar}
                  className="rounded-circle avatar-xs"
                  alt="chatvolution-avatar"
                />
                <span className="user-status online"></span>
              </div>
              <div className="flex-grow-1 overflow-hidden">
                <h5 className="text-truncate font-size-15 mb-1">{val.name}</h5>
                <p className="chat-user-message text-truncate mb-0">
                  {val.email}
                </p>
              </div>
            </div>
          </Link>
        </li>
      );
    });
  };
  return (
    <>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="agent-list">
          <div>
            <SimpleBar
              style={{ maxHeight: '100%' }}
              className="chat-message-list"
            >
              <ul
                className="list-unstyled chat-list chat-user-list"
                id="chat-list"
              >
                <ItemsListUsers
                  data={dataAgent}
                  sessions={sessionUser}
                  chatIdActive={chatIdActive}
                />
              </ul>
            </SimpleBar>
          </div>
        </TabPane>
        <TabPane tabId="department-list">
          <div>
            <SimpleBar
              style={{ maxHeight: '100%' }}
              className="chat-message-list"
            >
              <ul
                className="list-unstyled chat-list chat-user-list"
                id="chat-list"
              >
                <ItemsListDepartment
                  data={dataDepartment}
                  sessions={sessionUser}
                  chatIdActive={chatIdActive}
                />
              </ul>
            </SimpleBar>
          </div>
        </TabPane>
      </TabContent>
    </>
  );
}

export default Content;
