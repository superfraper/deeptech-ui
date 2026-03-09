import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const LogoutButton = ({ className }) => {
  const { t } = useTranslation();
  const { logout } = useAuth0();

  const defaultClassName = 'text-sm px-3 py-1.5 rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors';
  const finalClassName = className || defaultClassName;

  return (
    <button
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
      className={finalClassName}
    >
      {t('common.logout')}
    </button>
  );
};

export default LogoutButton;
