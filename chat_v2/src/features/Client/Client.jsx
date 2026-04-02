/* react */
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

/* redux and reducer */
import { useDispatch, useSelector } from 'react-redux';

/* css, image */
import '../../assets/scss/themes.scss';

/* component */
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LeftSidebarCLientArea from '../../Common/Components/LeftSidebarClientArea/LeftSidebarClientArea';
import DetailChat from './DetailChat/DetailChat';
import Tabs from './Tabs/Tabs';

/* import socket listner */
import {
  changeStatusAlertRunned,
  changeVolumeAlert,
  layoutSetupSelector,
} from '../../app/Layouts/LayoutSlice';
import {
  checkAvailableSessions,
  validateSessions,
} from '../../Common/utils/helpers';
import {
  getDetailClientChat,
  getDetailHistoryChat,
  getHistoryChatAction,
  updateOpenChat,
} from './DetailChat/DetailChatClientSlice';

import useSound from 'use-sound';
import swushSfx from '../../assets/sound/swush.mp3';
import Service from '../../Common/service';
import { getListResolveChat } from './Tabs/ChatWithClients/ListChat/ListChatClientSlice';
import Socket from '../../Common/WebSocket/Socket';
import socketConnect from '../../Common/WebSocket/SocketConnect';

const Client = (props) => {
  const { chatIdActive } = useParams();
  const dispatch = useDispatch();
  const { runAlert, volumeAlert } =
    useSelector(layoutSetupSelector);

  const [play] = useSound(swushSfx, {
    volume: volumeAlert,
  });

  /* handler */
  const handlerRunAlert = () => {
    play();
    dispatch(changeStatusAlertRunned(false));
  };

  /* onload first */
  useEffect(() => {
    const checkSession = checkAvailableSessions();
    if (!checkSession.isSessions) {
      localStorage.clear();
      const urlRedirect = `${process.env.REACT_APP_LIVE_ENDPOINT_V1}/login`;
      window.location.replace(urlRedirect);
    } else {
      validateSessions(checkSession.dataSessions, 'update_session')
        .then(async (response) => {
          const { data } = response;

          const usersData = {
            agent_id: data.id,
            uuid: data.uuid,
            company_uuid: data.company_uuid,
            name_agent: data.name,
            email_agent: data.email,
            phone_agent: data.phone,
            avatar: data.avatar,
            id_department: data.id_department,
            department_name: data.department_name,
            company_name: data.company_name,
            company_id: data.id_company,
            roles_id: data.permission,
            permission_name: data.roles_name,
            token: data.token,
            type_user: 'agent',
            status: 'online',
            full_access: data.full_access,
          };
          await Service.authUserToSocket(usersData);

          // Connect socket and authenticate/join company room
          // This is needed to receive users.online events
          try {
            // Ensure socket is connected
            if (!Socket.connected) {
              await socketConnect();
            }

            // Authenticate with socket and join company room
            // This will trigger backend to emit users.online event
            if (data.company_name) {
              Socket.emit('join.company', { company_name: data.company_name });
            } else if (usersData.agent_id) {
              // Fallback: try authenticate with agent_id
              Socket.emit('authenticate', { agent_id: String(usersData.agent_id) });
            }
          } catch (socketError) {
            console.warn('Socket connection/authentication error:', socketError);
            // Continue even if socket fails - app should still work
          }

          dispatch(getListResolveChat(data.uuid));

          if (Boolean(chatIdActive)) {
            const splitParams = chatIdActive.split('-');
            if (splitParams[1] === 'CH') {
              dispatch(getHistoryChatAction(splitParams[0]));
              dispatch(getDetailHistoryChat(splitParams[0]));
            } else if (splitParams[0] === 'whatsapp') {
              // Handle WhatsApp chat routing
              dispatch(updateOpenChat({ chat_id: chatIdActive }));
            } else {
              dispatch(getDetailClientChat(splitParams[0]));
            }
          }
        })
        .catch((err) => {
          localStorage.clear();
          const urlRedirect = `${process.env.REACT_APP_LIVE_ENDPOINT_V1}/login`;
          window.location.replace(urlRedirect);
        });
    }
  }, []);

  useEffect(() => {
    document.title = `${props.title} | ${process.env.REACT_APP_NAME}`;
  }, []);

  useEffect(() => {
    handlerRunAlert();
  }, [runAlert]);

  return (
    <>
      <ToastContainer limit={5} />
      <div className="layout-wrapper d-lg-flex">
        <LeftSidebarCLientArea />
        <Tabs />
        <DetailChat chatId={chatIdActive} />
      </div>
    </>
  );
};

export default Client;
