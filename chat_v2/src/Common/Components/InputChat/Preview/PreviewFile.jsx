import React from 'react';
import { useSelector } from 'react-redux';
import { layoutSetupSelector } from '../../../../app/Layouts/LayoutSlice';
import ilDark from '../../../../assets/images/illustration/file-vdark.png';
import ilLight from '../../../../assets/images/illustration/file-vlight.png';

const ItemPreview = React.memo(
  function PreviewFile(params) {
    const { className, src, alt, style } = params;
    if (!Boolean(style)) {
      return <img src={src} className={className} alt={alt} style={style} />;
    } else {
      return <img src={src} className={className} alt={alt} style={style} />;
    }
  },
  (prevProps, nextProps) => {
    return prevProps.src === nextProps.src;
  }
);

function PreviewFile(props) {
  const { resultUpload } = props;

  const { layoutMode } = useSelector(layoutSetupSelector);

  const Items = (params) => {
    const { resultUpload } = params;
    if (resultUpload.fileType === 'image') {
      return (
        <>
          <ItemPreview
            src={resultUpload.fileUrl}
            alt="preview-file"
            className="img-fluid mx-auto rounded"
            style={{ height: 'auto', maxHeight: '300px', objectFit: 'cover' }}
          />
        </>
      );
    }

    return (
      <>
        <div>
          <ItemPreview
            className="img-fluid mx-auto"
            src={layoutMode === 'light' ? ilLight : ilDark}
            alt="preview-file"
            style={{ width: '250px', height: '200px' }}
          />
          <h5>Preview not available</h5>
          <span>
            File type:{' '}
            {`${
              resultUpload.fileType === 'other'
                ? 'document'
                : resultUpload.fileType
            }`}
          </span>
        </div>
      </>
    );
  };

  return (
    <div className="text-center py-3">
      <Items resultUpload={resultUpload} />
    </div>
  );
}

export default PreviewFile;
