import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component that handles navigation when whitepaper generation completes.
 * This component should be placed at a high level in the component tree
 * so it's always mounted and can listen for generation completion events.
 */
const GenerationNavigationHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGenerationCompleted = event => {
      const { route } = event.detail;
      console.log('Generation completed event received, navigating to:', route);
      navigate(route);
    };

    // Listen for generation completion events
    window.addEventListener('generationCompleted', handleGenerationCompleted);

    return () => {
      window.removeEventListener(
        'generationCompleted',
        handleGenerationCompleted
      );
    };
  }, [navigate]);

  // This component doesn't render anything - it's just for handling events
  return null;
};

export default GenerationNavigationHandler;
