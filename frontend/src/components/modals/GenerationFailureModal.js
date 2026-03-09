import React from 'react';

const GenerationFailureModal = ({
  isOpen,
  errorMessage,
  generationId,
  onClose,
  onRetry,
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6'>
        <div className='mb-6'>
          <div className='flex items-center mb-4'>
            <div className='flex-shrink-0'>
              <svg
                className='h-8 w-8 text-red-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <h2 className='ml-3 text-xl font-semibold text-gray-900'>
              Generation Failed
            </h2>
          </div>

          <div className='text-gray-700 space-y-3'>
            <p className='font-medium'>
              Unfortunately, your whitepaper generation encountered an error and
              could not be completed.
            </p>

            {errorMessage && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                <p className='text-sm text-red-800'>
                  <span className='font-medium'>Error Details:</span>
                </p>
                <p className='text-sm text-red-700 mt-1'>{errorMessage}</p>
              </div>
            )}

            {generationId && (
              <p className='text-sm text-gray-600'>
                <span className='font-medium'>Generation ID:</span>{' '}
                {generationId.substring(0, 8)}...
              </p>
            )}

            <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
              <p className='text-sm text-blue-800'>
                <span className='font-medium'>What to do next:</span>
              </p>
              <ul className='text-sm text-blue-700 mt-1 list-disc list-inside space-y-1'>
                <li>
                  Try generating again with the same or modified parameters
                </li>
                <li>Check your input data for any issues</li>
                <li>Contact support if the problem persists</li>
              </ul>
            </div>
          </div>
        </div>

        <div className='flex space-x-3'>
          <button
            onClick={onClose}
            className='flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors'
          >
            Close
          </button>
          {onRetry && (
            <button
              onClick={onRetry}
              className='flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors'
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerationFailureModal;
