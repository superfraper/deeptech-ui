import React, { useState, useEffect } from 'react';
import { useDataContext } from '../../context/DataContext';
import { useApi } from '../../services/api';

const GenerationStatus = () => {
  const {
    isGenerating,
    generationStatus,
    generationProgress,
    isFieldDataLoading,
    generationId,
  } = useDataContext();

  const api = useApi();
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [showBackendWarning, setShowBackendWarning] = useState(false);
  const [isManuallyChecking, setIsManuallyChecking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  // Manual countdown state (starts at 30 minutes when generation begins)
  const [manualCountdown, setManualCountdown] = useState(null); // ms remaining in manual countdown

  // Set start time when generation begins
  useEffect(() => {
    if (isGenerating && !startTime) {
      setStartTime(Date.now());
      setManualCountdown(30 * 60 * 1000); // 30 minutes in ms
    } else if (!isGenerating) {
      setStartTime(null);
      setManualCountdown(null);
    }
  }, [isGenerating, startTime]);

  // Tick manual countdown every second while it's larger than the actual remaining (or actual unknown)
  useEffect(() => {
    if (!isGenerating || !manualCountdown) return;

    const interval = setInterval(() => {
      setManualCountdown(prev => {
        if (prev === null) return prev;
        const next = prev - 1000;
        return next > 0 ? next : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating, manualCountdown]);

  // Update last update time when status changes
  useEffect(() => {
    if (generationStatus) {
      setLastUpdateTime(Date.now());
      setShowBackendWarning(false);
    }
  }, [generationStatus]);

  // Check if updates have stopped (backend might be unresponsive)
  useEffect(() => {
    if (!isGenerating) return;

    const checkInterval = setInterval(() => {
      const timeSinceLastUpdate = Date.now() - lastUpdateTime;
      // Show warning if no updates for more than 30 seconds
      if (timeSinceLastUpdate > 30000) {
        setShowBackendWarning(true);
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [isGenerating, lastUpdateTime]);

  // Add/remove body padding when progress bar is shown/hidden
  useEffect(() => {
    // Since we're no longer showing the top progress bar, always keep padding at 0
    document.body.style.paddingTop = '0px';

    // Cleanup on unmount
    return () => {
      document.body.style.paddingTop = '0px';
    };
  }, []);

  // Manual status check function
  const handleManualCheck = async () => {
    if (!generationId || isManuallyChecking || !api) return;

    setIsManuallyChecking(true);
    try {
      const status = await api.makeRequest(
        `/api/generation/${generationId}/status`
      );
      console.log('Manual status check result:', status);
      setLastUpdateTime(Date.now());
      setShowBackendWarning(false);
    } catch (error) {
      console.error('Manual status check failed:', error);
    } finally {
      setIsManuallyChecking(false);
    }
  };

  // Show generation status only when there's an active generation
  const status = generationStatus?.status || 'pending';
  const shouldShowStatus = false; // Hide the top bar completely during generation

  if (!shouldShowStatus) {
    return null;
  }

  const progress = Math.min(
    100,
    Math.max(0, generationProgress || generationStatus?.progress || 0)
  );
  const totalFields = generationStatus?.total_fields || 0;
  const completedFields = generationStatus?.completed_fields || 0;
  const currentField = generationStatus?.current_field || '';

  // Calculate estimated time remaining (actual based on progress)
  const getEstimatedTimeRemaining = () => {
    if (!startTime) return null;

    const progressVal = progress; // 0-100
    let actualRemaining = null;
    if (progressVal > 0) {
      const elapsedTime = Date.now() - startTime; // ms
      const estimatedTotalTime = (elapsedTime / progressVal) * 100; // proportional estimate
      const remainingTime = estimatedTotalTime - elapsedTime;
      if (remainingTime > 0) actualRemaining = remainingTime;
    }

    // Decide which to display:
    // 1. If no actualRemaining yet (progress 0) -> show manualCountdown
    // 2. If manualCountdown exists and is greater than actualRemaining -> show manualCountdown (continue counting down)
    // 3. If actualRemaining is smaller -> show actualRemaining
    let displayMs;
    if (actualRemaining == null) {
      displayMs = manualCountdown; // may be null early if not set
    } else if (manualCountdown != null && manualCountdown > actualRemaining) {
      displayMs = manualCountdown;
    } else {
      displayMs = actualRemaining;
    }

    if (displayMs == null) return null;
    if (displayMs <= 0) return 'Finishing...';

    const hours = Math.floor(displayMs / (1000 * 60 * 60));
    const minutes = Math.floor((displayMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((displayMs % (1000 * 60)) / 1000);

    if (hours > 0) {
      // Show hours and minutes; include seconds only when < 1h to reduce flicker
      return minutes > 0
        ? `~${hours}h ${minutes}m remaining`
        : `~${hours}h remaining`;
    }

    return minutes > 0
      ? `~${minutes}m ${seconds}s remaining`
      : `~${seconds}s remaining`;
  };

  const estimatedTime = getEstimatedTimeRemaining();

  return (
    <div className='fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg border-b-2 border-blue-800'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <svg
                className='animate-spin h-5 w-5 text-blue-200'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
              <span className='font-semibold text-lg'>
                {status === 'pending'
                  ? 'Starting Generation...'
                  : 'Generating Whitepaper Content...'}
              </span>
            </div>

            {generationStatus && (
              <div className='text-sm text-blue-100'>
                <div className='flex items-center space-x-4'>
                  {totalFields > 0 && (
                    <span>
                      {completedFields} of {totalFields} fields completed
                    </span>
                  )}
                  {estimatedTime && progress > 5 && (
                    <span className='text-blue-200'>{estimatedTime}</span>
                  )}
                </div>
                {currentField && (
                  <div className='mt-1 text-blue-200 max-w-md truncate'>
                    Currently: {currentField}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className='flex items-center space-x-4'>
            {showBackendWarning && (
              <button
                onClick={handleManualCheck}
                disabled={isManuallyChecking}
                className='bg-blue-800 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50 transition-colors duration-200'
              >
                {isManuallyChecking ? 'Checking...' : 'Check Status'}
              </button>
            )}

            {/* Enhanced Progress Bar */}
            <div className='flex items-center space-x-3'>
              <div className='w-40 bg-blue-800/60 rounded-full h-3 shadow-inner overflow-hidden'>
                <div
                  className='bg-gradient-to-r from-white via-blue-100 to-white h-3 rounded-full transition-all duration-1000 ease-out shadow-sm relative overflow-hidden'
                  style={{ width: `${progress}%` }}
                >
                  {/* Animated shine effect */}
                  <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse'></div>
                </div>
              </div>
              <span className='text-sm font-bold min-w-[3rem] text-right text-white'>
                {progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Status Messages */}
        <div className='mt-2 text-sm text-blue-100'>
          <div className='flex items-center justify-between'>
            <p>
              🚀 Generation is running in the background. You can navigate away
              - your progress will be saved.
            </p>
            {status === 'in_progress' && (
              <p className='text-blue-200 font-medium'>⚡ Processing...</p>
            )}
          </div>

          {showBackendWarning && (
            <p className='mt-1 text-yellow-200 bg-yellow-600 bg-opacity-20 px-2 py-1 rounded'>
              ⏳ No updates received recently. The backend may be processing
              complex data. Generation continues automatically.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerationStatus;
