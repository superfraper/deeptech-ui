import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../../context/DataContext';
import { useApi } from '../../services/api';

const GeneratedWhitepapersModal = ({ isOpen, onClose, onLoadWhitepaper }) => {
  const [whitepapers, setWhitepapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApi();
  const navigate = useNavigate();
  const { loadWhitepaperForm } = useDataContext();

  // Fetch user's generated whitepapers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUserWhitepapers();
    }
  }, [isOpen]);

  const fetchUserWhitepapers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // This endpoint would need to be implemented in the backend
      const response = await api.makeRequest('/api/user/whitepapers');
      setWhitepapers(response.whitepapers || []);
    } catch (err) {
      console.error('Error fetching whitepapers:', err);
      setError('Failed to load whitepapers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadWhitepaper = async whitepaper => {
    console.log('Modal: handleLoadWhitepaper called with:', whitepaper);
    try {
      setIsLoading(true);

      // Load the whitepaper form data and lock the questionnaire
      const formData = await loadWhitepaperForm(whitepaper.generation_id);

      // Also call the original onLoadWhitepaper to load results data
      onLoadWhitepaper(whitepaper);
      onClose();
    } catch (err) {
      console.error('Error loading whitepaper:', err);
      setError('Failed to load whitepaper. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewProgress = generationId => {
    onClose(); // Close the modal first
    navigate(`/whitepaper-progress/${generationId}`);
  };

  const handleDeleteWhitepaper = async generationId => {
    // Find the whitepaper to get its status for appropriate confirmation message
    const whitepaper = whitepapers.find(w => w.generation_id === generationId);
    const isActive =
      whitepaper &&
      (whitepaper.status === 'pending' || whitepaper.status === 'in_progress');

    const confirmMessage = isActive
      ? 'Are you sure you want to cancel this generation? This action cannot be undone.'
      : 'Are you sure you want to delete this whitepaper? This action cannot be undone.';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsLoading(true);
      await api.makeRequest(`/api/whitepaper/${generationId}`, {
        method: 'DELETE',
      });

      // Refresh the whitepapers list
      await fetchUserWhitepapers();
    } catch (err) {
      console.error('Error deleting whitepaper:', err);
      const errorMessage = isActive
        ? 'Failed to cancel generation. Please try again.'
        : 'Failed to delete whitepaper. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJson = async generationId => {
    try {
      setIsLoading(true);

      // Get the generation status with results
      const status = await api.makeRequest(
        `/api/generation/${generationId}/status`
      );

      if (!status.results) {
        setError('No data available for export');
        return;
      }

      // Create a formatted JSON with all field data
      const exportData = {
        generation_id: status.generation_id,
        created_at: status.started_at,
        updated_at: status.updated_at,
        status: status.status,
        progress: status.progress,
        total_fields: status.total_fields,
        completed_fields: status.completed_fields,
        fields: status.results,
      };

      // Create and download the JSON file
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `whitepaper_${generationId.substring(0, 8)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting JSON:', err);
      setError('Failed to export JSON. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] mx-4'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Your Generated Whitepapers
            </h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 transition-colors'
            >
              <svg
                className='w-6 h-6'
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

        <div className='p-6 overflow-y-auto max-h-[60vh]'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
              <span className='ml-3 text-gray-600'>Loading whitepapers...</span>
            </div>
          ) : error ? (
            <div className='text-center py-8'>
              <div className='text-red-500 mb-4'>{error}</div>
              <button
                onClick={fetchUserWhitepapers}
                className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
              >
                Retry
              </button>
            </div>
          ) : whitepapers.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <svg
                className='mx-auto h-12 w-12 text-gray-400 mb-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
              <p>No whitepapers found.</p>
              <p className='text-sm mt-2'>
                Generate your first whitepaper to see it here.
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {whitepapers.map((whitepaper, index) => (
                <div
                  key={whitepaper.generation_id || index}
                  className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
                >
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-3 mb-2'>
                        <h3 className='text-lg font-medium text-gray-900'>
                          {whitepaper.whitepaper_type || 'Unknown Type'}{' '}
                          Whitepaper
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(whitepaper.status)}`}
                        >
                          {whitepaper.status === 'completed'
                            ? 'Completed'
                            : whitepaper.status === 'failed'
                              ? 'Failed'
                              : whitepaper.status === 'in_progress'
                                ? 'In Progress'
                                : whitepaper.status === 'pending'
                                  ? 'Pending'
                                  : whitepaper.status || 'Unknown'}
                        </span>
                      </div>

                      <div className='text-sm text-gray-600 space-y-1'>
                        <p>
                          <span className='font-medium'>Created:</span>{' '}
                          {formatDate(whitepaper.created_at)}
                        </p>
                        <p>
                          <span className='font-medium'>Updated:</span>{' '}
                          {formatDate(whitepaper.updated_at)}
                        </p>
                        <p>
                          <span className='font-medium'>ID:</span>{' '}
                          {whitepaper.generation_id.substring(0, 8)}...
                        </p>

                        {/* Show progress for in_progress status */}
                        {whitepaper.status === 'in_progress' && (
                          <div className='space-y-1'>
                            {whitepaper.progress !== undefined && (
                              <p>
                                <span className='font-medium'>Progress:</span>{' '}
                                {whitepaper.progress}%
                              </p>
                            )}
                            {whitepaper.completed_fields !== undefined &&
                              whitepaper.total_fields !== undefined && (
                                <p>
                                  <span className='font-medium'>Fields:</span>{' '}
                                  {whitepaper.completed_fields} of{' '}
                                  {whitepaper.total_fields} completed
                                </p>
                              )}
                          </div>
                        )}

                        {/* Show error message for failed status */}
                        {whitepaper.status === 'failed' &&
                          whitepaper.error_message && (
                            <div className='mt-2 p-2 bg-red-50 border border-red-200 rounded'>
                              <p className='text-sm text-red-800'>
                                <span className='font-medium'>Error:</span>{' '}
                                {whitepaper.error_message}
                              </p>
                            </div>
                          )}

                        {/* Show status info for pending/in_progress */}
                        {(whitepaper.status === 'pending' ||
                          whitepaper.status === 'in_progress') && (
                          <div className='mt-2 p-2 bg-blue-50 border border-blue-200 rounded'>
                            <p className='text-sm text-blue-800'>
                              {whitepaper.status === 'pending'
                                ? 'This generation is queued and will start soon. Click "View Progress" to monitor its status.'
                                : 'This generation is currently in progress. Click "View Progress" to see real-time updates and detailed information.'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='flex flex-col space-y-2'>
                      {/* View Progress button for pending/in_progress whitepapers */}
                      {(whitepaper.status === 'pending' ||
                        whitepaper.status === 'in_progress') && (
                        <button
                          onClick={() =>
                            handleViewProgress(whitepaper.generation_id)
                          }
                          disabled={isLoading}
                          className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 text-sm'
                        >
                          View Progress
                        </button>
                      )}

                      {/* Load button only for completed whitepapers */}
                      {whitepaper.status === 'completed' && (
                        <>
                          <button
                            onClick={() => {
                              console.log('Button clicked!', whitepaper);
                              handleLoadWhitepaper(whitepaper);
                            }}
                            disabled={isLoading}
                            className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 text-sm'
                          >
                            Load Whitepaper
                          </button>
                        </>
                      )}

                      {/* Cancel button for pending/in_progress generations */}
                      {(whitepaper.status === 'pending' ||
                        whitepaper.status === 'in_progress') && (
                        <button
                          onClick={() =>
                            handleDeleteWhitepaper(whitepaper.generation_id)
                          }
                          disabled={isLoading}
                          className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 text-sm'
                        >
                          Cancel Generation
                        </button>
                      )}

                      {/* Delete button only for completed/failed generations */}
                      {(whitepaper.status === 'completed' ||
                        whitepaper.status === 'failed') && (
                        <button
                          onClick={() =>
                            handleDeleteWhitepaper(whitepaper.generation_id)
                          }
                          disabled={isLoading}
                          className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 text-sm'
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='p-6 border-t border-gray-200'>
          <div className='flex justify-end'>
            <button
              onClick={onClose}
              className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedWhitepapersModal;
