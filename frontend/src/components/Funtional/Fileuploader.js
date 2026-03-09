import React, { forwardRef, useImperativeHandle } from 'react';
import FileUploader from './FileUploader/FileUploader';

const Fileuploader = forwardRef((props, ref) => {
  const fileUploaderRef = React.useRef(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    handleDropFromDashboard: event => {
      if (fileUploaderRef.current) {
        fileUploaderRef.current.handleExternalDrop(event);
      }
    },
  }));

  return <FileUploader ref={fileUploaderRef} />;
});

Fileuploader.displayName = 'Fileuploader';

export default Fileuploader;
