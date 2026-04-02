import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Col, Form, Row } from 'reactstrap';
import { detailChatClientSelector } from '../../../features/Client/DetailChat/DetailChatClientSlice';

function WatchingInput() {
  return (
    <div className="p-3 p-lg-4 border-top mb-0">
      <Form>
        <Row className="g-0">
          <Col>
            <div className="text-center">
              <h5 className="fw-bold">Watching Chat Another Agent</h5>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default WatchingInput;
