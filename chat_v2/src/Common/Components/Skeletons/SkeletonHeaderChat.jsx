import React from 'react';
import { Col, Placeholder, Row } from 'reactstrap';

function SkeletonHeaderChat() {
  return (
    <Row className="align-items-center">
      <Col xs={1}>
        <Placeholder animation="wave" tag="div">
          <Placeholder
            xs={1}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'text',
            }}
            color="secondary"
          />
        </Placeholder>
      </Col>
      <Col xs={9}>
        <Placeholder animation="wave" tag="div">
          <Placeholder
            xs={8}
            style={{
              height: '1em',
              borderRadius: '8px',
              cursor: 'text',
            }}
            color="secondary"
          />
          <Placeholder
            xs={8}
            style={{
              height: '1em',
              borderRadius: '8px',
              cursor: 'text',
            }}
            color="secondary"
          />
        </Placeholder>
      </Col>
      <Col xs={2}>
        <Placeholder animation="wave" tag="div">
          <Placeholder
            xs={12}
            style={{
              height: '1em',
              borderRadius: '8px',
              cursor: 'text',
            }}
            color="secondary"
          />
          <Placeholder
            xs={12}
            style={{
              height: '1em',
              borderRadius: '8px',
              cursor: 'text',
            }}
            color="secondary"
          />
        </Placeholder>
      </Col>
    </Row>
  );
}

export default SkeletonHeaderChat;
