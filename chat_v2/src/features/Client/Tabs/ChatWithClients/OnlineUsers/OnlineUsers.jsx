import { Link } from 'react-router-dom';

//carousel
import './OnlineUsers.css';

/* reducer and helper */
import { useSelector } from 'react-redux';
import { authSelector } from '../../../../../app/Auth/AuthSlice';
import { validateUsersOnline } from '../../../../../Common/utils/helpers';

/* component */
import { UncontrolledTooltip } from 'reactstrap';
import { layoutSetupSelector } from '../../../../../app/Layouts/LayoutSlice';
import Skeletons from '../../../../../Common/Components/Skeletons';

function OnlineUsers(props) {
  /* first configuration */
  const { listAgentOnline, statusLoader } = props;
  const { SkeletonOnlineUserAgent } = Skeletons;

  /* selector */
  const { user } = useSelector(authSelector);
  const { layoutMode } = useSelector(layoutSetupSelector);

  const data = validateUsersOnline(listAgentOnline, user);

  // Debug: cek data agent online
  console.log('[OnlineUsers] statusLoader:', statusLoader);
  console.log('[OnlineUsers] listAgentOnline (dari Redux/WebSocket):', listAgentOnline);
  console.log('[OnlineUsers] user (session) agent_id / id:', user?.agent_id, user?.id);
  console.log('[OnlineUsers] data (setelah filter exclude diri sendiri):', data);
  console.log('[OnlineUsers] listAgentOnline length:', listAgentOnline?.length, '| data length:', data?.length);

  // Saat masih loading, selalu tampilkan skeleton
  if (statusLoader) {
    return <SkeletonOnlineUserAgent />;
  }

  // Setelah loading selesai, jika tidak ada agent tampilkan pesan kosong
  if (!listAgentOnline || listAgentOnline.length === 0 || data.length < 1) {
    return (
      <div className="pb-0 dot_remove text-center mb-3" dir="ltr">
        <div className="text-muted">
          <i className="fas fa-user-slash me-2"></i>
          Tidak ada agent yang sedang online
        </div>
      </div>
    );
  }

  // Ada data agent, tampilkan list
  return (
    <>
      <div className="position-relative mb-3">
        <ul className={`d-flex ps-0 list-agent-${layoutMode} pb-1`}>
          {data.map((val, key) => {
                return (
                  <li
                    className="list-inline-item list-agent-item"
                    id={`item-` + val.id}
                    key={val.id}
                  >
                    <div className="item">
                      <Link to="#" className="user-status-box-agent">
                        <div className="avatar-xs mx-auto d-block chat-img-list-agent online">
                          <img
                            src={val.avatar}
                            alt="user-img"
                            className="img-fluid rounded-circle text-center"
                          />
                          <span className="user-status"></span>
                        </div>
                        <h5 className="font-size-13 text-truncate mt-3 mb-1">
                          {val.email}
                        </h5>
                      </Link>
                      <UncontrolledTooltip
                        target={`item-` + val.id}
                        placement="bottom"
                      >
                        {val.email}
                      </UncontrolledTooltip>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      </>
    );
}

export default OnlineUsers;
