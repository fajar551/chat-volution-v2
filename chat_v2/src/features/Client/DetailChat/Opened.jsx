import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import SimpleBar from 'simplebar-react';
import BubbleChatClient from '../../../Common/Components/BubbleChat/BubbleChatClient';
import InputChatClient from '../../../Common/Components/InputChat/InputChatClient';
import SolveInput from '../../../Common/Components/InputChat/SolveInput';
import LoaderSpinner from '../../../Common/Components/Loader/LoaderSpinner';
import ProfileClientChat from '../../../Common/Components/UserProfileSidebar/ProfileClientChat';
import {
  closeChat,
  detailChatClientSelector,
  updateStatusRightBar,
} from './DetailChatClientSlice';
import Header from './Header';
import HeaderLoader from './HeaderLoader';
import { resetAllStateInputChat } from '../../../Common/Components/InputChat/InputChatSlice';
import { authSelector } from '../../../app/Auth/AuthSlice';
import WatchingInput from '../../../Common/Components/InputChat/WatchingInput';

function Opened(props) {
  /* config */
  const { statusDetail, detailClient, listBubbleChat } = props;
  const dispatch = useDispatch();
  const ref = useRef();
  const { rightBarMenu } = useSelector(detailChatClientSelector);
  const { user } = useSelector(authSelector);
  /* handler */
  const handlerResetAllInputMessage = () => {
    const elmessagePreview = document.getElementById('messagePreview');
    const elmessageDetailChat = document.getElementById('input-message');

    if (Boolean(elmessageDetailChat)) {
      elmessageDetailChat.innerHTML = '';
    }

    if (Boolean(elmessagePreview)) {
      elmessagePreview.innerHTML = '';
    }
  };

  const closeDetailChat = (event) => {
    if (event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      dispatch(closeChat());
      dispatch(resetAllStateInputChat());
      handlerResetAllInputMessage();
    } else {
      dispatch(closeChat());
      dispatch(resetAllStateInputChat());
      handlerResetAllInputMessage();
    }
  };

  const scrollToBottom = async () => {
    await ref.current.recalculate();
    if (ref.current.el) {
      ref.current.getScrollElement().scrollTop =
        ref.current.getScrollElement().scrollHeight;
    }
  };

  const HeaderDetailChat = (params) => {
    const { detailClient, statusDetail } = params;

    if (statusDetail === 'loader') {
      return <HeaderLoader />;
    } else {
      return (
        <Header
          detailClient={detailClient}
          closeChat={(event) => closeDetailChat(event)}
        />
      );
    }
  };

  const BottomDetailChat = (params) => {
    const { statusChat, statusDetail, rightBarMenu } = params;

    if (statusDetail !== 'loader') {
      if (![9, 10, 11].includes(statusChat)) {
        if (parseInt(detailClient.agent_id) === parseInt(user.agent_id)) {
          return <InputChatClient rightBarMenu={rightBarMenu} />;
        } else {
          return <WatchingInput />;
        }
      } else {
        return <SolveInput />;
      }
    }
  };

  useEffect(() => {
    if (listBubbleChat.length > 0) {
      scrollToBottom();
    }
  }, [listBubbleChat]);

  return (
    <>
      <div className="d-flex detail-chat">
        <div
          className={classNames({
            'w-100': true,
            'content-chat-limited-size': Boolean(rightBarMenu),
          })}
        >
          <HeaderDetailChat
            detailClient={detailClient}
            statusDetail={statusDetail}
          />
          {statusDetail === 'loader' && (
            <div className="d-flex justify-content-center align-items-center mt-1 mb-0">
              <LoaderSpinner />
            </div>
          )}
          <SimpleBar
            ref={ref}
            className={`chat-conversation ${
              statusDetail !== 'loader' ? '' : 'with-loader'
            } p-3 p-lg-4`}
            id="messages"
          >
            <ul className="list-unstyled mb-0">
              {listBubbleChat.map((val, index) => {
                return <BubbleChatClient key={index} data={val} />;
              })}
            </ul>
          </SimpleBar>
          <BottomDetailChat
            statusChat={detailClient.status}
            statusDetail={statusDetail}
            rightBarMenu={rightBarMenu}
          />
        </div>
        {rightBarMenu && (
          <ProfileClientChat
            detailClient={detailClient}
            rightBarMenu={rightBarMenu}
            updateStatusRightBar={updateStatusRightBar}
          />
        )}
      </div>
    </>
  );
}

export default Opened;
