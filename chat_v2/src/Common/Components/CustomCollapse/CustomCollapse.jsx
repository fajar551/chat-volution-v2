import { Fragment } from 'react';
import { CardBody, CardHeader, Collapse } from 'reactstrap';
const CustomCollapse = (props) => {
  const { isOpen, toggleCollapse } = props;
  return (
    <Fragment>
      <span
        role="button"
        onClick={toggleCollapse}
        className="cursor-pointer text-dark"
      >
        <CardHeader id="profile-user-headingOne">
          <h5 className="font-size-14 m-0">
            {props.iconClass && (
              <i
                className={
                  props.iconClass + ' me-2 align-middle d-inline-block'
                }
              ></i>
            )}
            {props.title}
            <i
              className={
                isOpen
                  ? 'mdi mdi-chevron-up float-end accor-plus-icon'
                  : 'mdi mdi-chevron-right float-end accor-plus-icon'
              }
            ></i>
          </h5>
        </CardHeader>
      </span>
      <Collapse isOpen={isOpen}>
        <CardBody>{props.children}</CardBody>
      </Collapse>
    </Fragment>
  );
};

export default CustomCollapse;
