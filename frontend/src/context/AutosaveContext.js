import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDataContext } from './DataContext';

// Create the context
const AutosaveContext = createContext();

// Custom hook to use the autosave context
export const useAutosave = () => {
  const context = useContext(AutosaveContext);

  // Return a safe default object if context is not available
  if (!context) {
    console.warn('useAutosave called outside of AutosaveProvider');
    return {
      lastAutosaveTime: null,
      manualSave: () => false,
      startGeneration: () => {},
      endGeneration: () => {},
      isGenerating: false,
    };
  }

  return context;
};

// Provider component
export const AutosaveProvider = ({ children }) => {
  const { user } = useAuth0();
  const { saveUserContextData, currentWhitepaperId } = useDataContext();

  // State for tracking last autosave time and generation status
  const [lastAutosaveTime, setLastAutosaveTime] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const autosaveIntervalRef = useRef(null);

  // References to values needed for autosave
  const userSubRef = useRef(null);
  const saveUserContextDataRef = useRef(null);

  // Update refs when values change
  useEffect(() => {
    if (user?.sub) {
      userSubRef.current = user.sub;
    }
    if (saveUserContextData) {
      saveUserContextDataRef.current = saveUserContextData;
    }
  }, [user?.sub, saveUserContextData, currentWhitepaperId]);

  // Setup autosave functionality once on component mount
  useEffect(() => {
    console.log('Setting up persistent autosave mechanism');

    // Clear any existing interval
    if (autosaveIntervalRef.current) {
      clearInterval(autosaveIntervalRef.current);
    }

    // Set up new autosave interval (60 seconds = 60000 ms)
    autosaveIntervalRef.current = setInterval(() => {
      // Don't autosave if currently generating
      if (isGenerating) {
        console.log('Skipping autosave - generation in progress');
        return;
      }

      // Don't autosave if no whitepaper is active
      if (!currentWhitepaperId) {
        console.log('Skipping autosave - no active whitepaper');
        return;
      }

      // Use current ref values inside the interval
      if (userSubRef.current && saveUserContextDataRef.current) {
        console.log('Autosaving context data for user:', userSubRef.current);
        try {
          saveUserContextDataRef.current(userSubRef.current);
          setLastAutosaveTime(new Date().toLocaleTimeString());
        } catch (error) {
          console.warn('Autosave failed:', error.message);
          // Don't throw error, just log it to prevent breaking the app
        }
      }
    }, 60000);

    // Clean up interval on component unmount
    return () => {
      console.log('Clearing persistent autosave interval');
      if (autosaveIntervalRef.current) {
        clearInterval(autosaveIntervalRef.current);
      }
    };
  }, [isGenerating, currentWhitepaperId]); // Include currentWhitepaperId in dependencies

  // Function to start generation (pause autosave)
  const startGeneration = () => {
    console.log('Starting generation - pausing autosave');
    setIsGenerating(true);
  };

  // Function to end generation (resume autosave)
  const endGeneration = () => {
    console.log('Ending generation - resuming autosave');
    setIsGenerating(false);
  };

  // Manual save function
  const manualSave = () => {
    if (userSubRef.current && saveUserContextDataRef.current) {
      try {
        saveUserContextDataRef.current(userSubRef.current);
        setLastAutosaveTime(new Date().toLocaleTimeString());
        return true;
      } catch (error) {
        console.warn('Manual save failed:', error.message);
        return false;
      }
    }
    return false;
  };

  // Context value
  const value = {
    lastAutosaveTime,
    manualSave,
    startGeneration,
    endGeneration,
    isGenerating,
  };

  return (
    <AutosaveContext.Provider value={value}>
      {children}
    </AutosaveContext.Provider>
  );
};
