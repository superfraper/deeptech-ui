import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const OnboardingGuard = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();

  // Public routes that don't require onboarding check
  const publicRoutes = ['/', '/standard-disclaimer', '/cookie-policy', '/privacy-policy'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // If not authenticated or loading, let Auth0 handle it
  if (isLoading) {
    return <div className='min-h-screen flex items-center justify-center'>Loading...</div>;
  }

  // If not authenticated, allow normal flow
  if (!isAuthenticated) {
    return children;
  }

  // If on public route, allow access
  if (isPublicRoute) {
    return children;
  }

  // If on onboarding route, allow access
  if (location.pathname === '/onboarding') {
    return children;
  }

  // Check if onboarding is completed
  const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';

  // If onboarding not completed, redirect to onboarding
  if (!onboardingCompleted) {
    return <Navigate to='/onboarding' replace />;
  }

  // Onboarding completed, allow access
  return children;
};

export default OnboardingGuard;

