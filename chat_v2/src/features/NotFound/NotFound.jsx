import { Fragment, useEffect } from 'react';
import { Container, Image } from 'react-bootstrap';
import IMG404 from '../../assets/images/404.svg';

const NotFound = (props) => {
  useEffect(() => {
    document.body.setAttribute('data-layout-mode', 'light');
  }, []);

  /* onload first */
  useEffect(() => {
    document.title = `${props.title} | ${process.env.REACT_APP_NAME}`;
  });

  return (
    <Fragment>
      <div className="m-5 p-5">
        <Container>
          <div className="row">
            <div className="col-12">
              <div className="text-center">
                <Image src={IMG404} alt="not-found-image" className="w-50" />
                <h3 className="text-uppercase">Sorry, page not found</h3>
                <div className="mt-3 text-center">
                  <a
                    href={`${process.env.REACT_APP_LIVE_ENDPOINT_V1}`}
                    className="btn btn-tangerin waves-effect waves-light"
                  >
                    Go Home
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </Fragment>
  );
};

export default NotFound;
