import { Fragment, useState } from 'react';

import { useSelector } from 'react-redux';
import { authSelector } from '../../../../app/Auth/AuthSlice';

import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Card,
} from 'reactstrap';

import SimpleBar from 'simplebar-react';
import CustomCollapse from '../../../../Common/Components/CustomCollapse/CustomCollapse';
import ClientHeaderTab from '../../../../Common/Components/HeaderTab/ClientHeaderTab';

const Profile = () => {
  const { user } = useSelector(authSelector);

  /* declare state collapse */
  const [isOpenAbout, setIsOpenAbout] = useState(true);

  /* handler collapse */
  const handlerCollapseAbout = () => {
    setIsOpenAbout(!isOpenAbout);
  };

  return (
    <Fragment>
      {/* dropdown menu profile */}
      <div className="px-4 pt-3 ">
        <div className="user-chat-nav float-end">
          <Dropdown isOpen={false} toggle={() => {}}>
            <DropdownToggle
              tag="a"
              className="font-size-18 text-muted dropdown-toggle"
            >
              <i className="ri-more-2-fill"></i>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem>{'Edit'}</DropdownItem>
              <DropdownItem>{'Action'}</DropdownItem>
              <DropdownItem divider />
              <DropdownItem>{'Another action'}</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <ClientHeaderTab attrClass="mb-3" value="Profile" />
      </div>
      {/* end dropdown menu profile */}

      {/* profile user */}
      <div className="text-center p-4 border-bottom">
        <div className="mb-4">
          <img
            src={user.avatar}
            className="rounded-circle avatar-lg img-thumbnail"
            alt="avatar-user"
          />
        </div>
        <h5 className="font-size-16 mb-1 text-truncate">{user.name_agent}</h5>
        <p className="text-muted text-truncate mb-1">
          <i className="ri-record-circle-fill font-size-10 text-success me-1 d-inline-block"></i>{' '}
          {'Online'}
        </p>
      </div>
      {/* end profile user */}

      {/* start profile description */}
      <SimpleBar
        style={{ maxHeight: '100%' }}
        className="p-4 user-profile-desc"
      >
        {/* user information */}
        <div id="profile-user-accordion-1" className="custom-accordion">
          <Card className="shadow-none border mb-2">
            <CustomCollapse
              title="About"
              iconClass="ri-user-line"
              isOpen={isOpenAbout}
              toggleCollapse={handlerCollapseAbout}
            >
              <div>
                <p className="text-muted mb-1">{'Name'}</p>
                <h5 className="font-size-14">{user.name_agent}</h5>
              </div>
              <div className="mt-4">
                <p className="text-muted mb-1">{'Email'}</p>
                <h5 className="font-size-14">{user.email_agent}</h5>
              </div>
              <div className="mt-4">
                <p className="text-muted mb-1">{'Phone'}</p>
                <h5 className="font-size-14 mb-0">{user.phone_agent}</h5>
              </div>
              <div className="mt-4">
                <p className="text-muted mb-1">{'Position'}</p>
                <h5 className="font-size-14 mb-0">{user.permission_name}</h5>
              </div>
              <div className="mt-4">
                <p className="text-muted mb-1">{'Department'}</p>
                <h5 className="font-size-14">{user.department_name}</h5>
              </div>
              <div className="mt-4">
                <p className="text-muted mb-1">{'Company'}</p>
                <h5 className="font-size-14 mb-0">{user.company_name}</h5>
              </div>
            </CustomCollapse>
          </Card>
        </div>
      </SimpleBar>
    </Fragment>
  );
};

export default Profile;
