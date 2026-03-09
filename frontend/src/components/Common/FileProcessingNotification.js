import React from 'react';
import { useFileProcessing } from '../../context/FileProcessingContext';

const FileProcessingNotification = () => {
  const { isProcessingFiles, getProcessingFiles, abortAllFileProcessing } =
    useFileProcessing();

  if (!isProcessingFiles) {
    return null;
  }

  const processingFiles = getProcessingFiles();

  return (
    <div className='fixed top-20 right-4 z-50 bg-blue-600 text-white rounded-lg shadow-lg p-4 max-w-sm'>
      <div className='flex items-start space-x-3'>
        <div className='flex-shrink-0'>
          <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
        </div>
        <div className='flex-1 min-w-0'>
          <h4 className='text-sm font-semibold'>Processing Files</h4>
          <p className='text-xs text-blue-100 mt-1'>
            {processingFiles.length} file
            {processingFiles.length !== 1 ? 's' : ''} being processed:
          </p>
          <ul className='text-xs text-blue-100 mt-1 max-h-20 overflow-y-auto'>
            {processingFiles.map((fileName, index) => (
              <li key={index} className='truncate'>
                • {fileName}
              </li>
            ))}
          </ul>
          <p className='text-xs text-blue-200 mt-2'>
            Whitepaper generation is disabled until processing completes.
          </p>
        </div>
        <button
          onClick={abortAllFileProcessing}
          className='flex-shrink-0 text-blue-200 hover:text-white focus:outline-none'
          title='Abort all file processing'
        >
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FileProcessingNotification;
