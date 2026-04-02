import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Col, Form, Row } from 'reactstrap';
import { detailChatClientSelector } from '../../../features/Client/DetailChat/DetailChatClientSlice';

function SolveInput() {
  const { actionHistory } = useSelector(detailChatClientSelector);
  const [resolveInfo, setResolveInfo] = useState('');

  useEffect(() => {
    if (actionHistory.length > 0) {
      setResolveInfo(actionHistory[0].description);
    } else {
      setResolveInfo('Chat Solved');
    }
  }, [actionHistory]);

  return (
    <div className="p-3 p-lg-4 border-top mb-0">
      <Form>
        <Row className="g-0">
          <Col>
            <div className="text-center">
              <h5 className="fw-bold">{resolveInfo}</h5>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default SolveInput;
