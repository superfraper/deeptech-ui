import React, { useState, useEffect } from 'react';
import { useDataContext } from '../../context/DataContext';

const GenerationCompletionNotification = () => {
  const { generationStatus, isGenerating } = useDataContext();
  const [showNotification, setShowNotification] = useState(false);
  const [previousStatus, setPreviousStatus] = useState(null);

  useEffect(() => {
    // Show notification when generation transitions from in_progress to completed
    if (
      previousStatus &&
      (previousStatus === 'in_progress' || previousStatus === 'pending') &&
      generationStatus?.status === 'completed' &&
      !isGenerating
    ) {
      setShowNotification(true);

      // Auto-hide after 10 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 10000);
    }

    setPreviousStatus(generationStatus?.status);
  }, [generationStatus, isGenerating, previousStatus]);

  if (!showNotification) {
    return null;
  }

  return (
    <div className='fixed top-20 right-4 z-50 max-w-sm'>
      <div className='bg-green-600 text-white rounded-lg shadow-lg p-4 border-l-4 border-green-800'>
        <div className='flex items-start'>
          <div className='flex-shrink-0'>
            <svg
              className='h-6 w-6 text-green-200'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <div className='ml-3 flex-1'>
            <h3 className='text-sm font-semibold'>Generation Complete!</h3>
            <p className='mt-1 text-sm'>
              Your whitepaper content has been successfully generated. All
              fields are now available for review and editing.
            </p>
          </div>
          <div className='ml-4 flex-shrink-0'>
            <button
              className='rounded-md text-green-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500'
              onClick={() => setShowNotification(false)}
            >
              <span className='sr-only'>Close</span>
              <svg className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationCompletionNotification;
