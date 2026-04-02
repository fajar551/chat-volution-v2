import classnames from 'classnames';
import React, { Fragment } from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';

function TabCategoryChat(props) {
  /* configuration */
  const { activeMenu, setCategoryChat } = props;

  /* handler */
  const changeActiveCategoryChat = (val) => {
    setCategoryChat(val);
  };

  return (
    <Fragment>
      <Nav pills className="mb-3">
        <NavItem id="chat-whatsapp" className="font-size-14">
          <NavLink
            className={classnames({
              active: activeMenu === 'chat-whatsapp',
            })}
            onClick={() => {
              changeActiveCategoryChat('chat-whatsapp');
            }}
          >
            WhatsApp
          </NavLink>
        </NavItem>
        <NavItem id="chat-livechat" className="font-size-14">
          <NavLink
            className={classnames({
              active: activeMenu === 'chat-livechat',
            })}
            onClick={() => {
              changeActiveCategoryChat('chat-livechat');
            }}
          >
            Live Chat
          </NavLink>
        </NavItem>
        {/**
         * Client Area Chat tab is temporarily hidden per request.
         * To re-enable, remove this comment block and restore the NavItem code.
         */}
      </Nav>
    </Fragment>
  );
}

export default TabCategoryChat;
