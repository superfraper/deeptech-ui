import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  console.log('Profile - isAuthenticated:', isAuthenticated);

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        Loading ...
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col'>
      {/* Header */}
      <header className='w-[1170px] max-w-full my-0 mx-auto flex gap-[15px] justify-between items-center p-4 header container'>
        <div className='text-xl font-bold'>
          <Link to='/'>
            <img src={`${process.env.PUBLIC_URL}/audomate-logo.png`} alt='Audomate' className='h-8' />
          </Link>
        </div>
      </header>

      {/* Profile Content */}
      <div className='flex-grow container mx-auto p-8'>
        {isAuthenticated ? (
          <div className='max-w-md mx-auto bg-white rounded-lg shadow-md p-6'>
            <div className='text-center mb-6'>
              <div className='relative w-32 h-32 mx-auto'>
                <img
                  src={user.picture}
                  alt={user.name || 'User'}
                  className='rounded-full w-32 h-32 border-4 object-cover'
                  style={{ borderColor: 'rgba(82, 173, 128, 0.3)' }}
                  onError={e => {
                    e.target.style.display = 'none';
                    const initialsDiv = e.target.nextElementSibling;
                    if (initialsDiv) {
                      initialsDiv.style.display = 'flex';
                    }
                  }}
                />
                <div
                  className='w-32 h-32 rounded-full border-4 text-white font-bold text-4xl flex items-center justify-center'
                  style={{ borderColor: 'rgba(82, 173, 128, 0.3)', backgroundColor: '#52ad80', display: 'none' }}
                >
                  {user.name
                    ? user.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()
                    : 'U'}
                </div>
              </div>
              <h2 className='text-2xl font-bold mt-4'>{user.name || 'User'}</h2>
              <p className='text-gray-600'>
                {user.email || 'No email provided'}
              </p>
            </div>

            <div className='border-t pt-4'>
              <h3 className='text-lg font-semibold mb-2'>User Information</h3>
              <p className='text-sm text-gray-600 mb-1'>
                <span className='font-medium'>Email verified:</span>{' '}
                {user.email_verified ? 'Yes' : 'No'}
              </p>
              {user.nickname && (
                <p className='text-sm text-gray-600 mb-1'>
                  <span className='font-medium'>Nickname:</span> {user.nickname}
                </p>
              )}
              <p className='text-sm text-gray-600 mb-1'>
                <span className='font-medium'>Last updated:</span>{' '}
                {new Date(user.updated_at).toLocaleDateString()}
              </p>
            </div>

            <div className='mt-6'>
              <Link
                to='/dashboard'
                className='block text-center text-white px-4 py-2 rounded-full transition-colors'
                style={{ backgroundColor: '#52ad80' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#429d6f'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#52ad80'}
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className='text-center'>
            <p className='text-xl'>Please log in to view your profile.</p>
            <Link
              to='/'
              className='inline-block mt-4 text-white px-4 py-2 rounded-full transition-colors'
              style={{ backgroundColor: '#52ad80' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#429d6f'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#52ad80'}
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default Profile;
