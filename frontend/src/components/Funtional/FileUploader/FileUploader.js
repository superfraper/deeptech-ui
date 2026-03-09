import React, { useState, forwardRef, useImperativeHandle } from 'react';
import Iconupload from '../../../images/backup.png';
import { useFileUploader } from './useFileUploader';
import { useFileProcessing } from '../../../context/FileProcessingContext';

const FileUploader = forwardRef((props, ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const [deletingFiles, setDeletingFiles] = useState(new Set());
  const { selectedFiles, setSelectedFiles } = props;
  const { abortFileProcessing } = useFileProcessing();

  const {
    files, // [{ name, status, error }]
    successMessage,
    errorMessage,
    isLoading,
    handleDrop,
    handleDragOver,
    handleFileSelect,
    removeFile: removeFileFromUploader,
    abortFile,
  } = useFileUploader();

  // Derived set of files currently uploading or processing
  const uploadingFiles = new Set(
    files
      .filter(f => f.status === 'Uploading' || f.status === 'Processing')
      .map(f => f.name)
  );

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    handleExternalDrop: event => {
      handleDropWrapper(event);
    },
  }));

  const handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();

    // Check if leaving the actual drop zone rather than entering a child element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  };

  const handleDropWrapper = e => {
    handleDrop(e);
    setIsDragging(false);
  };

  const triggerFileInput = () => {
    document.getElementById('file-upload').click();
  };

  const handleDeleteFile = async fileName => {
    try {
      setDeletingFiles(prev => new Set(prev).add(fileName));
      await removeFileFromUploader(fileName);
      setSelectedFiles(prev => {
        const updated = { ...prev };
        delete updated[fileName];
        return updated;
      });
    } catch (err) {
      console.error('Error deleting file:', err);
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileName);
        return newSet;
      });
    }
  };

  const handleAbortFile = async fileName => {
    const success = abortFileProcessing(fileName);
    if (success) {
      console.log(`Aborted processing for file: ${fileName}`);
      // Also call the backend abort endpoint
      await abortFile(fileName);
    }
  };

  const handleCheckboxChange = fileName => {
    setSelectedFiles(prev => {
      const updated = { ...prev, [fileName]: !prev[fileName] };
      console.log('Checkbox changed:', updated);
      return updated;
    });
  };

  return (
    <div className='border-dashed border-2 border-gray-300 rounded-lg p-4 upload-main'>
      <h2
        className='font-sans font-bold text-lg leading-6 tracking-tight mb-1'
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        Upload Document
      </h2>
      <p
        className='font-sans font-normal text-sm leading-5 text-gray-500 mb-4 mt-0'
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        Upload documents such as technical whitepapers or any material
        containing token-related information. Multiple files are allowed and the
        maximum size per file is 10 MB.
      </p>

      {/* Success Message */}
      {successMessage && (
        <div
          className='mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded'
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div
          className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          {errorMessage}
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`dashed-border-upload border-2 border-dashed border-[#004494] text-center flex flex-col justify-center items-center gap-y-1.5 rounded-[12px] p-[15px] cursor-pointer transition-colors duration-200 ${isDragging ? 'bg-gray-200' : 'bg-gray-50 hover:bg-gray-100'}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDropWrapper}
        onClick={triggerFileInput}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerFileInput();
          }
        }}
        role='button'
        tabIndex={0}
        aria-label='Click or drag files here to upload'
      >
        <img className='text-center' src={Iconupload} alt='UploadIcon' />
        <input
          type='file'
          id='file-upload'
          className='hidden'
          onChange={handleFileSelect}
          accept='.pdf'
          multiple
        />
        {isDragging ? (
          <p
            className='text-base font-medium text-blue-600'
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Drop your files here
          </p>
        ) : (
          <>
            <p
              className='block w-full text-center bg-transparent text-sm font-normal font-sans m-0 p-0'
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Drag your file or browse
            </p>
            <p
              className='text-sm mt-2 text-gray-500'
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Max 10 MB file is allowed
            </p>
          </>
        )}
      </div>

      {/* Upload Progress Indicators */}
      {uploadingFiles.size > 0 && (
        <div
          className='mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg'
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
              <div>
                <p
                  className='text-blue-800 font-medium'
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  Uploading and processing file...
                </p>
                <p
                  className='text-blue-600 text-sm'
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  The file is being uploaded and processed, please wait. Large
                  files can take up to 10 min to be processed.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                uploadingFiles.forEach(fileName => handleAbortFile(fileName));
              }}
              className='px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm'
              style={{ fontFamily: 'Manrope, sans-serif' }}
              title='Abort all file processing'
            >
              Abort All
            </button>
          </div>
        </div>
      )}

      {/* Loading existing files */}
      {isLoading && files.length === 0 && (
        <div
          className='mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg'
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          <div className='flex items-center space-x-3'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600'></div>
            <p
              className='text-gray-600'
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Loading existing files...
            </p>
          </div>
        </div>
      )}

      {/* Files Table */}
      {files.length > 0 && (
        <div className='mt-6' style={{ fontFamily: 'Manrope, sans-serif' }}>
          <h3
            className='text-lg font-semibold mb-3'
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Uploaded Files
          </h3>
          <table className='w-full border-collapse border border-gray-300'>
            <thead>
              <tr className='bg-gray-100'>
                <th
                  className='border border-gray-300 px-4 py-2 text-left w-1/12'
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  Select
                </th>
                <th
                  className='border border-gray-300 px-6 py-2 text-left w-2/3'
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  File Name
                </th>
                <th
                  className='border border-gray-300 px-2 py-2 text-left w-1/6'
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  Status
                </th>
                <th
                  className='border border-gray-300 px-2 py-2 text-left w-1/12'
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={file.name} className='hover:bg-gray-50'>
                  <td className='border border-gray-300 px-4 py-2 text-center'>
                    <input
                      type='checkbox'
                      className='align-middle'
                      checked={!!selectedFiles[file.name]}
                      onChange={() => handleCheckboxChange(file.name)}
                      disabled={
                        file.status === 'Uploading' ||
                        file.status === 'Processing' ||
                        file.status === 'Queued'
                      }
                    />
                  </td>
                  <td
                    className='border border-gray-300 px-6 py-2'
                    style={{ fontFamily: 'Manrope, sans-serif' }}
                  >
                    <span>{file.name}</span>
                  </td>
                  <td
                    className='border border-gray-300 px-2 py-2'
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '13px',
                    }}
                  >
                    {file.status === 'Uploading' && (
                      <span className='text-blue-600 font-medium'>
                        Uploading...
                      </span>
                    )}
                    {file.status === 'Processing' && (
                      <span className='text-yellow-600 font-medium'>
                        Processing...
                      </span>
                    )}
                    {file.status === 'Queued' && (
                      <span className='text-gray-600 font-medium'>Queued</span>
                    )}
                    {file.status === 'Ready' && (
                      <span className='text-green-600 font-medium'>Ready</span>
                    )}
                    {file.status === 'Error' && (
                      <span className='text-red-600 font-medium'>
                        Error: {file.error}
                      </span>
                    )}
                  </td>
                  <td
                    className='border border-gray-300 px-2 py-2'
                    style={{ width: '1%', minWidth: '120px' }}
                  >
                    <div className='flex space-x-1'>
                      {(file.status === 'Uploading' ||
                        file.status === 'Processing') && (
                        <button
                          onClick={() => handleAbortFile(file.name)}
                          title='Abort'
                          className='px-2 py-0.5 rounded text-[11px] bg-orange-500 text-white hover:bg-orange-600 transition-colors'
                          style={{
                            fontFamily: 'Manrope, sans-serif',
                            minWidth: '40px',
                          }}
                        >
                          Abort
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteFile(file.name)}
                        disabled={
                          deletingFiles.has(file.name) ||
                          file.status === 'Uploading' ||
                          file.status === 'Processing' ||
                          file.status === 'Queued'
                        }
                        title='Delete'
                        className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                          deletingFiles.has(file.name) ||
                          file.status === 'Uploading' ||
                          file.status === 'Processing' ||
                          file.status === 'Queued'
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        style={{
                          fontFamily: 'Manrope, sans-serif',
                          minWidth: '45px',
                        }}
                      >
                        {deletingFiles.has(file.name) ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No files message */}
      {!isLoading && files.length === 0 && uploadingFiles.size === 0 && (
        <div
          className='mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center'
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          <p
            className='text-gray-600'
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            No files uploaded yet.
          </p>
        </div>
      )}
    </div>
  );
});

FileUploader.displayName = 'FileUploader';

export default FileUploader;
