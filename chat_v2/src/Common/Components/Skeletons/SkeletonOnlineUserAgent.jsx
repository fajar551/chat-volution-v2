import { Link } from 'react-router-dom';

import { Col, Placeholder, Row } from 'reactstrap';

function SkeletonOnlineUserAgent() {
  return (
    <>
      <Row>
        <Col xs={3}>
          <div>
            <Link to="#" style={{ cursor: 'text' }} className="">
              <Placeholder animation="wave" tag="div">
                <Placeholder
                  xs={12}
                  style={{
                    height: '2.7em',
                    borderRadius: '8px',
                    cursor: 'text',
                  }}
                  color="secondary"
                />
              </Placeholder>
            </Link>
          </div>
        </Col>
        <Col xs={3}>
          <div>
            <Link to="#" style={{ cursor: 'text' }} className="">
              <Placeholder animation="wave" tag="div">
                <Placeholder
                  xs={12}
                  style={{
                    height: '2.7em',
                    borderRadius: '8px',
                    cursor: 'text',
                  }}
                  color="secondary"
                />
              </Placeholder>
            </Link>
          </div>
        </Col>
        <Col xs={3}>
          <div>
            <Link to="#" style={{ cursor: 'text' }} className="">
              <Placeholder animation="wave" tag="div">
                <Placeholder
                  xs={12}
                  style={{
                    height: '2.7em',
                    borderRadius: '8px',
                    cursor: 'text',
                  }}
                  color="secondary"
                />
              </Placeholder>
            </Link>
          </div>
        </Col>
        <Col xs={3}>
          <div>
            <Link to="#" style={{ cursor: 'text' }} className="">
              <Placeholder animation="wave" tag="div">
                <Placeholder
                  xs={12}
                  style={{
                    height: '2.7em',
                    borderRadius: '8px',
                    cursor: 'text',
                  }}
                  color="secondary"
                />
              </Placeholder>
            </Link>
          </div>
        </Col>
      </Row>
    </>
  );
}

export default SkeletonOnlineUserAgent;
