import ilEmptyDark from '../../../assets/images/illustration/empty-dark.png';
import ilEmptyLight from '../../../assets/images/illustration/empty-light.png';

function Error(props) {
  const { layoutMode } = props;

  return (
    <>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '100vh' }}
      >
        <div className="text-center">
          <img
            src={layoutMode === 'dark' ? `${ilEmptyDark}` : `${ilEmptyLight}`}
            className="rounded w-50"
            alt="img"
          />
          <h5 className="fw-normal">
            Chatvolution <small>v2.0</small>
          </h5>
          <figure>
            <blockquote className="blockquote">
              <p className="fw-bold">
                Chat you requested is not available, please try again!
              </p>
            </blockquote>
            <figcaption className="blockquote-footer">
              <p>Copyright © 2022 Chatvolution.</p>
            </figcaption>
          </figure>
        </div>
      </div>
    </>
  );
}

export default Error;
