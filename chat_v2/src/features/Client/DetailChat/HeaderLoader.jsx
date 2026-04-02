import React from 'react';
import { Col, Row } from 'reactstrap';

function HeaderLoader() {
  return (
    <div className="p-3 p-lg-4 border-bottom">
      <Row className="align-items-center">
        <Col sm={12} xs={12} className="d-none d-md-block d-lg-block"></Col>
      </Row>
    </div>
  );
}

export default HeaderLoader;
