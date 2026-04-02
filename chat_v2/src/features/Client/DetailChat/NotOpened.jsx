import React from 'react';
import ilAgentDark from '../../../assets/images/illustration/agent-vdark.png';
import ilAgentLight from '../../../assets/images/illustration/agent-vlight.png';

const BgImage = React.memo(
  ({ layoutMode }) => {
    const backgroundImage = layoutMode === 'dark' ? ilAgentDark : ilAgentLight;
    return <img src={backgroundImage} className="rounded w-50" alt="img" />;
  },
  (prevProps, nextProps) => {
    return prevProps.layoutMode === nextProps.layoutMode;
  }
);

function NotOpened(props) {
  const { layoutMode } = props;

  return (
    <>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '100vh' }}
      >
        <div className="text-center">
          <BgImage layoutMode={layoutMode} />
          <h5 className="fw-normal">
            Chatvolution <small>v2.0</small>
          </h5>
          <figure>
            <blockquote className="blockquote">
              <p className="fw-bold">
                Reply all chat form the client and be the Best Agent!
              </p>
            </blockquote>
            <figcaption className="blockquote-footer">
              <p>Copyright © {new Date().getFullYear()} Chatvolution.</p>
            </figcaption>
          </figure>
        </div>
      </div>
    </>
  );
}

export default NotOpened;
