import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useApi } from '../services/api';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth0();
  const api = useApi();
  // Add a ref to track initial loading
  const initialLoadDone = useRef(false);

  // Add a debounce timer ref
  const autoSaveTimerRef = useRef(null);

  // Add polling interval ref to track active polling
  const pollingIntervalRef = useRef(null);

  // Log Auth0 user sub when it changes
  useEffect(() => {
    if (user && user.sub) {
      console.log('Auth0 User sub:', user.sub);
    } else if (isAuthenticated) {
      console.log('User is authenticated but sub is missing:', user);
    } else {
      console.log('User is not authenticated yet');
    }
  }, [user, isAuthenticated]);

  // Add context type state before scraped data
  const [contextType, setContextType] = useState(null); // Default to null
  const [contextLoaded, setContextLoaded] = useState(false);

  // Store scraped data from document
  const [scrapedData, setScrapedData] = useState({});

  // Store fields that have been manually accepted
  const [acceptedFields, setAcceptedFields] = useState([]);

  // Store fields that have been improved through follow-up questions
  const [improvedFields, setImprovedFields] = useState([]);
  const [fieldData, setFieldDataState] = useState({});
  const [isFieldDataLoading, setIsFieldDataLoading] = useState(false);
  const [fieldDataError, setFieldDataError] = useState(null);

  // States for user context operations
  const [isUserContextLoading, setIsUserContextLoading] = useState(false);
  const [saveContextSuccess, setSaveContextSuccess] = useState(false);
  const [resetContextSuccess, setResetContextSuccess] = useState(false);
  const [loadContextSuccess, setLoadContextSuccess] = useState(false);

  // Track current whitepaper ID for specific save/reset operations
  const [currentWhitepaperId, setCurrentWhitepaperId] = useState(null);

  // States for loaded whitepaper questionnaire
  const [loadedWhitepaperForm, setLoadedWhitepaperForm] = useState(null);
  const [isQuestionnaireLocked, setIsQuestionnaireLocked] = useState(false);

  // States for generation tracking - with localStorage persistence
  const [generationId, setGenerationId] = useState(() => {
    return localStorage.getItem('activeGenerationId') || null;
  });
  const [generationStatus, setGenerationStatus] = useState(() => {
    const saved = localStorage.getItem('generationStatus');
    return saved ? JSON.parse(saved) : null;
  });
  const [isGenerating, setIsGenerating] = useState(() => {
    const saved = localStorage.getItem('isGenerating');
    return saved === 'true';
  });
  const [generationStartTime, setGenerationStartTime] = useState(() => {
    const saved = localStorage.getItem('generationStartTime');
    return saved ? parseInt(saved) : null;
  });

  // States for generation failure handling
  const [generationFailure, setGenerationFailure] = useState(null);

  // Function to update context type based on token classification
  const updateContextType = tokenClassification => {
    let newType;
    switch (tokenClassification) {
      case 'ART':
        newType = 'ART';
        break;
      case 'EMT':
        newType = 'EMT';
        break;
      case 'OTH':
      case 'OTH_UTILITY':
      case 'OTH_NON_UTILITY':
        newType = 'OTH';
        break;
      case '':
      default:
        newType = null;
        break;
    }

    if (newType !== contextType) {
      setContextType(newType);
      console.log('Context type updated to:', newType);

      // Schedule an auto-save when context type changes
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        if (user?.sub) {
          console.log('Auto-saving context type change:', newType);
          saveUserContextData(user.sub);
        }
      }, 1000); // 1 second debounce for context type changes
    }
  };

  // Function to update scraped data
  const updateScrapedData = newData => {
    setScrapedData(newData);
  };

  // Function to update accepted fields
  const updateAcceptedFields = newAcceptedFields => {
    setAcceptedFields(newAcceptedFields);
  };

  // Function to update improved fields
  const updateImprovedFields = newImprovedFields => {
    setImprovedFields(newImprovedFields);
  };

  const updateFieldData = data => {
    // Ensure we're properly merging the new data with existing field data
    const mergedData = {
      ...fieldData,
      ...data,
    };

    setFieldDataState(mergedData);

    // Schedule an auto-save when field data changes
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      if (user?.sub) {
        console.log('Auto-saving field data changes:', mergedData);
        saveUserContextData(user.sub);
      }
    }, 2000); // 2 second debounce
  };

  // Function to check for active generation and resume monitoring
  const checkActiveGeneration = async () => {
    if (!isAuthenticated || !user?.sub || !api) {
      console.log('Cannot check active generation:', {
        isAuthenticated,
        userSub: user?.sub,
        api: !!api,
      });
      return;
    }

    console.log('Checking for active generation...');
    try {
      const response = await api.makeRequest('/api/generation/user/active');
      const activeGeneration = response.active_generation;

      console.log('Active generation check response:', { activeGeneration });

      if (
        activeGeneration &&
        activeGeneration.status !== 'completed' &&
        activeGeneration.status !== 'failed'
      ) {
        console.log('Found active generation:', activeGeneration);
        setGenerationId(activeGeneration.generation_id);
        setGenerationStatus(activeGeneration);
        setIsGenerating(true);

        // Set start time if not already set (for resumed sessions)
        if (!generationStartTime && activeGeneration.created_at) {
          const startTime = new Date(activeGeneration.created_at).getTime();
          console.log(
            'Setting generation start time from created_at:',
            startTime
          );
          setGenerationStartTime(startTime);
        }

        startGenerationPolling(activeGeneration.generation_id);
      } else {
        // No active generation found, clear any stale localStorage data
        console.log('No active generation found, clearing local state');
        setGenerationId(null);
        setGenerationStatus(null);
        setIsGenerating(false);
        setGenerationStartTime(null);
      }
    } catch (error) {
      console.error('Error checking active generation:', error);
    }
  };

  // Function to start generation polling
  const startGenerationPolling = genId => {
    // Clear any existing polling first
    if (pollingIntervalRef.current) {
      console.log('Clearing existing polling interval');
      clearInterval(pollingIntervalRef.current);
    }

    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 10; // Allow 10 consecutive errors before giving up

    console.log('Starting generation polling for:', genId);
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const status = await api.makeRequest(`/api/generation/${genId}/status`);
        console.log('Generation status update:', status);

        // Reset error count on successful request
        consecutiveErrors = 0;
        setGenerationStatus(status);

        if (status.status === 'completed') {
          setIsGenerating(false);
          setFieldData(status.results || {});

          // Automatically load the completed generation results
          if (status.results) {
            console.log(
              'Auto-loading completed generation results:',
              status.results
            );
            await loadWhitepaperData({
              generation_id: genId,
              results: status.results,
            });
          }

          setIsFieldDataLoading(false);
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          // Clear generation state from localStorage
          setGenerationId(null);
          setGenerationStatus(null);
          setGenerationStartTime(null);

          console.log('Generation completed successfully');
          // No navigation handling needed - users can check completion on the progress page
        } else if (status.status === 'failed') {
          setIsGenerating(false);
          setIsFieldDataLoading(false);
          setFieldDataError(status.error_message || 'Generation failed');
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;

          // Set failure state for modal
          setGenerationFailure({
            errorMessage:
              status.error_message ||
              'Unknown error occurred during generation',
            generationId: genId,
          });

          // Clear generation state from localStorage
          setGenerationId(null);
          setGenerationStatus(null);
          setGenerationStartTime(null);

          // Dispatch failure event
          window.dispatchEvent(
            new CustomEvent('generationFailed', {
              detail: {
                errorMessage:
                  status.error_message ||
                  'Unknown error occurred during generation',
                generationId: genId,
              },
            })
          );

          console.error('Generation failed:', status.error_message);
        }
      } catch (error) {
        consecutiveErrors++;
        console.error(
          `Error polling generation status (attempt ${consecutiveErrors}):`,
          error
        );

        // If too many consecutive errors, assume generation failed
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.error(
            'Too many consecutive polling errors, assuming generation failed'
          );
          setIsGenerating(false);
          setIsFieldDataLoading(false);
          setFieldDataError(
            'Unable to connect to server. Generation may have failed or completed.'
          );
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          // Clear generation state from localStorage
          setGenerationId(null);
          setGenerationStatus(null);
          setGenerationStartTime(null);
        }
        // Otherwise continue polling - backend might just be temporarily unresponsive
      }
    }, 1000); // Poll every 1 second for more responsive progress updates

    // Clean up interval after 30 minutes (failsafe)
    setTimeout(
      () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      },
      30 * 60 * 1000
    );
  };

  // Function to start generation
  const startGeneration = async formData => {
    try {
      setIsFieldDataLoading(true);
      setFieldDataError(null);
      setIsGenerating(true);

      const currentTime = Date.now();
      setGenerationStartTime(currentTime);

      const response = await api.generateFillouts(formData);

      if (response.generation_id) {
        setGenerationId(response.generation_id);
        setCurrentWhitepaperId(response.generation_id); // Set as current whitepaper
        setGenerationStatus({
          generation_id: response.generation_id,
          status: 'pending',
          progress: 0,
          total_fields: response.total_fields,
        });

        startGenerationPolling(response.generation_id);
        return response;
      } else {
        // Handle legacy response format
        setIsGenerating(false);
        setFieldData(response);
        setIsFieldDataLoading(false);
        return response;
      }
    } catch (error) {
      setIsGenerating(false);
      setIsFieldDataLoading(false);
      setFieldDataError(error.message);
      // Clear generation state from localStorage on error
      setGenerationId(null);
      setGenerationStatus(null);
      throw error;
    }
  };

  // Function to manually clear generation state (useful for debugging or forced reset)
  const clearGenerationState = () => {
    console.log('Manually clearing generation state');
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setGenerationId(null);
    setGenerationStatus(null);
    setGenerationStartTime(null);
    setIsGenerating(false);
  };

  // Check for active generation on component mount
  useEffect(() => {
    if (contextLoaded && api) {
      checkActiveGeneration();
    }
  }, [contextLoaded, isAuthenticated, user, api]);

  // Additional effect to resume polling if we have localStorage state but no active polling
  useEffect(() => {
    if (generationId && isGenerating && api && !generationStatus) {
      console.log(
        'Resuming generation polling for stored generation ID:',
        generationId
      );
      checkActiveGeneration();
    }
  }, [generationId, isGenerating, api, generationStatus]);

  const setFieldData = useCallback(
    dataOrFunction => {
      let newData;

      if (typeof dataOrFunction === 'function') {
        newData = dataOrFunction(fieldData);
      } else {
        newData = dataOrFunction;
      }

      updateFieldData(newData);
    },
    [fieldData]
  );

  // Function to save user context data
  const saveUserContextData = async (explicitUserSub = null) => {
    // Use explicitly passed user.sub if provided, otherwise fall back to Auth0 context
    const userSubToUse = explicitUserSub || user?.sub;

    if (!userSubToUse) {
      console.log('Cannot save context: No valid user ID found');
      return;
    }

    console.log('Saving context for user with sub:', userSubToUse);

    try {
      setIsUserContextLoading(true);
      setSaveContextSuccess(false);

      const contextData = {
        contextType,
        scrapedData,
        acceptedFields,
        improvedFields,
        fieldData,
      };

      // If we have a current whitepaper ID, save to that specific whitepaper
      if (currentWhitepaperId) {
        console.log('Saving to specific whitepaper:', currentWhitepaperId);
        await api.saveWhitepaperProgress(
          currentWhitepaperId,
          userSubToUse,
          contextData
        );
      } else {
        // Fall back to general user context save
        console.log('No active whitepaper, saving to general user context');
        await api.saveUserContext(userSubToUse, contextData);
      }

      setSaveContextSuccess(true);
      console.log('Context saved successfully for user:', userSubToUse);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveContextSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to save context:', error);
    } finally {
      setIsUserContextLoading(false);
    }
  };

  // Add a ref to track if reset has been manually triggered
  const resetManuallyTriggered = useRef(false);

  // Modified reset function with additional safety check
  const resetUserContextData = async (explicitUserSub = null) => {
    // Safety check - only proceed if explicitly called by user action
    if (!resetManuallyTriggered.current) {
      resetManuallyTriggered.current = true;
    }

    const userSubToUse = explicitUserSub || user?.sub;

    if (!userSubToUse) {
      console.log('Cannot reset context: No valid user ID found');
      return;
    }

    console.log('Resetting context for user with sub:', userSubToUse);

    try {
      setIsUserContextLoading(true);
      setResetContextSuccess(false);

      // If we have a current whitepaper ID, reset that specific whitepaper
      if (currentWhitepaperId) {
        console.log('Resetting specific whitepaper:', currentWhitepaperId);
        await api.resetWhitepaperProgress(currentWhitepaperId);
      } else {
        // Fall back to general user context reset
        console.log('No active whitepaper, resetting general user context');
        const emptyContextData = {
          contextType: null,
          scrapedData: {},
          acceptedFields: [],
          improvedFields: [],
          fieldData: {},
        };
        await api.saveUserContext(userSubToUse, emptyContextData);
      }

      // Reset local state
      setContextType(null);
      setScrapedData({});
      setAcceptedFields([]);
      setImprovedFields([]);
      setFieldDataState({});
      setCurrentWhitepaperId(null); // Clear current whitepaper ID

      setResetContextSuccess(true);
      console.log('Context reset successfully for user:', userSubToUse);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setResetContextSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to reset context:', error);
    } finally {
      setIsUserContextLoading(false);
    }
  };

  // Function to load whitepaper data and set it in context
  const loadWhitepaperData = async whitepaperData => {
    try {
      console.log('Loading whitepaper data into context:', whitepaperData);

      // Set the current whitepaper ID for specific save/reset operations
      if (whitepaperData?.generation_id) {
        setCurrentWhitepaperId(whitepaperData.generation_id);
        console.log('Set current whitepaper ID:', whitepaperData.generation_id);
      }

      // Set loading state
      setIsFieldDataLoading(true);
      setFieldDataError(null);

      // Check if the whitepaper has results
      if (whitepaperData?.results) {
        // First check if results has context_data (new format)
        if (whitepaperData.results.context_data) {
          console.log('Found new format context_data');
          const {
            contextType: savedContextType,
            scrapedData: savedScrapedData,
            acceptedFields: savedAcceptedFields,
            improvedFields: savedImprovedFields,
            fieldData: savedFieldData,
          } = whitepaperData.results.context_data;

          if (savedContextType) {
            console.log('Setting context type:', savedContextType);
            setContextType(savedContextType);
          }
          if (savedAcceptedFields) setAcceptedFields(savedAcceptedFields);
          if (savedImprovedFields) setImprovedFields(savedImprovedFields);
          if (savedFieldData) setFieldDataState(savedFieldData);

          // Handle the case where scrapedData might be empty in old saves
          let dataForScrapedData = savedScrapedData;
          if (
            !dataForScrapedData ||
            Object.keys(dataForScrapedData).length === 0
          ) {
            console.log(
              'ScrapedData is empty, using fieldData for BaseSectionComponent'
            );
            // Extract the actual field results from fieldData (excluding meta fields)
            dataForScrapedData = {};
            if (savedFieldData) {
              Object.keys(savedFieldData).forEach(key => {
                // Skip meta fields like questionnaireData and tokenClassification
                if (
                  key !== 'questionnaireData' &&
                  key !== 'tokenClassification' &&
                  savedFieldData[key] &&
                  typeof savedFieldData[key] === 'object' &&
                  savedFieldData[key].field_id
                ) {
                  dataForScrapedData[key] = savedFieldData[key];
                }
              });
            }
          }

          setScrapedData(dataForScrapedData);

          setContextLoaded(true);
          setIsFieldDataLoading(false);
          console.log('Whitepaper data loaded successfully');
          console.log('ScrapedData set to:', dataForScrapedData);

          // Debug: Check for fields with unanswered questions
          const fieldsWithQuestions = Object.keys(dataForScrapedData).filter(
            key => {
              const field = dataForScrapedData[key];
              return (
                field &&
                field.unanswered_questions &&
                field.unanswered_questions.length > 0
              );
            }
          );
          console.log('Fields with unanswered questions:', fieldsWithQuestions);

          // Return the context type for navigation
          return savedContextType;
        } else {
          console.log('Legacy format detected, extracting tokenClassification');
          // Legacy format - treat results as fieldData and extract tokenClassification
          const tokenClassification =
            whitepaperData.results.tokenClassification ||
            whitepaperData.whitepaper_type;
          console.log('Found tokenClassification:', tokenClassification);

          if (tokenClassification) {
            setContextType(tokenClassification);

            // Set both fieldData and scrapedData so BaseSectionComponent can access the data
            const loadedData = {
              questionnaireData: whitepaperData.results,
              tokenClassification: tokenClassification,
              ...whitepaperData.results, // Spread all the field results
            };

            setFieldDataState(loadedData);
            // IMPORTANT: Also set scrapedData so BaseSectionComponent can access it via contextData prop
            setScrapedData(whitepaperData.results);

            setContextLoaded(true);
            setIsFieldDataLoading(false);
            console.log(
              'Legacy whitepaper data loaded with context type:',
              tokenClassification
            );
            console.log(
              'Data set in both fieldData and scrapedData for BaseSectionComponent access'
            );
            console.log(
              'ScrapedData content:',
              JSON.stringify(whitepaperData.results, null, 2)
            );

            // Debug: Check for fields with unanswered questions
            const fieldsWithQuestions = Object.keys(
              whitepaperData.results
            ).filter(key => {
              const field = whitepaperData.results[key];
              return (
                field &&
                field.unanswered_questions &&
                field.unanswered_questions.length > 0
              );
            });
            console.log(
              'Fields with unanswered questions:',
              fieldsWithQuestions
            );
            return tokenClassification;
          }
        }
      } else {
        console.log('No results found in whitepaper data');
      }

      setIsFieldDataLoading(false);
    } catch (error) {
      console.error('Failed to load whitepaper data:', error);
      setFieldDataError('Failed to load whitepaper data');
      setIsFieldDataLoading(false);
    }
    return null;
  };

  // Function to load user context data with explicit user sub
  const loadUserContextData = async (explicitUserSub = null) => {
    const userSubToUse = explicitUserSub || user?.sub;

    if (!userSubToUse) {
      console.log('Cannot load context: No valid user ID found');
      return;
    }

    try {
      setIsUserContextLoading(true);
      setLoadContextSuccess(false);

      const data = await api.getUserContext(userSubToUse);

      if (data?.context_data) {
        const {
          contextType: savedContextType,
          scrapedData: savedScrapedData,
          acceptedFields: savedAcceptedFields,
          improvedFields: savedImprovedFields,
          fieldData: savedFieldData,
        } = data.context_data;

        if (savedContextType) setContextType(savedContextType);
        if (savedScrapedData) setScrapedData(savedScrapedData);
        if (savedAcceptedFields) setAcceptedFields(savedAcceptedFields);
        if (savedImprovedFields) setImprovedFields(savedImprovedFields);
        if (savedFieldData) setFieldDataState(savedFieldData);

        setContextLoaded(true);
        console.log('Context loaded successfully for user:', userSubToUse);
        setLoadContextSuccess(true);

        // Reset success message after 3 seconds
        setTimeout(() => {
          setLoadContextSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to load context:', error);
    } finally {
      setIsUserContextLoading(false);
    }
  };

  // Remove automatic loading on component mount
  // Comment out or remove the useEffect that automatically loads data
  /*
  useEffect(() => {
    // Only load once when authenticated and not during re-renders
    if (isAuthenticated && user?.sub && !initialLoadDone.current) {
      initialLoadDone.current = true;
      loadUserContextData(user.sub);
    }
  }, [isAuthenticated, user]);
  */

  // Persist generation state to localStorage
  useEffect(() => {
    if (generationId) {
      localStorage.setItem('activeGenerationId', generationId);
    } else {
      localStorage.removeItem('activeGenerationId');
    }
  }, [generationId]);

  useEffect(() => {
    if (generationStatus) {
      localStorage.setItem(
        'generationStatus',
        JSON.stringify(generationStatus)
      );
    } else {
      localStorage.removeItem('generationStatus');
    }
  }, [generationStatus]);

  useEffect(() => {
    localStorage.setItem('isGenerating', isGenerating.toString());
  }, [isGenerating]);

  useEffect(() => {
    if (generationStartTime) {
      localStorage.setItem(
        'generationStartTime',
        generationStartTime.toString()
      );
    } else {
      localStorage.removeItem('generationStartTime');
    }
  }, [generationStartTime]);

  // Clean up timers and intervals on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  // Function to load whitepaper form data and lock questionnaire
  const loadWhitepaperForm = async generationId => {
    if (!generationId) return;

    try {
      console.log('Loading whitepaper form for generation:', generationId);
      const response = await api.makeRequest(
        `/api/whitepaper/${generationId}/form`
      );

      if (response.form) {
        setLoadedWhitepaperForm(response.form);
        setIsQuestionnaireLocked(true);
        console.log(
          'Whitepaper form loaded and questionnaire locked:',
          response.form
        );

        // Populate form data in the questionnaire
        const formData = response.form;
        updateContextType(formData.tokenClassification);

        // Clear any timer to prevent autosaving over loaded data
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
          autoSaveTimerRef.current = null;
        }

        return formData;
      }
    } catch (error) {
      console.error('Error loading whitepaper form:', error);
    }
  };

  // Function to unload whitepaper form and unlock questionnaire
  const unloadWhitepaperForm = () => {
    console.log('Unloading whitepaper form and unlocking questionnaire');
    setLoadedWhitepaperForm(null);
    setIsQuestionnaireLocked(false);

    // Clear the current whitepaper context
    setCurrentWhitepaperId(null);

    // Clear field data and context to start fresh
    setFieldDataState({});
    setScrapedData({});
    setAcceptedFields([]);
    setImprovedFields([]);
    setContextType(null);
    setContextLoaded(false);

    // Also clear any cached token classification to avoid stale state
    try {
      localStorage.removeItem('tokenClassification');
    } catch (e) {
      // ignore storage errors
    }

    console.log('Questionnaire unlocked and data cleared for new generation');
  };

  return (
    <DataContext.Provider
      value={{
        contextType,
        contextLoaded,
        updateContextType,
        scrapedData,
        updateScrapedData,
        acceptedFields,
        updateAcceptedFields,
        improvedFields,
        updateImprovedFields,
        fieldData,
        setFieldData,
        isFieldDataLoading,
        setIsFieldDataLoading,
        fieldDataError,
        setFieldDataError,
        loadUserContextData,
        loadWhitepaperData,
        saveUserContextData,
        isUserContextLoading,
        saveContextSuccess,
        resetUserContextData,
        resetContextSuccess,
        loadContextSuccess,
        currentWhitepaperId,
        loadedWhitepaperForm,
        isQuestionnaireLocked,
        loadWhitepaperForm,
        unloadWhitepaperForm,
        generationId,
        generationStatus,
        isGenerating,
        generationStartTime,
        generationProgress: generationStatus?.progress || 0,
        generatedResults: generationStatus?.results || {},
        generationFailure,
        clearGenerationFailure: () => setGenerationFailure(null),
        startGeneration,
        clearGenerationState,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => useContext(DataContext);
