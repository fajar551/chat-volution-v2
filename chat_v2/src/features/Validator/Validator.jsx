import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { validateSession } from '../../app/Auth/AuthApi';
import { saveSessions } from '../../app/Auth/AuthSlice';
import '../../assets/scss/loader.scss';
import Service from '../../Common/service';
import Socket from '../../Common/WebSocket/Socket';
import socketConnect from '../../Common/WebSocket/SocketConnect';

const Validator = (props) => {
  /* configuration from import */
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* handler */
  const redirectToHome = () => {
    localStorage.clear();
    const urlRedirect = `${process.env.REACT_APP_LIVE_ENDPOINT_V1}/login`;
    window.location.replace(urlRedirect);
  };

  /* update title by name page */
  useEffect(() => {
    document.title = `${props.title} | ${process.env.REACT_APP_NAME}`;
  }, []);

  useEffect(() => {
    const session = !Boolean(localStorage.getItem('user'))
      ? null
      : JSON.parse(localStorage.getItem('user'));

    /* setup token use validation */
    let paramsToken = searchParams.get('token');
    let token = '';
    if (!paramsToken) {
      token = !Boolean(session) ? '' : session.token;
    } else {
      token = paramsToken;
    }

    /* validator */
    if (Boolean(token)) {
      validateSession(token)
        .then(async (response) => {
          const { login_data } = response.data;
          const usersData = {
            agent_id: login_data.id,
            uuid: login_data.uuid,
            company_uuid: login_data.company_uuid,
            name_agent: login_data.name,
            email_agent: login_data.email,
            phone_agent: login_data.phone,
            avatar: login_data.avatar,
            id_department: login_data.id_department,
            department_name: login_data.department_name,
            company_name: login_data.company_name,
            company_id: login_data.id_company,
            roles_id: login_data.permission,
            permission_name: login_data.roles_name,
            token: login_data.token,
            type_user: 'agent',
            status: 'online',
            full_access: login_data.full_access,
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
            if (login_data.company_name) {
              Socket.emit('join.company', { company_name: login_data.company_name });
            } else if (usersData.agent_id) {
              // Fallback: try authenticate with agent_id
              Socket.emit('authenticate', { agent_id: String(usersData.agent_id) });
            }
          } catch (socketError) {
            console.warn('Socket connection/authentication error:', socketError);
            // Continue even if socket fails - app should still work
          }

          await dispatch(saveSessions(usersData));
          navigate('../chat-with-client');
        })
        .catch((err) => {
          redirectToHome();
        });
    } else {
      redirectToHome();
    }
  }, []);

  return (
    <>
      <div className="page-loader">
        <div className="loader"></div>
      </div>
    </>
  );
};
export default Validator;
