import React from 'react';
import { Button } from '../ui/button';

const GenerationInfoModal = ({ isOpen, onGenerate, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6'>
        <div className='mb-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Start Whitepaper Generation
          </h2>

          <div className='text-gray-700 space-y-3'>
            <p>
              You&apos;ll be taken to a dedicated progress page to monitor your
              whitepaper generation.
            </p>

            <p>
              The generation process runs in the background, so you can navigate
              away and return later to check progress.
            </p>

            <p>
              When it&apos;s finished (about an hour), you can access your
              completed whitepaper through{' '}
              <span className='font-semibold text-blue-600'>
                View Whitepapers
              </span>
              .
            </p>
          </div>
        </div>

        <div className='flex justify-end space-x-3'>
          <Button
            onClick={onCancel}
            variant='secondary'
          >
            Cancel
          </Button>
          <Button
            onClick={onGenerate}
            variant='default'
          >
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GenerationInfoModal;
