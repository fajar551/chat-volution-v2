import classnames from 'classnames';
import { Fragment, useState } from 'react';

/* redux and reducer */
import { useDispatch, useSelector } from 'react-redux';
import {
  changeLayoutMode,
  changeTabMenu,
  layoutSetupSelector,
} from '../../../app/Layouts/LayoutSlice';

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
  NavLink,
  UncontrolledTooltip,
} from 'reactstrap';

// import classnames from 'classnames';

import { authSelector } from '../../../app/Auth/AuthSlice';
import logo from '../../../assets/Logo/logo.png';
import { closeChat } from '../../../features/Client/DetailChat/DetailChatClientSlice';
import { handlerLogoutAllSession } from '../../WebSocket/Clients/ClientActions';

function LeftSidebarCLientArea() {
  /* setup */
  const dispatch = useDispatch();
  const { REACT_APP_LIVE_ENDPOINT_V1 } = process.env;
  const baseUrlV1 = REACT_APP_LIVE_ENDPOINT_V1;

  /* selector from reducer */
  const { layoutMode, activeTab } = useSelector(layoutSetupSelector);
  const { user } = useSelector(authSelector);
  /* variabel and state */
  const [dropdownProfileStatus, setDropdownProfileOpen] = useState(false);
  const [dropdownProfileStatusMobile, setDropdownProfileOpenMobile] =
    useState(false);

  /* handler */
  const toggleHandlerProfile = () =>
    setDropdownProfileOpen(!dropdownProfileStatus);

  const toggleHandlerProfileMobile = () =>
    setDropdownProfileOpenMobile(!dropdownProfileStatusMobile);

  const changeBodyLayout = (val) => {
    const mode = val === 'dark' ? 'light' : 'dark';

    dispatch(changeLayoutMode(mode));
  };

  const changeTabActive = (val) => {
    // Close detail chat when switching from Chat History to Chat tab
    if (activeTab === 'Chat-w-history' && val === 'Chat-w-clients') {
      dispatch(closeChat());
    }
    dispatch(changeTabMenu(val));
  };

  const handlerLogout = () => {
    handlerLogoutAllSession();
  };
  /* end handler */

  return (
    <Fragment>
      <div className="side-menu flex-lg-column me-lg-1">
        {/* logo */}
        <div className="navbar-brand-box">
          <a href={baseUrlV1} className="logo logo-dark">
            <span className="logo-sm">
              <img src={logo} alt="logo" />
            </span>
          </a>

          <a href={baseUrlV1} className="logo logo-light">
            <span className="logo-sm">
              <img src={logo} alt="logo" />
            </span>
          </a>
        </div>
        {/* end logo */}

        {/* side menu */}
        <div className="flex-lg-column my-auto">
          <Nav
            pills
            className="side-menu-nav justify-content-center"
            role="tablist"
          >
            <NavItem id="home">
              <NavLink id="pills-chat-tab" href={baseUrlV1}>
                <i className="ri-home-5-line"></i>
              </NavLink>
            </NavItem>
            <UncontrolledTooltip target="home" placement="top">
              Home
            </UncontrolledTooltip>
            <NavItem id="profile">
              <NavLink
                id="pills-user-tab"
                className={classnames({ active: activeTab === 'profile' })}
                onClick={() => {
                  changeTabActive('profile');
                }}
              >
                <i className="ri-user-3-line"></i>
              </NavLink>
            </NavItem>
            <UncontrolledTooltip target="profile" placement="top">
              Profile
            </UncontrolledTooltip>

            {[4].includes(user.roles_id) && (
              <>
                <NavItem id="Chat-w-clients">
                  <NavLink
                    id="pills-chat-tab"
                    className={classnames({
                      active: activeTab === 'Chat-w-clients',
                    })}
                    onClick={() => {
                      changeTabActive('Chat-w-clients');
                    }}
                  >
                    <i className="far fa-comment"></i>
                  </NavLink>
                </NavItem>
                <UncontrolledTooltip target="Chat-w-clients" placement="top">
                  Chat
                </UncontrolledTooltip>
                <NavItem id="Chat-w-history">
                  <NavLink
                    id="pills-chat-tab"
                    className={classnames({
                      active: activeTab === 'Chat-w-history',
                    })}
                    onClick={() => {
                      changeTabActive('Chat-w-history');
                    }}
                  >
                    <i className="ri-chat-history-line"></i>
                  </NavLink>
                </NavItem>
                <UncontrolledTooltip target="Chat-w-history" placement="top">
                  Chat History
                </UncontrolledTooltip>
              </>
            )}
            <NavItem id="Report-Chat-w-history">
              <NavLink
                id="pills-chat-tab"
                className={classnames({
                  active: activeTab === 'Report-Chat-w-history',
                })}
                onClick={() => {
                  changeTabActive('Report-Chat-w-history');
                }}
              >
                <i className="fas fa-calendar"></i>
              </NavLink>
            </NavItem>
            <UncontrolledTooltip target="Report-Chat-w-history" placement="top">
              Report Chat
            </UncontrolledTooltip>

            <Dropdown
              nav
              isOpen={dropdownProfileStatusMobile}
              toggle={toggleHandlerProfileMobile}
              className="profile-user-dropdown d-inline-block d-lg-none dropup"
            >
              <DropdownToggle nav>
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="profile-user rounded-circle"
                />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem onClick={() => changeBodyLayout(layoutMode)}>
                  {layoutMode === 'dark' ? 'Light' : 'Dark'} mode
                  <i
                    className={`${layoutMode === 'dark' ? 'ri-sun-fill' : 'ri-moon-fill'
                      } 
                  ${layoutMode === 'dark'
                        ? 'color-yellow-500'
                        : 'color-teal-500'
                      } float-end`}
                  ></i>
                </DropdownItem>
                <DropdownItem onClick={handlerLogout}>
                  Log out{' '}
                  <i className="ri-logout-circle-r-line float-end text-muted"></i>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Nav>
        </div>
        {/* end side menu */}

        {/* menu in bottom */}
        <div className="flex-lg-column d-none d-lg-block">
          <Nav className="side-menu-nav justify-content-center">
            <li className="nav-item">
              <NavLink
                id="light-dark"
                onClick={() => changeBodyLayout(layoutMode)}
              >
                <i
                  className={`${layoutMode === 'dark' ? 'fas fa-sun' : 'fas fa-moon'
                    } 
                  ${layoutMode === 'dark'
                      ? 'color-yellow-500'
                      : 'color-teal-500'
                    }`}
                ></i>
              </NavLink>
              <UncontrolledTooltip target="light-dark" placement="right">
                Switch to {layoutMode === 'dark' ? 'Light' : 'Dark'}
              </UncontrolledTooltip>
            </li>
            <Dropdown
              nav
              isOpen={dropdownProfileStatus}
              toggle={toggleHandlerProfile}
              className="nav-item btn-group dropup profile-user-dropdown"
            >
              <DropdownToggle className="nav-link" tag="a">
                <img
                  src={user.avatar}
                  alt="img"
                  className="profile-user rounded-circle"
                />
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={handlerLogout}>
                  Log out{' '}
                  <i className="ri-logout-circle-r-line float-end text-muted"></i>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Nav>
        </div>
        {/* end menu in bottom */}
      </div>
    </Fragment>
  );
}

export default LeftSidebarCLientArea;
