import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useApi } from '../services/api';
import { Link } from 'react-router-dom';

const ProfileFiles = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const api = useApi();
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingFiles, setDeletingFiles] = useState(new Set());
  const [uploadingFiles] = useState(new Set()); // Added for logic consistency

  console.log('ProfileFiles - isAuthenticated:', isAuthenticated);

  const fetchFiles = async (retryDelay = 0) => {
    if (isAuthenticated && user) {
      console.log('ProfileFiles - Starting to fetch files for user:', user.sub);
      setFilesLoading(true);
      setError(null);

      // Add delay if specified (for post-deletion refresh)
      if (retryDelay > 0) {
        console.log(`Waiting ${retryDelay}ms before fetching files...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

      try {
        const result = await api.getUsersFiles(user);
        console.log('ProfileFiles - API response:', result);
        // Handle the new response format
        setFiles(result.files || []);
      } catch (err) {
        console.error('ProfileFiles - Error fetching files:', err);

        // Provide more specific error messages
        if (err.message.includes('Authentication failed')) {
          setError(
            'Authentication failed. Please refresh the page and try again.'
          );
        } else if (err.message.includes('401')) {
          setError(
            'You are not authorized to view this content. Please log in again.'
          );
        } else {
          setError(`Failed to load files: ${err.message}`);
        }
        setFiles([]);
      } finally {
        setFilesLoading(false);
      }
    } else {
      console.log(
        'ProfileFiles - User not authenticated or user object missing'
      );
      console.log('isAuthenticated:', isAuthenticated, 'user:', user);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [isAuthenticated, user, api]);

  const handleDeleteFile = async fileName => {
    try {
      setDeletingFiles(prev => new Set(prev).add(fileName));
      await api.deleteFile(fileName);
      setFiles(prevFiles => prevFiles.filter(f => f !== fileName));
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileName);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        Loading ...
      </div>
    );
  }

  return (
    <div className='w-full'>
      <h1 className='text-2xl font-bold mb-4'>Profile Files</h1>
      <p className='mb-6'>Here you can manage your profile files.</p>
      {isAuthenticated ? (
        <div>
          {filesLoading ? (
            <p>Loading files...</p>
          ) : error ? (
            <p className='text-red-500'>{error}</p>
          ) : files.length > 0 ? (
            <table className='w-full border-collapse border border-gray-300'>
              <thead>
                <tr className='bg-gray-100'>
                  <th
                    className='border border-gray-300 px-4 py-2 text-left text-gray-900 text-base font-normal'
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '16px',
                    }}
                  >
                    File Name
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-left'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {files.map((fileName, index) => (
                  <tr key={fileName} className='hover:bg-gray-50'>
                    <td
                      className='border border-gray-300 px-4 py-2 text-gray-900 text-base font-normal'
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '16px',
                      }}
                    >
                      {fileName}
                    </td>
                    <td className='border border-gray-300 px-4 py-2'>
                      <button
                        onClick={() => handleDeleteFile(fileName)}
                        disabled={
                          deletingFiles.has(fileName) ||
                          uploadingFiles.has(fileName)
                        }
                        title='Delete'
                        className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                          deletingFiles.has(fileName) ||
                          uploadingFiles.has(fileName)
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        style={{
                          fontFamily: 'Manrope, sans-serif',
                          minWidth: '45px',
                        }}
                      >
                        {deletingFiles.has(fileName) ? '...' : 'X'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No files found.</p>
          )}
        </div>
      ) : (
        <p className='text-red-500'>
          You need to be logged in to view your files.
        </p>
      )}
    </div>
  );
};

export default ProfileFiles;
