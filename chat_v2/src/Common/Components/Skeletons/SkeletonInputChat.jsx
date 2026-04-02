import React from 'react';
import { Col, Placeholder, Row } from 'reactstrap';

function SkeletonInputChat() {
  return (
    <Row as="div" className="g-0">
      <Col xs="8">
        <Placeholder animation="wave" tag="div">
          <Placeholder
            xs={11}
            style={{
              height: '2em',
              borderRadius: '10px',
              cursor: 'text',
            }}
            color="secondary"
          />
        </Placeholder>
      </Col>
      <Col xs="4">
        <Placeholder animation="wave" tag="div">
          <Placeholder
            xs={12}
            style={{
              height: '2em',
              borderRadius: '10px',
              cursor: 'text',
            }}
            color="secondary"
          />
        </Placeholder>
      </Col>
    </Row>
  );
}

export default SkeletonInputChat;
