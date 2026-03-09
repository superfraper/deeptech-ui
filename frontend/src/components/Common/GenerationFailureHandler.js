import React, { useEffect, useState } from 'react';
import { useDataContext } from '../../context/DataContext';
import GenerationFailureModal from '../modals/GenerationFailureModal';

const GenerationFailureHandler = () => {
  const { generationFailure, clearGenerationFailure } = useDataContext();
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureData, setFailureData] = useState(null);

  useEffect(() => {
    const handleGenerationFailed = event => {
      console.log('Generation failed event received:', event.detail);
      setFailureData(event.detail);
      setShowFailureModal(true);
    };

    // Listen for generation failure events
    window.addEventListener('generationFailed', handleGenerationFailed);

    return () => {
      window.removeEventListener('generationFailed', handleGenerationFailed);
    };
  }, []);

  // Also handle failure from context state
  useEffect(() => {
    if (generationFailure) {
      setFailureData(generationFailure);
      setShowFailureModal(true);
    }
  }, [generationFailure]);

  const handleCloseModal = () => {
    setShowFailureModal(false);
    setFailureData(null);
    clearGenerationFailure();
  };

  const handleRetry = () => {
    // Close modal and redirect to questionnaire to retry
    handleCloseModal();
    window.location.href = '/questionnaire';
  };

  return (
    <GenerationFailureModal
      isOpen={showFailureModal}
      errorMessage={failureData?.errorMessage}
      generationId={failureData?.generationId}
      onClose={handleCloseModal}
      onRetry={handleRetry}
    />
  );
};

export default GenerationFailureHandler;
