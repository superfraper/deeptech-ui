import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import heroImage from '../images/close-up-hands-holding-tablet.png';
import Login from './buttons/login';
import Logout from './buttons/logout';
import frame from '.././images/frame.png';
import { Button } from './ui/button';

const MainPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth0();

  console.log('MainPage - isAuthenticated:', isAuthenticated);

  return (
    <div className='min-h-screen flex flex-col'>
      {/* Header */}
      <header className='w-[1170px] max-w-full my-0 mx-auto flex gap-[15px] justify-between items-center p-4 header container'>
        <div className='text-xl font-bold'>
          <img src={`${process.env.PUBLIC_URL}/audomate-logo.png`} alt='Audomate' className='h-8' />
        </div>
        <div className='flex items-center gap-4'>
          {isAuthenticated && user && (
            <div className='flex items-center gap-2'>
              <div className='relative w-8 h-8'>
                <img
                  src={user.picture}
                  alt={user.name || 'User'}
                  className='w-8 h-8 rounded-full object-cover border border-gray-200'
                  onError={e => {
                    e.target.style.display = 'none';
                    const initialsDiv = e.target.nextElementSibling;
                    if (initialsDiv) {
                      initialsDiv.style.display = 'flex';
                    }
                  }}
                />
                <div
                  className='w-8 h-8 rounded-full border border-gray-200 text-white font-bold text-xs flex items-center justify-center'
                  style={{ backgroundColor: '#52ad80', display: 'none' }}
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
              <Link
                to='/profile'
                className='font-medium'
                style={{ color: '#52ad80' }}
                onMouseEnter={(e) => e.target.style.color = '#429d6f'}
                onMouseLeave={(e) => e.target.style.color = '#52ad80'}
              >
                {t('common.myProfile')}
              </Link>
            </div>
          )}
          {isAuthenticated ? <Logout /> : <Login />}
        </div>
      </header>

      {/* Hero Section */}
      <section
        className='main-banner main-banner-new flex-grow flex items-center justify-center bg-cover bg-center h-[500px] md:h-[654px] flex items-center'
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className='container'>
          <div className='text-center w-[780px] max-w-full my-0 mx-auto p-4'>
            <h1>
              {t('mainPage.welcome')} <span>{t('mainPage.audomate')}</span>
            </h1>

            <p className='text-lg text-white font-inter font-normal text-[20px] leading-[160%] text-white my-[20px] mx-0'>
              {t('mainPage.description')}
            </p>
            <img className='banner-frame' src={frame} alt='frame' />
            <Link to='/dashboard'>
              <Button variant='default' size='lg' className='mt-0 rounded-full'>
                {t('common.getStarted')}
              </Button>
            </Link>
            <br />
            <br />
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainPage;
