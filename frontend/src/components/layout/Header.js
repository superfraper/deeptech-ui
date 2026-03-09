import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAutosave } from '../../context/AutosaveContext';
import LanguageSwitcher from '../LanguageSwitcher';

const Header = () => {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth0();
  const { lastAutosaveTime } = useAutosave();

  return (
    <>
      <header 
        className='fixed top-0 left-0 right-0 flex justify-end items-center bg-white border-b border-border z-10'
        style={{ height: 'var(--header-height)' }}
      >
        <div className='flex-1 flex justify-end items-center p-4'>
          <div className='flex items-center gap-3'>
            {user && isAuthenticated ? (
              <>
                <div className='flex items-center gap-2'>
                  <div className='relative w-8 h-8'>
                    <img
                      src={user.picture}
                      alt={user.name || 'User'}
                      className='w-8 h-8 rounded-full object-cover border border-border'
                      onError={e => {
                        e.target.style.display = 'none';
                        const initialsDiv = e.target.nextElementSibling;
                        if (initialsDiv) {
                          initialsDiv.style.display = 'flex';
                        }
                      }}
                    />
                    <div
                      className='w-8 h-8 rounded-full border border-border bg-primary text-primary-foreground font-medium text-xs flex items-center justify-center'
                      style={{ display: 'none' }}
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
                  <div className='hidden md:block'>
                    <p className='text-sm font-medium text-foreground'>
                      {user.name || t('common.user')}
                    </p>
                    {lastAutosaveTime && (
                      <p className='text-xs text-muted-foreground'>
                        {lastAutosaveTime}
                      </p>
                    )}
                  </div>
                </div>
                <LanguageSwitcher />
                <button
                  onClick={() =>
                    logout({
                      logoutParams: { returnTo: window.location.origin },
                    })
                  }
                  className='text-sm px-3 py-1.5 rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors'
                >
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <div className='flex items-center'>
                <div className='animate-pulse flex space-x-4'>
                  <div className='rounded-full bg-muted h-8 w-8'></div>
                  <div className='flex-1 space-y-2 py-1'>
                    <div className='h-4 bg-muted rounded w-24'></div>
                    <div className='h-3 bg-muted rounded w-16'></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
export default Header;
