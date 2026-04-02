import React from 'react';
import ilLight from '../../../assets/images/illustration/file-vlight.png';
const FilePreview = () => {
  return (
    <div className="chat-conversation p-3 p-lg-3">
      <div className="text-center">
        <img
          className="rounded img-fluid mx-auto mb-2"
          src={ilLight}
          alt="preview-file"
          style={{ width: '350px', height: '350px' }}
        />
        <h5>Preview not available</h5>
        <span>File type: Doc</span>
      </div>
    </div>
  );
};

export default FilePreview;
