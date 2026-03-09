import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDataContext } from '../context/DataContext';
import { useApi } from '../services/api';
import Header from './layout/Header';
import { Button } from './ui/button';

const WhitepaperProgress = () => {
  const navigate = useNavigate();
  const { generationId: urlGenerationId } = useParams();
  const api = useApi();
  const hasNavigatedRef = useRef(false);

  const {
    isGenerating,
    generationStatus,
    generationProgress,
    generationId: contextGenerationId,
    generationStartTime: contextStartTime,
    loadWhitepaperData,
    loadWhitepaperForm,
    contextType,
  } = useDataContext();

  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [showBackendWarning, setShowBackendWarning] = useState(false);
  const [isManuallyChecking, setIsManuallyChecking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [manualCountdown, setManualCountdown] = useState(null);
  const [directProgress, setDirectProgress] = useState(null); // Direct progress from database
  const [directFieldProgress, setDirectFieldProgress] = useState({
    // Direct field data from database
    totalFields: null,
    completedFields: null,
    currentField: null,
  });

  // Use URL generation ID if provided, otherwise use context generation ID
  const activeGenerationId = urlGenerationId || contextGenerationId;

  // Initial fetch of current status when component mounts
  useEffect(() => {
    if (activeGenerationId && api) {
      const fetchInitialStatus = async () => {
        try {
          console.log(
            'Fetching initial status for generation:',
            activeGenerationId
          );
          const status = await api.makeRequest(
            `/api/generation/${activeGenerationId}/status`
          );
          console.log('Initial status fetch result:', status);

          if (status.progress !== undefined) {
            setDirectProgress(status.progress);
            setLastUpdateTime(Date.now());
          }

          // Update field progress from initial fetch
          if (
            status.total_fields !== undefined ||
            status.completed_fields !== undefined ||
            status.current_field !== undefined
          ) {
            setDirectFieldProgress({
              totalFields: status.total_fields,
              completedFields: status.completed_fields,
              currentField: status.current_field,
            });
          }
        } catch (error) {
          console.error('Failed to fetch initial status:', error);
        }
      };

      fetchInitialStatus();
    }
  }, [activeGenerationId, api]);

  // Set start time when generation begins - use persisted time if available
  useEffect(() => {
    if (isGenerating && !startTime) {
      if (contextStartTime) {
        // Use persisted start time from context
        setStartTime(contextStartTime);
        // Calculate remaining time from the actual elapsed time
        const elapsedTime = Date.now() - contextStartTime;
        const remainingTime = Math.max(0, 5 * 60 * 1000 - elapsedTime); // 5 minutes instead of 30
        setManualCountdown(remainingTime);
      } else {
        // New generation
        setStartTime(Date.now());
        setManualCountdown(5 * 60 * 1000); // 5 minutes in ms
      }
    } else if (!isGenerating) {
      setStartTime(null);
      setManualCountdown(null);
    }
  }, [isGenerating, startTime, contextStartTime]);

  // Tick manual countdown every second
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

  // Force re-render every second for real-time time remaining updates
  const [, setRenderTrigger] = useState(0);
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      // Trigger re-render to update the estimated time display in real-time
      setRenderTrigger(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  // Update last update time when status changes
  useEffect(() => {
    if (generationStatus) {
      setLastUpdateTime(Date.now());
      setShowBackendWarning(false);
      // Update direct progress when we get status updates
      if (generationStatus.progress !== undefined) {
        setDirectProgress(generationStatus.progress);
      }
      // Update direct field progress
      if (
        generationStatus.total_fields !== undefined ||
        generationStatus.completed_fields !== undefined ||
        generationStatus.current_field !== undefined
      ) {
        setDirectFieldProgress({
          total_fields: generationStatus.total_fields,
          completed_fields: generationStatus.completed_fields,
          current_field: generationStatus.current_field,
        });
      }
    }
  }, [generationStatus]);

  // Navigate to generated whitepaper when status becomes completed
  useEffect(() => {
    const goToWhitepaper = async () => {
      if (!activeGenerationId || hasNavigatedRef.current || !api) return;
      try {
        const status = generationStatus || {};
        const resolveRoute = t =>
          t === 'ART'
            ? '/art/section1'
            : t === 'EMT'
              ? '/emt/section1'
              : '/oth/section1';
        let ctxType = contextType;

        // Load both whitepaper data and form data
        if (status.results) {
          const loadedType = await loadWhitepaperData({
            generation_id: activeGenerationId,
            results: status.results,
          });
          if (loadedType) ctxType = loadedType;
        }

        // Also load the form data to populate the questionnaire
        await loadWhitepaperForm(activeGenerationId);

        const route = resolveRoute(ctxType);
        hasNavigatedRef.current = true;
        navigate(route);
      } catch (e) {
        console.error(
          'Error loading whitepaper after completion (status watcher):',
          e
        );
        hasNavigatedRef.current = true;
        navigate('/questionnaire', { state: { openWhitepapersModal: true } });
      }
    };

    if (generationStatus?.status === 'completed' && !hasNavigatedRef.current) {
      goToWhitepaper();
    }
  }, [
    generationStatus,
    activeGenerationId,
    api,
    loadWhitepaperData,
    loadWhitepaperForm,
    navigate,
  ]);

  // Check if updates have stopped - more aggressive checking
  useEffect(() => {
    if (!isGenerating || !activeGenerationId) return;

    const checkInterval = setInterval(() => {
      const timeSinceLastUpdate = Date.now() - lastUpdateTime;
      // Show warning if no updates for more than 10 seconds
      if (timeSinceLastUpdate > 10000) {
        setShowBackendWarning(true);
        console.log(
          `No updates for ${Math.floor(timeSinceLastUpdate / 1000)} seconds`
        );

        // Auto-trigger status check after 15 seconds
        if (timeSinceLastUpdate > 15000 && !isManuallyChecking) {
          console.log('Auto-triggering status check due to no recent updates');
          handleManualCheck();
        }

        // More aggressive check after 30 seconds
        if (timeSinceLastUpdate > 30000 && !isManuallyChecking) {
          console.log(
            'Triggering aggressive status check - possible freeze detected'
          );
          handleManualCheck();
        }
      }
    }, 3000); // Check every 3 seconds instead of 5

    return () => clearInterval(checkInterval);
  }, [isGenerating, lastUpdateTime, activeGenerationId, isManuallyChecking]);

  // Add periodic database checking independent of main polling - every second for real-time updates
  useEffect(() => {
    if (!isGenerating || !activeGenerationId || !api) return;

    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 5;

    // Check database every 1 second for fresh progress and field data
    const dbCheckInterval = setInterval(async () => {
      try {
        const status = await api.makeRequest(
          `/api/generation/${activeGenerationId}/status`
        );

        // Reset error counter on successful request
        consecutiveErrors = 0;

        console.log(
          'Periodic DB check - progress:',
          status.progress,
          'fields:',
          status.completed_fields,
          '/',
          status.total_fields,
          'status:',
          status.status
        );

        let updated = false;

        // Update progress if changed
        if (
          status.progress !== undefined &&
          status.progress !== directProgress
        ) {
          setDirectProgress(status.progress);
          updated = true;
          console.log('Updated progress from DB check:', status.progress);
        }

        // Update field progress if changed
        const currentFieldData = directFieldProgress || {};
        if (
          status.total_fields !== currentFieldData.total_fields ||
          status.completed_fields !== currentFieldData.completed_fields ||
          status.current_field !== currentFieldData.current_field
        ) {
          setDirectFieldProgress({
            total_fields: status.total_fields,
            completed_fields: status.completed_fields,
            current_field: status.current_field,
          });
          updated = true;
          console.log('Updated field progress from DB check:', {
            total_fields: status.total_fields,
            completed_fields: status.completed_fields,
            current_field: status.current_field,
          });
        }

        if (updated) {
          setLastUpdateTime(Date.now());
          setShowBackendWarning(false);
        }

        // Check for completion or failure
        if (
          (status.status === 'completed' || status.status === 'failed') &&
          !hasNavigatedRef.current
        ) {
          console.log('DB check detected completion/failure:', status.status);
          clearInterval(dbCheckInterval);
          if (status.status === 'completed') {
            try {
              const resolveRoute = t =>
                t === 'ART'
                  ? '/art/section1'
                  : t === 'EMT'
                    ? '/emt/section1'
                    : '/oth/section1';
              let ctxTypeLocal = contextType;

              // Load both whitepaper data and form data
              if (status.results) {
                // Load data into context and navigate to the proper section
                const loadedType = await loadWhitepaperData({
                  generation_id: activeGenerationId,
                  results: status.results,
                });
                if (loadedType) ctxTypeLocal = loadedType;
              }

              // Also load the form data to populate the questionnaire
              await loadWhitepaperForm(activeGenerationId);

              const route = resolveRoute(ctxTypeLocal);
              hasNavigatedRef.current = true;
              navigate(route);
            } catch (e) {
              console.error('Error loading whitepaper after completion:', e);
              // Fallback: open questionnaire with whitepapers modal
              hasNavigatedRef.current = true;
              navigate('/questionnaire', {
                state: { openWhitepapersModal: true },
              });
            }
          } else {
            // On failure, keep current behavior: show failure UI and allow navigation
            setShowBackendWarning(false);
          }
        }
      } catch (error) {
        consecutiveErrors++;
        console.error(
          `Periodic DB check failed (${consecutiveErrors}/${maxConsecutiveErrors}):`,
          error
        );

        // If we have too many consecutive errors, show warning and try manual check
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.error(
            'Too many consecutive DB check failures, showing warning'
          );
          setShowBackendWarning(true);

          // Try a manual check as last resort
          if (!isManuallyChecking) {
            console.log('Attempting manual check due to consecutive failures');
            handleManualCheck();
          }
        }
      }
    }, 1000); // Every 1 second for real-time updates

    return () => clearInterval(dbCheckInterval);
  }, [
    isGenerating,
    activeGenerationId,
    api,
    directProgress,
    directFieldProgress,
    isManuallyChecking,
  ]);
  const handleManualCheck = async () => {
    if (!activeGenerationId || isManuallyChecking || !api) return;

    setIsManuallyChecking(true);
    try {
      const status = await api.makeRequest(
        `/api/generation/${activeGenerationId}/status`
      );
      console.log('Manual status check result:', status);
      setLastUpdateTime(Date.now());
      setShowBackendWarning(false);

      // Update direct progress from the fresh database result
      if (status.progress !== undefined) {
        setDirectProgress(status.progress);
        console.log('Updated direct progress to:', status.progress);
      }

      // Update direct field progress from database
      if (
        status.total_fields !== undefined ||
        status.completed_fields !== undefined ||
        status.current_field !== undefined
      ) {
        setDirectFieldProgress({
          total_fields: status.total_fields,
          completed_fields: status.completed_fields,
          current_field: status.current_field,
        });
        console.log('Updated direct field progress:', {
          total_fields: status.total_fields,
          completed_fields: status.completed_fields,
          current_field: status.current_field,
        });
      }

      // Also check if status has changed to completed/failed
      if (
        (status.status === 'completed' || status.status === 'failed') &&
        !hasNavigatedRef.current
      ) {
        console.log('Generation status changed to:', status.status);
        if (status.status === 'completed') {
          try {
            const resolveRoute = t =>
              t === 'ART'
                ? '/art/section1'
                : t === 'EMT'
                  ? '/emt/section1'
                  : '/oth/section1';
            let ctxTypeLocal = contextType;

            // Load both whitepaper data and form data
            if (status.results) {
              const loadedType = await loadWhitepaperData({
                generation_id: activeGenerationId,
                results: status.results,
              });
              if (loadedType) ctxTypeLocal = loadedType;
            }

            // Also load the form data to populate the questionnaire
            await loadWhitepaperForm(activeGenerationId);

            const route = resolveRoute(ctxTypeLocal);
            hasNavigatedRef.current = true;
            navigate(route);
          } catch (e) {
            console.error('Error loading whitepaper after completion:', e);
            hasNavigatedRef.current = true;
            navigate('/questionnaire', {
              state: { openWhitepapersModal: true },
            });
          }
        }
      }
    } catch (error) {
      console.error('Manual status check failed:', error);
    } finally {
      setIsManuallyChecking(false);
    }
  };

  // Calculate estimated time remaining in real-time based on progress
  const getEstimatedTimeRemaining = () => {
    if (!startTime) return null;

    // Use direct progress if available, otherwise fall back to context progress
    const progressVal = Math.min(
      100,
      Math.max(
        0,
        directProgress ?? generationProgress ?? generationStatus?.progress ?? 0
      )
    );

    const elapsedTime = Date.now() - startTime;

    // If very little progress (less than 3%) or very little time elapsed (less than 30 seconds),
    // use the 5-minute countdown to avoid confusing quick estimates
    if (progressVal < 3 || elapsedTime < 30000) {
      if (manualCountdown && manualCountdown > 0) {
        const hours = Math.floor(manualCountdown / (1000 * 60 * 60));
        const minutes = Math.floor(
          (manualCountdown % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((manualCountdown % (1000 * 60)) / 1000);

        if (hours > 0) {
          return minutes > 0
            ? `~${hours}h ${minutes}m remaining (initial estimate)`
            : `~${hours}h remaining (initial estimate)`;
        }
        return minutes > 0
          ? `~${minutes}m ${seconds}s remaining (initial estimate)`
          : `~${seconds}s remaining (initial estimate)`;
      }
      return 'Starting generation...';
    }

    // Calculate real-time estimate based on actual progress
    const estimatedTotalTime = (elapsedTime / progressVal) * 100;
    let remainingTime = estimatedTotalTime - elapsedTime;

    // Apply different smoothing based on progress stage
    if (progressVal < 50) {
      // Early stages: apply conservative smoothing to prevent wild swings
      const minEstimate = 30 * 1000; // Minimum 30 seconds
      const maxEstimate = 60 * 60 * 1000; // Maximum 1 hour

      // Blend with a more conservative estimate for early stages
      const conservativeEstimate = 5 * 60 * 1000 * (1 - progressVal / 100);
      remainingTime = Math.max(remainingTime, conservativeEstimate * 0.3);
      remainingTime = Math.min(
        Math.max(remainingTime, minEstimate),
        maxEstimate
      );
    } else {
      // Later stages (50%+): use more accurate calculations with less aggressive smoothing
      const minEstimate = 10 * 1000; // Minimum 10 seconds for later stages
      const maxEstimate = 30 * 60 * 1000; // Maximum 30 minutes for later stages

      // For high progress (80%+), allow even shorter estimates
      if (progressVal >= 80) {
        remainingTime = Math.max(remainingTime, 5 * 1000); // Minimum 5 seconds for final stage
      } else {
        remainingTime = Math.max(remainingTime, minEstimate);
      }

      remainingTime = Math.min(remainingTime, maxEstimate);
    }

    if (remainingTime <= 0) return 'Finishing...';

    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor(
      (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    if (hours > 0) {
      return minutes > 0
        ? `~${hours}h ${minutes}m remaining`
        : `~${hours}h remaining`;
    }
    return minutes > 0
      ? `~${minutes}m ${seconds}s remaining`
      : `~${seconds}s remaining`;
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleViewWhitepapers = () => {
    navigate('/questionnaire', { state: { openWhitepapersModal: true } });
  };

  if (!activeGenerationId) {
    return (
      <div className='min-h-screen flex flex-col'>
        <Header />
        <div className='flex-1 flex items-center justify-center bg-gray-50'>
          <div className='text-center max-w-md mx-auto p-6'>
            <div className='text-red-500 mb-4'>
              <svg
                className='mx-auto h-16 w-16 mb-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <h1 className='text-2xl font-bold text-gray-900 mb-4'>
              No Active Generation
            </h1>
            <p className='text-gray-600 mb-6'>
              There is no active whitepaper generation to monitor. Start a new
              generation from the dashboard.
            </p>
            <Button
              onClick={handleBackToDashboard}
              variant='default'
              size='lg'
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const status = generationStatus?.status || 'pending';
  // Use direct progress from database if available, otherwise fall back to context progress
  const progress = Math.min(
    100,
    Math.max(
      0,
      directProgress ?? generationProgress ?? generationStatus?.progress ?? 0
    )
  );
  const totalFields = generationStatus?.total_fields || 0;
  const completedFields = generationStatus?.completed_fields || 0;
  const currentField = generationStatus?.current_field || '';
  const estimatedTime = getEstimatedTimeRemaining();

  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';

  return (
    <div className='min-h-screen flex flex-col'>
      <Header />

      <div className='flex-1 bg-gray-50 py-8'>
        <div className='max-w-4xl mx-auto px-4'>
          {/* Header Section */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-4'>
              Whitepaper Generation Progress
            </h1>
            <p className='text-lg text-gray-600'>
              Generation ID: {activeGenerationId.substring(0, 8)}...
            </p>
          </div>

          {/* Main Progress Card */}
          <div className='bg-white rounded-lg shadow-lg p-8 mb-6'>
            {isCompleted ? (
              /* Completion State */
              <div className='text-center'>
                <div className='text-green-500 mb-6'>
                  <svg
                    className='mx-auto h-16 w-16 mb-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <h2 className='text-2xl font-bold text-green-600 mb-4'>
                  Generation Complete!
                </h2>
                <p className='text-gray-600 mb-6'>
                  Your whitepaper content has been successfully generated. All
                  fields are now available for review and editing.
                </p>
                <div className='flex justify-center space-x-4'>
                  <Button
                    onClick={handleViewWhitepapers}
                    variant='default'
                    size='lg'
                  >
                    View Whitepapers
                  </Button>
                  <button
                    onClick={handleBackToDashboard}
                    className='bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors'
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            ) : isFailed ? (
              /* Failure State */
              <div className='text-center'>
                <div className='text-red-500 mb-6'>
                  <svg
                    className='mx-auto h-16 w-16 mb-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                    />
                  </svg>
                </div>
                <h2 className='text-2xl font-bold text-red-600 mb-4'>
                  Generation Failed
                </h2>
                <p className='text-gray-600 mb-4'>
                  Unfortunately, your whitepaper generation encountered an error
                  and could not be completed.
                </p>
                {generationStatus?.error_message && (
                  <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
                    <p className='text-sm text-red-800'>
                      <span className='font-medium'>Error:</span>{' '}
                      {generationStatus.error_message}
                    </p>
                  </div>
                )}
                <div className='flex justify-center space-x-4'>
                  <Button
                    onClick={handleBackToDashboard}
                    variant='default'
                    size='lg'
                  >
                    Start New Generation
                  </Button>
                  <button
                    onClick={handleViewWhitepapers}
                    className='bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors'
                  >
                    View Previous Whitepapers
                  </button>
                </div>
              </div>
            ) : (
              /* In Progress State */
              <div>
                <div className='flex items-center space-x-4 mb-6'>
                  <div className='flex items-center space-x-2'>
                    <svg
                      className='animate-spin h-8 w-8 text-blue-500'
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
                    <h2 className='text-2xl font-bold text-gray-900'>
                      {status === 'pending'
                        ? 'Starting Generation...'
                        : 'Generating Whitepaper Content...'}
                    </h2>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className='mb-6'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-gray-700'>
                      Progress
                    </span>
                    <span className='text-sm font-bold text-gray-900'>
                      {progress}%
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-4 overflow-hidden'>
                    <div
                      className='bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden'
                      style={{ width: `${progress}%` }}
                    >
                      {/* Animated shine effect */}
                      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse'></div>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                  <div className='bg-blue-50 rounded-lg p-4'>
                    <h3 className='font-semibold text-blue-900 mb-2'>
                      Field Progress
                    </h3>
                    <p className='text-blue-800'>
                      {(directFieldProgress?.total_fields || totalFields) > 0
                        ? `${directFieldProgress?.completed_fields || completedFields} of ${directFieldProgress?.total_fields || totalFields} fields completed`
                        : 'Initializing...'}
                    </p>
                    {(directFieldProgress?.current_field || currentField) && (
                      <p className='text-sm text-blue-700 mt-1'>
                        Currently processing:{' '}
                        {directFieldProgress?.current_field || currentField}
                      </p>
                    )}
                  </div>

                  {estimatedTime && (
                    <div className='bg-green-50 rounded-lg p-4'>
                      <h3 className='font-semibold text-green-900 mb-2'>
                        Time Remaining
                      </h3>
                      <p className='text-green-800'>{estimatedTime}</p>
                      {progress > 3 &&
                        !estimatedTime.includes('initial estimate') && (
                          <p className='text-sm text-green-700 mt-1'>
                            Based on current progress rate
                          </p>
                        )}
                      {estimatedTime.includes('initial estimate') && (
                        <p className='text-sm text-green-700 mt-1'>
                          Will update as progress continues
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                  <div className='flex items-start space-x-3'>
                    <div className='text-blue-500 mt-1'>
                      <svg
                        className='h-5 w-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className='font-medium text-gray-900'>
                        Important Information
                      </h4>
                      <ul className='mt-2 text-sm text-gray-600 space-y-1'>
                        <li>
                          • Generation is running in the background. You can
                          close this page - your progress will be saved.
                        </li>
                        <li>
                          • The process typically takes 5-30 minutes depending
                          on the complexity of your whitepaper.
                        </li>
                        <li>
                          • You&apos;ll be able to review and edit all generated
                          content once the process is complete.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Backend Warning */}
                {showBackendWarning && (
                  <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
                    <div className='flex items-center space-x-3'>
                      <div className='text-yellow-500'>
                        <svg
                          className='h-5 w-5'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                          />
                        </svg>
                      </div>
                      <div className='flex-1'>
                        <p className='text-yellow-800 font-medium'>
                          Progress updates have stopped
                        </p>
                        <p className='text-yellow-700 text-sm mt-1'>
                          The system is automatically checking the database
                          every second. If progress appears frozen, try
                          refreshing the page or use the check button below.
                        </p>
                        <p className='text-yellow-600 text-xs mt-1'>
                          Last update:{' '}
                          {Math.floor((Date.now() - lastUpdateTime) / 1000)}{' '}
                          seconds ago
                        </p>
                      </div>
                      <div className='flex space-x-2'>
                        <button
                          onClick={handleManualCheck}
                          disabled={isManuallyChecking}
                          className='bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 transition-colors'
                        >
                          {isManuallyChecking ? 'Checking...' : 'Check Now'}
                        </button>
                        <button
                          onClick={() => window.location.reload()}
                          className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors'
                        >
                          Refresh Page
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className='flex justify-center space-x-4'>
                  <Button
                    onClick={handleBackToDashboard}
                    variant='secondary'
                    size='lg'
                  >
                    Back to Dashboard
                  </Button>
                  <Button
                    onClick={handleViewWhitepapers}
                    variant='default'
                    size='lg'
                  >
                    View All Whitepapers
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhitepaperProgress;
