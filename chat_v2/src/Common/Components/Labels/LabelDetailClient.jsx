import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Col } from 'reactstrap';
import { authSelector } from '../../../app/Auth/AuthSlice';

function LabelDetailClient(props) {
  const { labelChoosed, removeLabel, detailClient } = props;
  const { user } = useSelector(authSelector);

  const ButtonDeleteLabel = (params) => {
    const { data } = params;
    if (![9, 10, 11].includes(detailClient.status)) {
      if (parseInt(detailClient.agent_id) === parseInt(user.agent_id)) {
        return (
          <Button
            type="button"
            color="transparent"
            className="btn-sm text-white"
            onClick={() => removeLabel(data.id)}
          >
            <i className="ri-close-fill"></i>
          </Button>
        );
      }
    }
  };

  if (labelChoosed.length > 0) {
    const listLabels = labelChoosed.map((value, key) => {
      const label = !Boolean(value.name) ? 'Undefined' : value.name;
      const color = !Boolean(value.color) ? '#2c6AF4' : value.color;

      return (
        <span
          key={key}
          className="badge rounded-pill text-white ms-2 mt-2"
          style={{ backgroundColor: `${color}` }}
        >
          <span className="font-size-14">{label}</span>
          <ButtonDeleteLabel data={value} key={key} />
          {/* {![9, 10, 11].includes(detailClient.status) && (
            <Button
              type="button"
              color="transparent"
              className="btn-sm text-white"
              onClick={() => removeLabel(value.id)}
            >
              <i className="ri-close-fill"></i>
            </Button>
          )} */}
        </span>
      );
    });
    return (
      <>
        <Col xs="12" md="12" lg="12" xl="12">
          {listLabels}
        </Col>
      </>
    );
  } else {
    return (
      <>
        <Col xs="12" md="12" lg="12">
          <p className="text-center text-muted">Label Empty!</p>
        </Col>
      </>
    );
  }
}

export default LabelDetailClient;
