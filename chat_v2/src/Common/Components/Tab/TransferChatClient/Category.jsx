import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';

function Category(props) {
  const { activeTab, handlerClick } = props;
  return (
    <Nav pills className="mb-3 d-flex justify-content-center">
      <NavItem id="agent-list">
        <NavLink
          className={classnames({ active: activeTab === 'agent-list' })}
          onClick={() => {
            handlerClick('agent-list');
          }}
        >
          Agent
        </NavLink>
      </NavItem>
      <NavItem id="department-list">
        <NavLink
          className={classnames({ active: activeTab === 'department-list' })}
          onClick={() => {
            handlerClick('department-list');
          }}
        >
          Department
        </NavLink>
      </NavItem>
    </Nav>
  );
}

export default Category;
