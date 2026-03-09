import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAutosave } from '../../../context/AutosaveContext';
import { useDataContext } from '../../../context/DataContext';
import { useFileProcessing } from '../../../context/FileProcessingContext';
import { useApi } from '../../../services/api';
import Loader from '../../Common/Loader';
import Header from '../../layout/Header';
import Sidebar from '../../layout/Sidebar';
import GeneratedWhitepapersModal from '../../modals/GeneratedWhitepapersModal';
import GenerationInfoModal from '../../modals/GenerationInfoModal';
import ProgressBar from '../../ProgressBar';
import DTILookup from '../DTILookup/DTILookup';
import FileUploader from '../FileUploader/FileUploader';
import LEILookup from './LEILookup';
import { Button } from '../../ui/button';

const Questionnaire = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth0();
  const api = useApi();
  const { isProcessingFiles, getProcessingFiles } = useFileProcessing();
  const {
    updateScrapedData,
    setFieldData,
    setIsFieldDataLoading,
    setFieldDataError,
    saveUserContextData,
    updateContextType,
    loadWhitepaperData,
    loadedWhitepaperForm,
    isQuestionnaireLocked,
    unloadWhitepaperForm,
    startGeneration: startGenerationFromContext,
  } = useDataContext();

  // Add safe destructuring with fallbacks
  const autosaveContext = useAutosave();
  const startGeneration =
    autosaveContext?.startGeneration ||
    (() => {
      console.log('startGeneration function not available from useAutosave');
    });
  const endGeneration =
    autosaveContext?.endGeneration ||
    (() => {
      console.log('endGeneration function not available from useAutosave');
    });

  // Helper to create a fresh form state
  const createInitialFormData = () => ({
    tokenClassification: '',
    dateOfNotification: '', // Add date of notification field
    offerorName: '',
    offerorCompaniesHouseLink: '',
    offerorPhone: '',
    offerorEmail: '',
    offerorLegalForm: '', // Add legal form field
    offerorRegisteredAddress: '', // Add registered address field
    offerorHeadOffice: '', // Add head office field
    offerorRegistrationDate: '', // Add registration date field
    offerorParentCompanyName: '', // Add parent company name field
    personType: 'Offeror',
    isCryptoAssetNameSame: 'Yes',
    cryptoAssetName: '',
    isCryptoProjectNameSame: 'Yes',
    cryptoProjectNameSameAs: '',
    cryptoProjectName: '',
    issuerType: '', // Changed from "Same" to empty string
    issuerName: '',
    issuerCompaniesHouseLink: '',
    issuerPhone: '',
    issuerEmail: '',
    issuerLegalForm: '', // Add issuer legal form field
    issuerRegisteredAddress: '', // Add issuer registered address field
    issuerHeadOffice: '', // Add issuer head office field
    issuerRegistrationDate: '', // Add issuer registration date field
    issuerParentCompanyName: '', // Add issuer parent company name field
    issuerFinancialCondition: '', // Add issuer financial condition field
    keyDecisionMakers: '', // Add key decision makers field for ART
    formalStructures: '', // Add formal structures field for ART
    operatorType: '',
    operatorName: '',
    operatorCompaniesHouseLink: '',
    operatorPhone: '',
    operatorEmail: '',
    operatorLegalForm: '', // Add operator legal form field
    operatorRegisteredAddress: '', // Add operator registered address field
    operatorHeadOffice: '', // Add operator head office field
    operatorRegistrationDate: '', // Add operator registration date field
    operatorParentCompanyName: '', // Add operator parent company name field
    whitepaperSubmitter: '', // Changed from "Issuer" to empty string
    cryptoAssetSituation: '',
    responseTime: '',
    documents: null,
    offerorLeiNumber: '',
    issuerLeiNumber: '',
    operatorLeiNumber: '',
    leiNumber: '', // General LEI input field
    elfCode: '', // ELF code input field
    publicationDate: '', // Add publication date field
    submissionType: '', // Add submission type field
    prospectiveHolders: '', // Add prospective holders field
    reasonForOffer: '', // Add reason for offer field
    futureCryptoOffers: '', // Add future crypto offers field
    // Add new fields for future crypto offer details
    minTargetSubscription: '',
    maxTargetSubscription: '',
    issuePrice: '',
    subscriptionFees: '',
    numberOfCryptoAssets: '',
    offerTargetAudience: '',
    offerConditionsRestrictions: '',
    isPhasedOffer: '',
    caspInCharge: '',
    offerDate: '',
    offerJurisdictions: '',
    plannedUseOfFunds: '',
    selectedDTIs: [],
    selectedFungibleDTIs: [],
    hasContractTerms: '',
    utilityTokenDescription: '',
    keyFeaturesGoodsServices: '',
    keyInformation: '',
    thirdPartyReserveManagement: '',
    thirdPartyInvestmentAuth: '',
    thirdPartyDistribution: '',
    // Add new ART-specific fields
    artMarketValueBelow5M: '',
    artIssuerCreditInstitution: '',
  });

  const [formData, setFormData] = useState(createInitialFormData());

  const [leiData, setLeiData] = useState(null);
  const [leiLoading, setLeiLoading] = useState(false);
  const [leiError, setLeiError] = useState(null);
  const [showFullLeiData, setShowFullLeiData] = useState(false);

  // Add state to track successful LEI lookups
  const [validLeiData, setValidLeiData] = useState({
    offeror: false,
    issuer: false,
    operator: false,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFinancialConditionTooltip, setShowFinancialConditionTooltip] =
    useState(false);

  // Add state for DTI records
  const [selectedDTIRecords, setSelectedDTIRecords] = useState({});
  const [selectedFungibleDTIRecords, setSelectedFungibleDTIRecords] = useState(
    {}
  );

  // State to track selected files for generation
  const [selectedFiles, setSelectedFiles] = useState({});

  // State for generated whitepapers modal
  const [showWhitepapersModal, setShowWhitepapersModal] = useState(false);

  // State for generation info modal
  const [showGenerationInfoModal, setShowGenerationInfoModal] = useState(false);

  // Helper: fully clear local questionnaire state (used when unloading whitepaper)
  const clearQuestionnaireState = () => {
    setFormData(createInitialFormData());
    setSelectedFiles({});
    setSelectedDTIRecords({});
    setSelectedFungibleDTIRecords({});
    setValidLeiData({ offeror: false, issuer: false, operator: false });
    setIsSubmitted(false);
    setError(null);
    // Ensure any tokenClassification cached value is cleared
    try {
      localStorage.removeItem('tokenClassification');
    } catch (_) {
      // Ignore localStorage errors (e.g., in private browsing mode)
    }
  };

  useEffect(() => {
    if (location.state && location.state.formData) {
      setFormData(prev => ({
        ...prev,
        ...location.state.formData,
      }));
    }
  }, [location]);

  // Handle opening whitepapers modal from navigation state
  useEffect(() => {
    if (location.state && location.state.openWhitepapersModal) {
      setShowWhitepapersModal(true);
      // Clear the state to prevent reopening on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Handle loading whitepaper form data
  useEffect(() => {
    if (loadedWhitepaperForm) {
      console.log(
        'Loading whitepaper form data into questionnaire:',
        loadedWhitepaperForm
      );
      setFormData(loadedWhitepaperForm);
      // Also update context type
      if (loadedWhitepaperForm.tokenClassification) {
        updateContextType(loadedWhitepaperForm.tokenClassification);
      }
    }
  }, [loadedWhitepaperForm, updateContextType]);

  useEffect(() => {
    console.log('Questionnaire Auth0 state:', {
      isAuthenticated,
      isLoading,
      user: user?.sub,
    });
  }, [isAuthenticated, isLoading, user]);

  // Auto-update crypto asset name and project name when offeror name changes
  useEffect(() => {
    // Use a flag to track if we need to update
    let shouldUpdate = false;
    const updates = {};

    // Update cryptoAssetName if it should match offerorName
    if (
      formData.isCryptoAssetNameSame === 'Yes' &&
      formData.offerorName &&
      formData.cryptoAssetName !== formData.offerorName
    ) {
      updates.cryptoAssetName = formData.offerorName;
      shouldUpdate = true;
    }

    // Update cryptoProjectName if it should match offerorName
    if (
      formData.isCryptoProjectNameSame === 'Yes' &&
      formData.cryptoProjectNameSameAs === 'offeror' &&
      formData.offerorName &&
      formData.cryptoProjectName !== formData.offerorName
    ) {
      updates.cryptoProjectName = formData.offerorName;
      shouldUpdate = true;
    }

    // Update cryptoProjectName if it should match cryptoAssetName
    if (
      formData.isCryptoProjectNameSame === 'Yes' &&
      formData.cryptoProjectNameSameAs === 'crypto' &&
      formData.cryptoAssetName &&
      formData.cryptoProjectName !== formData.cryptoAssetName
    ) {
      updates.cryptoProjectName = formData.cryptoAssetName;
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      setFormData(prev => ({ ...prev, ...updates }));
    }
  }, [
    formData.offerorName,
    formData.cryptoAssetName,
    formData.isCryptoAssetNameSame,
    formData.isCryptoProjectNameSame,
    formData.cryptoProjectNameSameAs,
    formData.cryptoAssetName,
    formData.cryptoProjectName,
  ]);

  // Auto-sync issuer and operator fields based on issuerType and operatorType
  useEffect(() => {
    let shouldUpdate = false;
    const updates = {};

    // Sync issuer fields when issuerType is "FALSE" (same) and offeror fields change
    if (formData.issuerType === 'FALSE') {
      const offerorFields = [
        'Name',
        'CompaniesHouseLink',
        'Phone',
        'Email',
        'LegalForm',
        'RegisteredAddress',
        'HeadOffice',
        'RegistrationDate',
        'ParentCompanyName',
        'LeiNumber',
      ];

      offerorFields.forEach(field => {
        const offerorKey = `offeror${field}`;
        const issuerKey = `issuer${field}`;
        const offerorValue = formData[offerorKey] || '';
        const issuerValue = formData[issuerKey] || '';

        if (offerorValue !== issuerValue) {
          updates[issuerKey] = offerorValue;
          shouldUpdate = true;
        }
      });
    }

    // Sync operator fields based on operatorType
    if (formData.operatorType === 'SameAsOfferor') {
      const offerorFields = [
        'Name',
        'CompaniesHouseLink',
        'Phone',
        'Email',
        'LegalForm',
        'RegisteredAddress',
        'HeadOffice',
        'RegistrationDate',
        'ParentCompanyName',
        'LeiNumber',
      ];

      offerorFields.forEach(field => {
        const offerorKey = `offeror${field}`;
        const operatorKey = `operator${field}`;
        const offerorValue = formData[offerorKey] || '';
        const operatorValue = formData[operatorKey] || '';

        if (offerorValue !== operatorValue) {
          updates[operatorKey] = offerorValue;
          shouldUpdate = true;
        }
      });
    } else if (formData.operatorType === 'SameAsIssuer') {
      const issuerFields = [
        'Name',
        'CompaniesHouseLink',
        'Phone',
        'Email',
        'LegalForm',
        'RegisteredAddress',
        'HeadOffice',
        'RegistrationDate',
        'ParentCompanyName',
        'LeiNumber',
      ];

      issuerFields.forEach(field => {
        const issuerKey = `issuer${field}`;
        const operatorKey = `operator${field}`;
        const issuerValue = formData[issuerKey] || '';
        const operatorValue = formData[operatorKey] || '';

        if (issuerValue !== operatorValue) {
          updates[operatorKey] = issuerValue;
          shouldUpdate = true;
        }
      });
    }

    if (shouldUpdate) {
      setFormData(prev => ({ ...prev, ...updates }));
    }
  }, [
    // Dependencies: trigger when these fields change
    formData.issuerType,
    formData.operatorType,
    // Offeror fields
    formData.offerorName,
    formData.offerorCompaniesHouseLink,
    formData.offerorPhone,
    formData.offerorEmail,
    formData.offerorLegalForm,
    formData.offerorRegisteredAddress,
    formData.offerorHeadOffice,
    formData.offerorRegistrationDate,
    formData.offerorParentCompanyName,
    formData.offerorLeiNumber,
    // Issuer fields (for operator sync when SameAsIssuer)
    formData.issuerName,
    formData.issuerCompaniesHouseLink,
    formData.issuerPhone,
    formData.issuerEmail,
    formData.issuerLegalForm,
    formData.issuerRegisteredAddress,
    formData.issuerHeadOffice,
    formData.issuerRegistrationDate,
    formData.issuerParentCompanyName,
    formData.issuerLeiNumber,
    // Current operator fields (to check if they differ)
    formData.operatorName,
    formData.operatorCompaniesHouseLink,
    formData.operatorPhone,
    formData.operatorEmail,
    formData.operatorLegalForm,
    formData.operatorRegisteredAddress,
    formData.operatorHeadOffice,
    formData.operatorRegistrationDate,
    formData.operatorParentCompanyName,
    formData.operatorLeiNumber,
  ]);

  const handleInputChange = e => {
    const { id, value } = e.target;

    setFormData(prev => {
      const updatedData = { ...prev, [id]: value };

      // Update context type when token classification changes
      if (id === 'tokenClassification') {
        updateContextType(value);

        // Store token classification in localStorage for API calls
        localStorage.setItem('tokenClassification', value);
      }

      // Logic for crypto asset name when offeror name changes
      if (id === 'offerorName' && prev.isCryptoAssetNameSame === 'Yes') {
        // If crypto asset name should be same as offeror name, update it
        updatedData.cryptoAssetName = value;

        // Also update crypto project name if it's set to follow crypto asset name
        if (
          prev.isCryptoProjectNameSame === 'Yes' &&
          prev.cryptoProjectNameSameAs === 'crypto'
        ) {
          updatedData.cryptoProjectName = value;
        }
      }

      // Logic for crypto asset name changes
      if (id === 'cryptoAssetName') {
        // Update crypto project name if it should follow crypto asset name
        if (
          prev.isCryptoProjectNameSame === 'Yes' &&
          prev.cryptoProjectNameSameAs === 'crypto'
        ) {
          updatedData.cryptoProjectName = value;
        }
      }

      // Logic for crypto project name when offeror name changes (if project follows offeror)
      if (
        id === 'offerorName' &&
        prev.isCryptoProjectNameSame === 'Yes' &&
        prev.cryptoProjectNameSameAs === 'offeror'
      ) {
        updatedData.cryptoProjectName = value;
      }

      // Save questionnaire data to context immediately like PartA (but only if not locked)
      setFieldData(prevFieldData => {
        const updatedFieldData = {
          ...prevFieldData,
          questionnaireData: updatedData,
          tokenClassification:
            value === 'tokenClassification'
              ? updatedData[id]
              : prevFieldData.tokenClassification ||
                updatedData.tokenClassification,
        };

        // Save context data after updating field value (only if questionnaire is not locked)
        if (!isQuestionnaireLocked) {
          saveUserContextData();
        }

        return updatedFieldData;
      });

      return updatedData;
    });
  };

  const handleRadioChange = (id, value) => {
    setFormData(prev => {
      const updatedData = { ...prev, [id]: value };

      // Logic for crypto asset name based on isCryptoAssetNameSame
      if (id === 'isCryptoAssetNameSame') {
        if (value === 'Yes') {
          // If "Yes", set cryptoAssetName to offerorName
          updatedData.cryptoAssetName = prev.offerorName || '';

          // Also update crypto project name if it follows crypto asset name
          if (
            prev.isCryptoProjectNameSame === 'Yes' &&
            prev.cryptoProjectNameSameAs === 'crypto'
          ) {
            updatedData.cryptoProjectName = prev.offerorName || '';
          }
        } else if (value === 'No') {
          // If "No", clear the cryptoAssetName so user can enter it manually
          updatedData.cryptoAssetName = '';
        }
      }

      // Logic for crypto project name based on isCryptoProjectNameSame
      if (id === 'isCryptoProjectNameSame') {
        if (value === 'Yes') {
          // When "Yes" is selected, wait for cryptoProjectNameSameAs to be selected
          // Only clear if we're switching from "No" to "Yes"
          if (prev.isCryptoProjectNameSame === 'No') {
            updatedData.cryptoProjectName = '';
          }
        } else if (value === 'No') {
          // If "No", clear the cryptoProjectName so user can enter it manually
          updatedData.cryptoProjectName = '';
          // Also clear the cryptoProjectNameSameAs selection
          updatedData.cryptoProjectNameSameAs = '';
        }
      }

      // Logic for cryptoProjectNameSameAs selection
      if (id === 'cryptoProjectNameSameAs') {
        if (value === 'crypto') {
          // Same as crypto asset name
          updatedData.cryptoProjectName = prev.cryptoAssetName || '';
        } else if (value === 'offeror') {
          // Same as offeror name
          updatedData.cryptoProjectName = prev.offerorName || '';
        }
      }

      // Logic for issuerType - copy offeror fields to issuer fields when "FALSE" (same)
      if (id === 'issuerType') {
        if (value === 'FALSE') {
          // Copy all offeror fields to issuer fields
          updatedData.issuerName = prev.offerorName || '';
          updatedData.issuerCompaniesHouseLink =
            prev.offerorCompaniesHouseLink || '';
          updatedData.issuerPhone = prev.offerorPhone || '';
          updatedData.issuerEmail = prev.offerorEmail || '';
          updatedData.issuerLegalForm = prev.offerorLegalForm || '';
          updatedData.issuerRegisteredAddress =
            prev.offerorRegisteredAddress || '';
          updatedData.issuerHeadOffice = prev.offerorHeadOffice || '';
          updatedData.issuerRegistrationDate =
            prev.offerorRegistrationDate || '';
          updatedData.issuerParentCompanyName =
            prev.offerorParentCompanyName || '';
          updatedData.issuerLeiNumber = prev.offerorLeiNumber || '';
        } else if (value === 'TRUE') {
          // Clear issuer fields so user can enter them manually
          updatedData.issuerName = '';
          updatedData.issuerCompaniesHouseLink = '';
          updatedData.issuerPhone = '';
          updatedData.issuerEmail = '';
          updatedData.issuerLegalForm = '';
          updatedData.issuerRegisteredAddress = '';
          updatedData.issuerHeadOffice = '';
          updatedData.issuerRegistrationDate = '';
          updatedData.issuerParentCompanyName = '';
          updatedData.issuerLeiNumber = '';
        }
      }

      // Logic for operatorType - copy fields based on selection
      if (id === 'operatorType') {
        if (value === 'SameAsOfferor') {
          // Copy all offeror fields to operator fields
          updatedData.operatorName = prev.offerorName || '';
          updatedData.operatorCompaniesHouseLink =
            prev.offerorCompaniesHouseLink || '';
          updatedData.operatorPhone = prev.offerorPhone || '';
          updatedData.operatorEmail = prev.offerorEmail || '';
          updatedData.operatorLegalForm = prev.offerorLegalForm || '';
          updatedData.operatorRegisteredAddress =
            prev.offerorRegisteredAddress || '';
          updatedData.operatorHeadOffice = prev.offerorHeadOffice || '';
          updatedData.operatorRegistrationDate =
            prev.offerorRegistrationDate || '';
          updatedData.operatorParentCompanyName =
            prev.offerorParentCompanyName || '';
          updatedData.operatorLeiNumber = prev.offerorLeiNumber || '';
        } else if (value === 'SameAsIssuer') {
          // Copy all issuer fields to operator fields
          updatedData.operatorName = prev.issuerName || '';
          updatedData.operatorCompaniesHouseLink =
            prev.issuerCompaniesHouseLink || '';
          updatedData.operatorPhone = prev.issuerPhone || '';
          updatedData.operatorEmail = prev.issuerEmail || '';
          updatedData.operatorLegalForm = prev.issuerLegalForm || '';
          updatedData.operatorRegisteredAddress =
            prev.issuerRegisteredAddress || '';
          updatedData.operatorHeadOffice = prev.issuerHeadOffice || '';
          updatedData.operatorRegistrationDate =
            prev.issuerRegistrationDate || '';
          updatedData.operatorParentCompanyName =
            prev.issuerParentCompanyName || '';
          updatedData.operatorLeiNumber = prev.issuerLeiNumber || '';
        } else if (value === 'Different' || value === 'N/A') {
          // Clear operator fields so user can enter them manually (or leave empty for N/A)
          updatedData.operatorName = '';
          updatedData.operatorCompaniesHouseLink = '';
          updatedData.operatorPhone = '';
          updatedData.operatorEmail = '';
          updatedData.operatorLegalForm = '';
          updatedData.operatorRegisteredAddress = '';
          updatedData.operatorHeadOffice = '';
          updatedData.operatorRegistrationDate = '';
          updatedData.operatorParentCompanyName = '';
          updatedData.operatorLeiNumber = '';
        }
      }

      // Save questionnaire data to context immediately like PartA (but only if not locked)
      setFieldData(prevFieldData => {
        const updatedFieldData = {
          ...prevFieldData,
          questionnaireData: updatedData,
          tokenClassification:
            prevFieldData.tokenClassification ||
            updatedData.tokenClassification,
        };

        // Save context data after updating field value (only if questionnaire is not locked)
        if (!isQuestionnaireLocked) {
          saveUserContextData();
        }

        return updatedFieldData;
      });

      return updatedData;
    });
  };

  const handleFileChange = e => {
    // Remove this function as file handling is now done in FileUploader
    // Keep for compatibility but it's no longer used
  };

  const handleLoadWhitepaper = async whitepaper => {
    console.log('Loading whitepaper:', whitepaper);

    try {
      // Use the DataContext loadWhitepaperData function
      const contextType = await loadWhitepaperData(whitepaper);

      console.log('Loaded context type:', contextType);

      // Navigate to the appropriate route based on context type
      const getInitialRoute = () => {
        console.log('Getting route for context type:', contextType);
        switch (contextType) {
          case 'OTH':
          case 'OTH_UTILITY':
          case 'OTH_NON_UTILITY':
            return '/oth/section1';
          case 'ART':
            return '/art/section1';
          case 'EMT':
            return '/emt/section1';
          default:
            console.log('No matching route found, using default');
            return '/section1';
        }
      };

      // Navigate to the appropriate section
      const route = getInitialRoute();
      console.log('Navigating to:', route);
      navigate(route);
    } catch (error) {
      console.error('Error loading whitepaper:', error);
    }

    // Close the modal
    setShowWhitepapersModal(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Check if files are being processed
    if (isProcessingFiles) {
      const processingFileNames = getProcessingFiles();
      setError(
        `Cannot start whitepaper generation while files are being processed. Please wait for the following files to finish processing: ${processingFileNames.join(', ')}`
      );
      return;
    }

    // Check if Auth0 is still loading
    if (isLoading) {
      setError('Authentication is still loading. Please wait.');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      setError('You must be authenticated to submit the form.');
      return;
    }

    // Validate basic required fields for all token types
    if (
      !formData.tokenClassification ||
      !formData.cryptoAssetSituation ||
      !formData.whitepaperSubmitter ||
      !formData.submissionType
    ) {
      setError('Please fill out all required dropdown fields');
      return;
    }

    // Validate fields specific to OTH tokens
    if (
      formData.tokenClassification === 'OTH_UTILITY' ||
      formData.tokenClassification === 'OTH_NON_UTILITY'
    ) {
      if (
        (formData.isCryptoProjectNameSame === 'Yes' &&
          !formData.cryptoProjectNameSameAs) ||
        !formData.issuerType ||
        !formData.operatorType ||
        ((formData.cryptoAssetSituation === 'offer' ||
          formData.cryptoAssetSituation === 'admission' ||
          formData.cryptoAssetSituation === 'both') &&
          !formData.prospectiveHolders) ||
        ((formData.cryptoAssetSituation === 'offer' ||
          formData.cryptoAssetSituation === 'admission' ||
          formData.cryptoAssetSituation === 'both') &&
          !formData.reasonForOffer) ||
        (formData.futureCryptoOffers === 'Yes' &&
          (!formData.minTargetSubscription ||
            !formData.maxTargetSubscription ||
            !formData.issuePrice ||
            !formData.subscriptionFees ||
            !formData.numberOfCryptoAssets ||
            !formData.offerTargetAudience ||
            !formData.offerConditionsRestrictions ||
            !formData.caspInCharge ||
            !formData.offerDate ||
            !formData.offerJurisdictions ||
            !formData.plannedUseOfFunds))
      ) {
        setError('Please fill out all required dropdown fields');
        return;
      }
    }

    // Validate fields specific to ART tokens
    if (formData.tokenClassification === 'ART') {
      if (
        formData.futureCryptoOffers === 'Yes' &&
        (!formData.minTargetSubscription ||
          !formData.maxTargetSubscription ||
          !formData.issuePrice ||
          !formData.subscriptionFees ||
          !formData.numberOfCryptoAssets ||
          !formData.offerTargetAudience ||
          !formData.offerConditionsRestrictions ||
          !formData.caspInCharge ||
          !formData.offerDate ||
          !formData.offerJurisdictions ||
          !formData.plannedUseOfFunds)
      ) {
        setError('Please fill out all required dropdown fields');
        return;
      }
    }

    setIsSubmitted(true);

    // Show the generation info modal instead of immediately starting generation
    setShowGenerationInfoModal(true);
  };

  // Function to actually start the generation after user confirms in modal
  const handleConfirmGeneration = async () => {
    // Close the modal first
    setShowGenerationInfoModal(false);

    try {
      setIsFormLoading(true);
      setError(null);
      setIsFieldDataLoading(true);
      setFieldDataError(null);

      // Store token classification for API calls
      localStorage.setItem('tokenClassification', formData.tokenClassification);

      // Collect checked files for documents
      const checkedFiles = Object.keys(selectedFiles).filter(
        f => selectedFiles[f]
      );

      // Final save before generation - this is already done on each change now

      // Pause autosave during generation - with safe function call
      try {
        startGeneration();
      } catch (error) {
        console.warn('Failed to start generation (autosave pause):', error);
      }

      // Pass tokenClassification in formData for API
      const formDataWithToken = {
        ...formData,
        whitepaperType: formData.tokenClassification,
        documents: checkedFiles,
      };
      console.log('Submitting payload to backend:', formDataWithToken);

      // Navigate to the appropriate route based on token classification
      const getInitialRoute = () => {
        switch (formData.tokenClassification) {
          case 'OTH':
          case 'OTH_UTILITY':
          case 'OTH_NON_UTILITY':
            return '/oth/section1';
          case 'ART':
            return '/art/section1';
          case 'EMT':
            return '/emt/section1';
          default:
            return '/section1';
        }
      };

      // Use the new background generation system
      const response = await startGenerationFromContext(formDataWithToken);

      // Navigate to the progress page immediately after starting generation
      if (response.generation_id) {
        console.log('Background generation started:', response.generation_id);
        console.log('Form data that was sent:', formDataWithToken);
        // Navigate directly to the progress page with the generation ID so it's preserved
        navigate(`/whitepaper-progress/${response.generation_id}`);
      } else {
        // Legacy response format - update data directly and navigate to first section
        updateScrapedData(response);
        setFieldData(response);
        setIsFieldDataLoading(false);
        navigate(getInitialRoute(), { state: { scrapedData: response } });
      }
    } catch (err) {
      console.error('Error generating fillouts:', err);
      setError('There was an error generating fillouts. Please try again.');
      setFieldDataError(err.message);
      setIsFieldDataLoading(false);
    } finally {
      setIsFormLoading(false);
      // Resume autosave after generation completes - with safe function call
      try {
        endGeneration();
      } catch (error) {
        console.warn('Failed to end generation (autosave resume):', error);
      }
    }
  };

  // Function to handle modal cancellation
  const handleCancelGeneration = () => {
    setShowGenerationInfoModal(false);
    setIsSubmitted(false);
  };

  // Update this function to determine select styling based on value
  const getSelectClassName = value => {
    const baseClass = 'mt-1 p-2 w-full border rounded-lg ';
    const disabledClass = isQuestionnaireLocked
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
      : 'border-gray-300';
    const colorClass =
      value === ''
        ? 'text-gray-500'
        : isQuestionnaireLocked
          ? 'text-gray-400'
          : 'text-gray-900';
    return baseClass + disabledClass + ' ' + colorClass;
  };

  // Add this function for input styling with disabled state
  const getInputClassName = (value, isDisabled = false) => {
    const baseClass = 'mt-1 p-2 w-full border rounded-lg ';
    const colorClass =
      value === '' ? 'text-gray-500 placeholder-gray-400' : 'text-gray-900';
    const questionnaireLocked = isQuestionnaireLocked || isDisabled;
    const disabledClass = questionnaireLocked
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
      : 'border-gray-300';
    return (
      baseClass + disabledClass + ' ' + (questionnaireLocked ? '' : colorClass)
    );
  };

  // Handler to reset validLeiData for a given entity type
  const handleClearLei = entityType => {
    setValidLeiData(prev => ({ ...prev, [entityType]: false }));
  };

  const handleOfferorLeiData = data => {
    console.log('Offeror LEI data retrieved:', data);
    // Set valid LEI flag when data is successfully retrieved
    if (data && data.data) {
      setValidLeiData(prev => ({ ...prev, offeror: true }));

      // Extract and populate offeror details from LEI data
      const entity = data.data.attributes?.entity;
      const registration = data.data.attributes?.registration;
      if (entity) {
        console.log('📝 Processing LEI entity data for offeror');

        setFormData(prev => {
          const updates = {};

          // Legal form
          if (entity.legalForm?.id) {
            updates.offerorLegalForm = entity.legalForm.id;
          }

          if (registration && registration.initialRegistrationDate) {
            const date = new Date(registration.initialRegistrationDate);
            updates.offerorRegistrationDate = date.toISOString().split('T')[0];
          }

          // Registered address (legal address)
          if (entity.legalAddress) {
            const legal = entity.legalAddress;
            const formattedRegisteredAddress = [
              ...(legal.addressLines || []),
              legal.city,
              legal.region,
              legal.country,
              legal.postalCode,
            ]
              .filter(Boolean)
              .join(', ');
            updates.offerorRegisteredAddress = formattedRegisteredAddress;
          }

          // Head office address
          if (entity.headquartersAddress) {
            const hq = entity.headquartersAddress;
            const formattedHeadOffice = [
              ...(hq.addressLines || []),
              hq.city,
              hq.region,
              hq.country,
              hq.postalCode,
            ]
              .filter(Boolean)
              .join(', ');
            updates.offerorHeadOffice = formattedHeadOffice;
          }

          // Parent company information
          const parentCompanyName = data.data.attributes?.parentCompanyName;
          if (parentCompanyName) {
            updates.offerorParentCompanyName = parentCompanyName;
          }

          const updatedData = { ...prev, ...updates };

          console.log('🔄 Before auto-name updates:', {
            offerorName: updatedData.offerorName,
            cryptoAssetName: updatedData.cryptoAssetName,
            cryptoProjectName: updatedData.cryptoProjectName,
            isCryptoAssetNameSame: updatedData.isCryptoAssetNameSame,
            isCryptoProjectNameSame: updatedData.isCryptoProjectNameSame,
            cryptoProjectNameSameAs: updatedData.cryptoProjectNameSameAs,
          });

          // Apply auto-naming logic if conditions are met
          if (
            updatedData.isCryptoAssetNameSame === 'Yes' &&
            updatedData.offerorName
          ) {
            console.log(
              '✅ Auto-setting cryptoAssetName from offerorName:',
              updatedData.offerorName
            );
            updatedData.cryptoAssetName = updatedData.offerorName;
          }

          if (updatedData.isCryptoProjectNameSame === 'Yes') {
            if (
              updatedData.cryptoProjectNameSameAs === 'crypto' &&
              updatedData.cryptoAssetName
            ) {
              console.log(
                '✅ Auto-setting cryptoProjectName from cryptoAssetName:',
                updatedData.cryptoAssetName
              );
              updatedData.cryptoProjectName = updatedData.cryptoAssetName;
            } else if (
              updatedData.cryptoProjectNameSameAs === 'offeror' &&
              updatedData.offerorName
            ) {
              console.log(
                '✅ Auto-setting cryptoProjectName from offerorName:',
                updatedData.offerorName
              );
              updatedData.cryptoProjectName = updatedData.offerorName;
            }
          }

          console.log('✅ After auto-name updates:', {
            cryptoAssetName: updatedData.cryptoAssetName,
            cryptoProjectName: updatedData.cryptoProjectName,
          });

          return updatedData;
        });
      }
    } else {
      setValidLeiData(prev => ({ ...prev, offeror: false }));
    }
  };

  const handleIssuerLeiData = data => {
    console.log('Issuer LEI data retrieved:', data);
    // Set valid LEI flag when data is successfully retrieved
    if (data && data.data) {
      setValidLeiData(prev => ({ ...prev, issuer: true }));

      // Extract and populate issuer details from LEI data
      const entity = data.data.attributes?.entity;
      const registration = data.data.attributes?.registration;
      if (entity) {
        const updates = {};

        // Legal form
        if (entity.legalForm?.id) {
          updates.issuerLegalForm = entity.legalForm.id;
        }

        if (registration && registration.initialRegistrationDate) {
          const date = new Date(registration.initialRegistrationDate);
          updates.issuerRegistrationDate = date.toISOString().split('T')[0];
        }

        // Registered address (legal address)
        if (entity.legalAddress) {
          const legal = entity.legalAddress;
          const formattedRegisteredAddress = [
            ...(legal.addressLines || []),
            legal.city,
            legal.region,
            legal.country,
            legal.postalCode,
          ]
            .filter(Boolean)
            .join(', ');
          updates.issuerRegisteredAddress = formattedRegisteredAddress;
        }

        // Head office address
        if (entity.headquartersAddress) {
          const hq = entity.headquartersAddress;
          const formattedHeadOffice = [
            ...(hq.addressLines || []),
            hq.city,
            hq.region,
            hq.country,
            hq.postalCode,
          ]
            .filter(Boolean)
            .join(', ');
          updates.issuerHeadOffice = formattedHeadOffice;
        }

        // Parent company information
        const parentCompanyName = data.data.attributes?.parentCompanyName;
        if (parentCompanyName) {
          updates.issuerParentCompanyName = parentCompanyName;
        }

        // Update form data with LEI-derived information
        if (Object.keys(updates).length > 0) {
          setFormData(prev => ({
            ...prev,
            ...updates,
          }));
        }
      }
    } else {
      setValidLeiData(prev => ({ ...prev, issuer: false }));
    }
  };

  const handleOperatorLeiData = data => {
    // Handler to reset validLeiData for a given entity type
    const handleClearLei = entityType => {
      setValidLeiData(prev => ({ ...prev, [entityType]: false }));
    };
    console.log('Operator LEI data retrieved:', data);
    // Set valid LEI flag when data is successfully retrieved
    if (data && data.data) {
      setValidLeiData(prev => ({ ...prev, operator: true }));

      // Extract and populate operator details from LEI data
      const entity = data.data.attributes?.entity;
      const registration = data.data.attributes?.registration;
      if (entity) {
        const updates = {};

        // Legal form
        if (entity.legalForm?.id) {
          updates.operatorLegalForm = entity.legalForm.id;
        }

        // Registration date - use registration.initialRegistrationDate instead of entity.creationDate
        if (registration && registration.initialRegistrationDate) {
          const date = new Date(registration.initialRegistrationDate);
          updates.operatorRegistrationDate = date.toISOString().split('T')[0];
        }

        // Registered address (legal address)
        if (entity.legalAddress) {
          const legal = entity.legalAddress;
          const formattedRegisteredAddress = [
            ...(legal.addressLines || []),
            legal.city,
            legal.region,
            legal.country,
            legal.postalCode,
          ]
            .filter(Boolean)
            .join(', ');
          updates.operatorRegisteredAddress = formattedRegisteredAddress;
        }

        // Head office address
        if (entity.headquartersAddress) {
          const hq = entity.headquartersAddress;
          const formattedHeadOffice = [
            ...(hq.addressLines || []),
            hq.city,
            hq.region,
            hq.country,
            hq.postalCode,
          ]
            .filter(Boolean)
            .join(', ');
          updates.operatorHeadOffice = formattedHeadOffice;
        }

        // Parent company information
        const parentCompanyName = data.data.attributes?.parentCompanyName;
        if (parentCompanyName) {
          updates.operatorParentCompanyName = parentCompanyName;
        }

        // Update form data with LEI-derived information
        if (Object.keys(updates).length > 0) {
          setFormData(prev => ({
            ...prev,
            ...updates,
          }));
        }
      }
    } else {
      setValidLeiData(prev => ({ ...prev, operator: false }));
    }
  };

  // Add handler for DTI selection (regular)
  const handleDTISelection = (selectedDTIs, dtiRecords) => {
    setFormData(prev => {
      const updatedData = { ...prev, selectedDTIs };
      setFieldData(prevFieldData => {
        const updatedFieldData = {
          ...prevFieldData,
          questionnaireData: updatedData,
        };
        // Only save if questionnaire is not locked
        if (!isQuestionnaireLocked) {
          saveUserContextData();
        }
        return updatedFieldData;
      });
      return updatedData;
    });
    setSelectedDTIRecords(dtiRecords);
  };

  // Add handler for Fungible DTI selection
  const handleFungibleDTISelection = (selectedDTIs, dtiRecords) => {
    setFormData(prev => {
      const updatedData = { ...prev, selectedFungibleDTIs: selectedDTIs };
      setFieldData(prevFieldData => {
        const updatedFieldData = {
          ...prevFieldData,
          questionnaireData: updatedData,
        };
        // Only save if questionnaire is not locked
        if (!isQuestionnaireLocked) {
          saveUserContextData();
        }
        return updatedFieldData;
      });
      return updatedData;
    });
    setSelectedFungibleDTIRecords(dtiRecords);
  };

  // Add helper function to determine financial condition label
  const getFinancialConditionLabel = () => {
    if (!formData.issuerRegistrationDate) {
      return 'Financial condition';
    }

    const registrationDate = new Date(formData.issuerRegistrationDate);
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    if (registrationDate <= threeYearsAgo) {
      return 'Financial condition for the past three years';
    } else {
      return 'Financial condition since registration';
    }
  };

  const handleDTISelect = dti => {
    const isDTIType3 = dti.dtiType === 3;
    const targetField = isDTIType3 ? 'selectedFungibleDTIs' : 'selectedDTIs';

    setFormData(prev => {
      const currentDTIs = prev[targetField] || [];
      const isAlreadySelected = currentDTIs.some(
        selected => selected.dti === dti.dti
      );

      if (isAlreadySelected) {
        return {
          ...prev,
          [targetField]: currentDTIs.filter(
            selected => selected.dti !== dti.dti
          ),
        };
      } else {
        return {
          ...prev,
          [targetField]: [...currentDTIs, dti],
        };
      }
    });
  };

  const handleRemoveDTI = (dtiToRemove, isDTIType3) => {
    const targetField = isDTIType3 ? 'selectedFungibleDTIs' : 'selectedDTIs';

    setFormData(prev => ({
      ...prev,
      [targetField]: prev[targetField].filter(
        dti => dti.dti !== dtiToRemove.dti
      ),
    }));
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <style>{`
        ::placeholder {
          color: #9ca3af !important;
          opacity: 1;
        }

        input:focus::placeholder {
          opacity: 0.7;
        }

        select:focus {
          color: #1f2937 !important; /* Dark gray/black color when focused */
        }

        select option {
          color: #1f2937 !important; /* Ensure all options are black */
        }

        .tooltip {
          position: relative;
          display: inline-block;
        }

        .tooltip-content {
          visibility: hidden;
          width: 400px;
          background-color: #374151;
          color: #f9fafb;
          text-align: left;
          border-radius: 6px;
          padding: 12px;
          position: absolute;
          z-index: 1000;
          bottom: 125%;
          left: 50%;
          margin-left: -200px;
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 14px;
          line-height: 1.4;
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .tooltip-content::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: #374151 transparent transparent transparent;
        }

        .tooltip:hover .tooltip-content {
          visibility: visible;
          opacity: 1;
        }

        .question-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          background-color: #6b7280;
          color: white;
          border-radius: 50%;
          font-size: 12px;
          font-weight: bold;
          margin-left: 6px;
          cursor: help;
          transition: background-color 0.2s;
        }

        .question-mark:hover {
          background-color: #4b5563;
        }
      `}</style>

      <Header />
      <Sidebar />

      <div className='main-dashboard main-dashboard-bg ml-64' style={{ marginTop: 'var(--header-height)' }}>
        <div className='w-full px-6'>
          <div className='main-dashboard-row'>
            <div className='main-banner questionare-btn rounded-lg pr-0 w-full col-span-1 my-[30px] mx-0 py-0'>
              <div className='mb-6 bg-white shadow-[0px_0px_10px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.2)] rounded-[8px] p-[29px] mt-[30px] mb-[24px]'>
                {isSubmitted && <ProgressBar />}
                <h5 className='font-medium text-lg mb-2'>
                  <b>Crypto Asset Questionnaire</b>
                </h5>
                <p className='text-gray-600 mb-6'>
                  Please provide detailed information about the crypto asset to
                  generate your whitepaper.
                </p>

                {/* Show unload button when questionnaire is locked */}
                {isQuestionnaireLocked && (
                  <div className='mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h6 className='font-medium text-blue-900 mb-1'>
                          Questionnaire Loaded from Whitepaper
                        </h6>
                        <p className='text-sm text-blue-700'>
                          This questionnaire is locked with data from a
                          previously generated whitepaper. Auto-saving is
                          disabled to preserve the original data.
                        </p>
                      </div>
                      <Button
                        type='button'
                        variant='destructive'
                        onClick={() => {
                          if (
                            window.confirm(
                              'Are you sure you want to unload this questionnaire? This will clear all current data and allow you to start a new generation.'
                            )
                          ) {
                            unloadWhitepaperForm();
                            clearQuestionnaireState();
                          }
                        }}
                        className='ml-4 flex-shrink-0'
                      >
                        Unload Questionnaire
                      </Button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className='mb-4'>
                    <label
                      htmlFor='tokenClassification'
                      className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                    >
                      What is the classification of the crypto asset type?
                    </label>
                    <select
                      id='tokenClassification'
                      value={formData.tokenClassification}
                      onChange={handleInputChange}
                      className={getSelectClassName(
                        formData.tokenClassification
                      )}
                      disabled={isQuestionnaireLocked}
                      required
                    >
                      <option value='' disabled className='text-gray-400'>
                        -- Select Token Classification --
                      </option>
                      <option value='ART'>ART</option>
                      <option value='EMT'>EMT</option>
                      <option value='OTH_UTILITY'>Other (utility token)</option>
                      <option value='OTH_NON_UTILITY'>
                        Other (not utility token)
                      </option>
                    </select>
                  </div>

                  <div className='mb-4'>
                    <label
                      htmlFor='dateOfNotification'
                      className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                    >
                      Date of notification
                    </label>
                    <input
                      type='date'
                      id='dateOfNotification'
                      value={formData.dateOfNotification}
                      onChange={handleInputChange}
                      className={getInputClassName(formData.dateOfNotification)}
                      placeholder='YYYY-MM-DD'
                      disabled={isQuestionnaireLocked}
                      required
                    />
                  </div>

                  {(formData.tokenClassification === 'OTH_UTILITY' ||
                    formData.tokenClassification === 'OTH_NON_UTILITY') && (
                    <>
                      <div className='mb-4'>
                        <label
                          htmlFor='offerorLeiLookup'
                          className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                        >
                          Who is the offeror or person seeking admission to
                          trading?
                        </label>

                        <div id='offerorLeiLookup'>
                          <LEILookup
                            onLeiData={handleOfferorLeiData}
                            formData={{
                              ...formData,
                              leiNumber: formData.offerorLeiNumber,
                            }}
                            setFormData={updateFn => {
                              setFormData(prev => {
                                const updated = updateFn(prev);
                                return {
                                  ...updated,
                                  offerorLeiNumber: updated.leiNumber,
                                };
                              });
                            }}
                            getInputClassName={getInputClassName}
                            title='Offeror LEI Lookup'
                            description='Enter LEI for the offeror or person seeking admission to trading'
                            entityType='offeror'
                            onClearLei={handleClearLei}
                          />
                        </div>

                        <div className='mb-4'>
                          <label
                            htmlFor='offerorName'
                            className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                          >
                            Write name
                          </label>
                          <input
                            type='text'
                            id='offerorName'
                            value={formData.offerorName}
                            onChange={handleInputChange}
                            className={getInputClassName(formData.offerorName)}
                            placeholder='Enter name'
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor='offerorCompaniesHouseLink'
                            className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                          >
                            Companies registration link
                          </label>
                          <input
                            type='text'
                            id='offerorCompaniesHouseLink'
                            value={formData.offerorCompaniesHouseLink}
                            onChange={handleInputChange}
                            className={getInputClassName(
                              formData.offerorCompaniesHouseLink,
                              validLeiData.offeror
                            )}
                            placeholder={
                              validLeiData.offeror
                                ? 'Disabled - LEI data available'
                                : 'Enter Companies Registration link'
                            }
                            disabled={validLeiData.offeror}
                          />
                          {validLeiData.offeror && (
                            <p className='text-xs text-gray-500 mt-1'>
                              Field disabled - company registration information
                              available from LEI lookup
                            </p>
                          )}
                        </div>

                        <div className='mb-4 mt-4'>
                          <label
                            htmlFor='offerorPhone'
                            className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                          >
                            Contact phone
                          </label>
                          <input
                            type='text'
                            id='offerorPhone'
                            value={formData.offerorPhone}
                            onChange={handleInputChange}
                            className={getInputClassName(formData.offerorPhone)}
                            placeholder='Enter contact phone number'
                            required
                          />
                        </div>

                        <div className='mb-4'>
                          <label
                            htmlFor='offerorEmail'
                            className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                          >
                            Contact email address
                          </label>
                          <input
                            type='email'
                            id='offerorEmail'
                            value={formData.offerorEmail}
                            onChange={handleInputChange}
                            className={getInputClassName(formData.offerorEmail)}
                            placeholder='Enter contact email address'
                            required
                          />
                        </div>

                        <div className='mb-4'>
                          <label
                            htmlFor='offerorLegalForm'
                            className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                          >
                            Legal form
                          </label>
                          <input
                            type='text'
                            id='offerorLegalForm'
                            value={formData.offerorLegalForm}
                            onChange={handleInputChange}
                            className={getInputClassName(
                              formData.offerorLegalForm,
                              validLeiData.offeror
                            )}
                            placeholder={
                              validLeiData.offeror
                                ? 'Disabled - LEI data available'
                                : 'Enter legal form'
                            }
                            disabled={validLeiData.offeror}
                          />
                          {validLeiData.offeror && (
                            <p className='text-xs text-gray-500 mt-1'>
                              Field disabled - legal form information available
                              from LEI lookup
                            </p>
                          )}
                        </div>

                        <div className='mb-4'>
                          <label
                            htmlFor='offerorRegisteredAddress'
                            className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                          >
                            Registered address
                          </label>
                          <textarea
                            id='offerorRegisteredAddress'
                            value={formData.offerorRegisteredAddress}
                            onChange={handleInputChange}
                            className={getInputClassName(
                              formData.offerorRegisteredAddress,
                              validLeiData.offeror
                            )}
                            placeholder={
                              validLeiData.offeror
                                ? 'Disabled - LEI data available'
                                : 'Enter registered address'
                            }
                            rows={3}
                            disabled={validLeiData.offeror}
                          />
                          {validLeiData.offeror && (
                            <p className='text-xs text-gray-500 mt-1'>
                              Field disabled - registered address information
                              available from LEI lookup
                            </p>
                          )}
                        </div>

                        <div className='mb-4'>
                          <label
                            htmlFor='offerorHeadOffice'
                            className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                          >
                            Head office
                          </label>
                          <textarea
                            id='offerorHeadOffice'
                            value={formData.offerorHeadOffice}
                            onChange={handleInputChange}
                            className={getInputClassName(
                              formData.offerorHeadOffice,
                              validLeiData.offeror
                            )}
                            placeholder={
                              validLeiData.offeror
                                ? 'Disabled - LEI data available'
                                : 'Enter head office address'
                            }
                            rows={3}
                            disabled={validLeiData.offeror}
                          />
                          {validLeiData.offeror && (
                            <p className='text-xs text-gray-500 mt-1'>
                              Field disabled - head office information available
                              from LEI lookup
                            </p>
                          )}
                        </div>

                        <div className='mb-4'>
                          <label
                            htmlFor='offerorRegistrationDate'
                            className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                          >
                            Registration date
                          </label>
                          <input
                            type='date'
                            id='offerorRegistrationDate'
                            value={formData.offerorRegistrationDate}
                            onChange={handleInputChange}
                            className={getInputClassName(
                              formData.offerorRegistrationDate,
                              validLeiData.offeror
                            )}
                            placeholder={
                              validLeiData.offeror
                                ? 'Disabled - LEI data available'
                                : 'Enter registration date'
                            }
                            disabled={validLeiData.offeror}
                          />
                          {validLeiData.offeror && (
                            <p className='text-xs text-gray-500 mt-1'>
                              Field disabled - registration date information
                              available from LEI lookup
                            </p>
                          )}
                        </div>

                        <div className='mb-4'>
                          <label
                            htmlFor='offerorParentCompanyName'
                            className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                          >
                            Name of the parent company
                          </label>
                          <input
                            type='text'
                            id='offerorParentCompanyName'
                            value={formData.offerorParentCompanyName}
                            onChange={handleInputChange}
                            className={getInputClassName(
                              formData.offerorParentCompanyName
                            )}
                            placeholder='If there is no parent company, leave this blank'
                          />
                        </div>
                      </div>

                      <div className='mb-4'>
                        <label
                          htmlFor='personType'
                          className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                        >
                          Select type of person:
                        </label>
                        <div className='flex gap-5'>
                          <label className='inline-flex items-center'>
                            <input
                              type='radio'
                              name='personType'
                              checked={formData.personType === 'Offeror'}
                              onChange={() =>
                                handleRadioChange('personType', 'Offeror')
                              }
                              className='form-radio h-5 w-5 text-blue-600'
                            />
                            <span className='ml-2'>Offeror</span>
                          </label>
                          <label className='inline-flex items-center'>
                            <input
                              type='radio'
                              name='personType'
                              checked={formData.personType === 'Person'}
                              onChange={() =>
                                handleRadioChange('personType', 'Person')
                              }
                              className='form-radio h-5 w-5 text-blue-600'
                            />
                            <span className='ml-2'>
                              Person seeking admission to trading
                            </span>
                          </label>
                          <label className='inline-flex items-center'>
                            <input
                              type='radio'
                              name='personType'
                              checked={formData.personType === 'Operator'}
                              onChange={() =>
                                handleRadioChange('personType', 'Operator')
                              }
                              className='form-radio h-5 w-5 text-blue-600'
                            />
                            <span className='ml-2'>
                              Operator of trading platform
                            </span>
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {(formData.tokenClassification === 'OTH_UTILITY' ||
                    formData.tokenClassification === 'OTH_NON_UTILITY') && (
                    <div className='mb-4'>
                      <label
                        htmlFor='isCryptoAssetNameSame'
                        className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                      >
                        Is the crypto asset name the same as the offeror&apos;s
                        or issuer&apos;s name?
                      </label>
                      <div id='isCryptoAssetNameSame' className='flex gap-5'>
                        <label className='inline-flex items-center'>
                          <input
                            type='radio'
                            name='isCryptoAssetNameSame'
                            checked={formData.isCryptoAssetNameSame === 'Yes'}
                            onChange={() =>
                              handleRadioChange('isCryptoAssetNameSame', 'Yes')
                            }
                            className='form-radio h-5 w-5 text-blue-600'
                          />
                          <span className='ml-2'>Yes</span>
                        </label>
                        <label className='inline-flex items-center'>
                          <input
                            type='radio'
                            name='isCryptoAssetNameSame'
                            checked={formData.isCryptoAssetNameSame === 'No'}
                            onChange={() =>
                              handleRadioChange('isCryptoAssetNameSame', 'No')
                            }
                            className='form-radio h-5 w-5 text-blue-600'
                          />
                          <span className='ml-2'>No</span>
                        </label>
                      </div>

                      {formData.isCryptoAssetNameSame === 'No' && (
                        <div className='mt-4'>
                          <label
                            htmlFor='cryptoAssetName'
                            className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                          >
                            Crypto asset name
                          </label>
                          <input
                            type='text'
                            id='cryptoAssetName'
                            value={formData.cryptoAssetName}
                            onChange={handleInputChange}
                            className={getInputClassName(
                              formData.cryptoAssetName
                            )}
                            placeholder='Enter crypto asset name'
                            required={formData.isCryptoAssetNameSame === 'No'}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {formData.tokenClassification === 'ART' && (
                    <div className='mb-4'>
                      <label
                        htmlFor='cryptoAssetName'
                        className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                      >
                        Asset-referenced token name
                      </label>
                      <input
                        type='text'
                        id='cryptoAssetName'
                        value={formData.cryptoAssetName}
                        onChange={handleInputChange}
                        className={getInputClassName(formData.cryptoAssetName)}
                        placeholder='Enter asset-referenced token name'
                        required
                      />
                    </div>
                  )}

                  {formData.tokenClassification === 'EMT' && (
                    <>
                      <div className='mb-4'>
                        <label
                          htmlFor='cryptoAssetName'
                          className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                        >
                          E-money token name
                        </label>
                        <input
                          type='text'
                          id='cryptoAssetName'
                          value={formData.cryptoAssetName}
                          onChange={handleInputChange}
                          className={getInputClassName(
                            formData.cryptoAssetName
                          )}
                          placeholder='Enter e-money token name'
                          required
                        />
                      </div>
                    </>
                  )}

                  {(formData.tokenClassification === 'OTH_UTILITY' ||
                    formData.tokenClassification === 'OTH_NON_UTILITY') && (
                    <div className='mb-4'>
                      <label
                        htmlFor='isCryptoProjectNameSame'
                        className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                      >
                        Is the crypto asset project name the same as the crypto
                        asset, or the offeror&apos;s or issuer&apos;s name?
                      </label>
                      <div id='isCryptoProjectNameSame' className='flex gap-5'>
                        <label className='inline-flex items-center'>
                          <input
                            type='radio'
                            name='isCryptoProjectNameSame'
                            checked={formData.isCryptoProjectNameSame === 'Yes'}
                            onChange={() =>
                              handleRadioChange(
                                'isCryptoProjectNameSame',
                                'Yes'
                              )
                            }
                            className='form-radio h-5 w-5 text-blue-600'
                          />
                          <span className='ml-2'>Yes</span>
                        </label>
                        <label className='inline-flex items-center'>
                          <input
                            type='radio'
                            name='isCryptoProjectNameSame'
                            checked={formData.isCryptoProjectNameSame === 'No'}
                            onChange={() =>
                              handleRadioChange('isCryptoProjectNameSame', 'No')
                            }
                            className='form-radio h-5 w-5 text-blue-600'
                          />
                          <span className='ml-2'>No</span>
                        </label>
                      </div>

                      {formData.isCryptoProjectNameSame === 'Yes' && (
                        <div className='mt-4'>
                          <label
                            htmlFor='cryptoProjectNameSameAs'
                            className='block text-black-600 text-[14px] leading-[17px] mb-1'
                          >
                            Same as:
                          </label>
                          <select
                            id='cryptoProjectNameSameAs'
                            value={formData.cryptoProjectNameSameAs}
                            onChange={handleInputChange}
                            className={getSelectClassName(
                              formData.cryptoProjectNameSameAs
                            )}
                            required={
                              formData.isCryptoProjectNameSame === 'Yes'
                            }
                          >
                            <option value='' disabled className='text-gray-400'>
                              -- Select Reference --
                            </option>
                            <option value='crypto'>
                              Same as crypto asset name
                            </option>
                            <option value='offeror'>
                              Same as the name of the offeror or person seeking
                              admission
                            </option>
                          </select>
                        </div>
                      )}

                      {formData.isCryptoProjectNameSame === 'No' && (
                        <div className='mt-4'>
                          <label
                            htmlFor='cryptoProjectName'
                            className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                          >
                            Crypto asset project name
                          </label>
                          <input
                            type='text'
                            id='cryptoProjectName'
                            value={formData.cryptoProjectName}
                            onChange={handleInputChange}
                            className={getInputClassName(
                              formData.cryptoProjectName
                            )}
                            placeholder='Enter crypto asset project name'
                            required={formData.isCryptoProjectNameSame === 'No'}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {(formData.tokenClassification === 'OTH_UTILITY' ||
                    formData.tokenClassification === 'OTH_NON_UTILITY') && (
                    <>
                      <div className='mb-4'>
                        <label
                          htmlFor='issuerType'
                          className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                        >
                          Who is the issuer?
                        </label>
                        <select
                          id='issuerType'
                          value={formData.issuerType}
                          onChange={handleInputChange}
                          className={getSelectClassName(formData.issuerType)}
                        >
                          <option value='' disabled className='text-gray-400'>
                            -- Select Issuer Type --
                          </option>
                          <option value='FALSE'>
                            Same as offeror or person seeking admission
                          </option>
                          <option value='TRUE'>Different entity</option>
                        </select>

                        {formData.issuerType === 'TRUE' && (
                          <div className='mt-4 space-y-4'>
                            <LEILookup
                              onLeiData={handleIssuerLeiData}
                              formData={{
                                ...formData,
                                leiNumber: formData.issuerLeiNumber,
                              }}
                              setFormData={updateFn => {
                                setFormData(prev => {
                                  const updated = updateFn(prev);
                                  return {
                                    ...updated,
                                    issuerLeiNumber: updated.leiNumber,
                                  };
                                });
                              }}
                              getInputClassName={getInputClassName}
                              title='Issuer LEI Lookup'
                              description='Enter LEI for the issuer entity'
                              entityType='issuer'
                              onClearLei={handleClearLei}
                            />

                            <div>
                              <label
                                htmlFor='issuerName'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Write name
                              </label>
                              <input
                                type='text'
                                id='issuerName'
                                value={formData.issuerName}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.issuerName
                                )}
                                placeholder='Enter name'
                                required={formData.issuerType === 'TRUE'}
                              />
                            </div>

                            <div>
                              <label
                                htmlFor='issuerCompaniesHouseLink'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Companies registration link
                              </label>
                              <input
                                type='text'
                                id='issuerCompaniesHouseLink'
                                value={formData.issuerCompaniesHouseLink}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.issuerCompaniesHouseLink,
                                  validLeiData.issuer
                                )}
                                placeholder={
                                  validLeiData.issuer
                                    ? 'Disabled - LEI data available'
                                    : 'Enter Companies registration link'
                                }
                                disabled={validLeiData.issuer}
                              />
                              {validLeiData.issuer && (
                                <p className='text-xs text-gray-500 mt-1'>
                                  Field disabled - company registration
                                  information available from LEI lookup
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor='issuerPhone'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Contact phone
                              </label>
                              <input
                                type='text'
                                id='issuerPhone'
                                value={formData.issuerPhone}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.issuerPhone
                                )}
                                placeholder='Enter contact phone number'
                                required
                              />
                            </div>

                            <div>
                              <label
                                htmlFor='issuerEmail'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Contact email address
                              </label>
                              <input
                                type='email'
                                id='issuerEmail'
                                value={formData.issuerEmail}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.issuerEmail
                                )}
                                placeholder='Enter contact email address'
                                required
                              />
                            </div>

                            <div>
                              <label
                                htmlFor='issuerLegalForm'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Legal form
                              </label>
                              <input
                                type='text'
                                id='issuerLegalForm'
                                value={formData.issuerLegalForm}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.issuerLegalForm,
                                  validLeiData.issuer
                                )}
                                placeholder={
                                  validLeiData.issuer
                                    ? 'Disabled - LEI data available'
                                    : 'Enter legal form'
                                }
                                disabled={validLeiData.issuer}
                              />
                              {validLeiData.issuer && (
                                <p className='text-xs text-gray-500 mt-1'>
                                  Field disabled - legal form information
                                  available from LEI lookup
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor='issuerRegisteredAddress'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Registered address
                              </label>
                              <textarea
                                id='issuerRegisteredAddress'
                                value={formData.issuerRegisteredAddress}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.issuerRegisteredAddress,
                                  validLeiData.issuer
                                )}
                                placeholder={
                                  validLeiData.issuer
                                    ? 'Disabled - LEI data available'
                                    : 'Enter registered address'
                                }
                                rows={3}
                                disabled={validLeiData.issuer}
                              />
                              {validLeiData.issuer && (
                                <p className='text-xs text-gray-500 mt-1'>
                                  Field disabled - registered address
                                  information available from LEI lookup
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor='issuerHeadOffice'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Head office
                              </label>
                              <textarea
                                id='issuerHeadOffice'
                                value={formData.issuerHeadOffice}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.issuerHeadOffice,
                                  validLeiData.issuer
                                )}
                                placeholder={
                                  validLeiData.issuer
                                    ? 'Disabled - LEI data available'
                                    : 'Enter head office address'
                                }
                                rows={3}
                                disabled={validLeiData.issuer}
                              />
                              {validLeiData.issuer && (
                                <p className='text-xs text-gray-500 mt-1'>
                                  Field disabled - head office information
                                  available from LEI lookup
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor='issuerRegistrationDate'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Registration date
                              </label>
                              <input
                                type='date'
                                id='issuerRegistrationDate'
                                value={formData.issuerRegistrationDate}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.issuerRegistrationDate,
                                  validLeiData.issuer
                                )}
                                placeholder={
                                  validLeiData.issuer
                                    ? 'Disabled - LEI data available'
                                    : 'Enter registration date'
                                }
                                disabled={validLeiData.issuer}
                              />
                              {validLeiData.issuer && (
                                <p className='text-xs text-gray-500 mt-1'>
                                  Field disabled - registration date information
                                  available from LEI lookup
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor='issuerParentCompanyName'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Name of the parent company
                              </label>
                              <input
                                type='text'
                                id='issuerParentCompanyName'
                                value={formData.issuerParentCompanyName}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.issuerParentCompanyName
                                )}
                                placeholder='If there is no parent company, leave this blank'
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className='mb-4'>
                        <label
                          htmlFor='operatorType'
                          className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                        >
                          Who is the operator?
                        </label>
                        <select
                          id='operatorType'
                          value={formData.operatorType}
                          onChange={handleInputChange}
                          className={getSelectClassName(formData.operatorType)}
                        >
                          <option value='' disabled className='text-gray-400'>
                            -- Select Operator Type --
                          </option>
                          <option value='SameAsIssuer'>Same as issuer</option>
                          <option value='SameAsOfferor'>Same as offeror</option>
                          <option value='Different'>Different entity</option>
                          <option value='N/A'>N/A</option>
                        </select>

                        {/* COMMENTED OUT: Operator Details section - not needed per business logic
                            - If operator = Different → Part C is N/A (no data needed)
                            - If operator = SameAsOfferor → Part C copies from Part A (offeror data)
                            - If operator = SameAsIssuer → Part C copies from Part B (issuer data)
                        */}
                        {/* {formData.operatorType === 'Different' && (
                          <div className='mt-4 space-y-4'>
                            <LEILookup
                              onLeiData={handleOperatorLeiData}
                              formData={{
                                ...formData,
                                leiNumber: formData.operatorLeiNumber,
                              }}
                              setFormData={updateFn => {
                                setFormData(prev => {
                                  const updated = updateFn(prev);
                                  return {
                                    ...updated,
                                    operatorLeiNumber: updated.leiNumber,
                                  };
                                });
                              }}
                              getInputClassName={getInputClassName}
                              title='Operator LEI Lookup'
                              description='Enter LEI for the operator entity'
                              entityType='operator'
                              onClearLei={handleClearLei}
                            />

                            <div>
                              <label
                                htmlFor='operatorName'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Write name
                              </label>
                              <input
                                type='text'
                                id='operatorName'
                                value={formData.operatorName}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.operatorName
                                )}
                                placeholder='Enter name'
                                required={formData.operatorType === 'Different'}
                              />
                            </div>

                            <div>
                              <label
                                htmlFor='operatorCompaniesHouseLink'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Companies registration link
                              </label>
                              <input
                                type='text'
                                id='operatorCompaniesHouseLink'
                                value={formData.operatorCompaniesHouseLink}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.operatorCompaniesHouseLink,
                                  validLeiData.operator
                                )}
                                placeholder={
                                  validLeiData.operator
                                    ? 'Disabled - LEI data available'
                                    : 'Enter Companies registration link'
                                }
                                disabled={validLeiData.operator}
                              />
                              {validLeiData.operator && (
                                <p className='text-xs text-gray-500 mt-1'>
                                  Field disabled - company registration
                                  information available from LEI lookup
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor='operatorPhone'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Contact phone
                              </label>
                              <input
                                type='text'
                                id='operatorPhone'
                                value={formData.operatorPhone}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.operatorPhone
                                )}
                                placeholder='Enter contact phone number'
                                required
                              />
                            </div>

                            <div>
                              <label
                                htmlFor='operatorEmail'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Contact email address
                              </label>
                              <input
                                type='email'
                                id='operatorEmail'
                                value={formData.operatorEmail}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.operatorEmail
                                )}
                                placeholder='Enter contact email address'
                                required
                              />
                            </div>

                            <div>
                              <label
                                htmlFor='operatorLegalForm'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Legal form
                              </label>
                              <input
                                type='text'
                                id='operatorLegalForm'
                                value={formData.operatorLegalForm}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.operatorLegalForm,
                                  validLeiData.operator
                                )}
                                placeholder={
                                  validLeiData.operator
                                    ? 'Disabled - LEI data available'
                                    : 'Enter legal form'
                                }
                                disabled={validLeiData.operator}
                              />
                              {validLeiData.operator && (
                                <p className='text-xs text-gray-500 mt-1'>
                                  Field disabled - legal form information
                                  available from LEI lookup
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor='operatorRegisteredAddress'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Registered address
                              </label>
                              <textarea
                                id='operatorRegisteredAddress'
                                value={formData.operatorRegisteredAddress}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.operatorRegisteredAddress,
                                  validLeiData.operator
                                )}
                                placeholder={
                                  validLeiData.operator
                                    ? 'Disabled - LEI data available'
                                    : 'Enter registered address'
                                }
                                rows={3}
                                disabled={validLeiData.operator}
                              />
                              {validLeiData.operator && (
                                <p className='text-xs text-gray-500 mt-1'>
                                  Field disabled - registered address
                                  information available from LEI lookup
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor='operatorHeadOffice'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Head office
                              </label>
                              <textarea
                                id='operatorHeadOffice'
                                value={formData.operatorHeadOffice}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.operatorHeadOffice,
                                  validLeiData.operator
                                )}
                                placeholder={
                                  validLeiData.operator
                                    ? 'Disabled - LEI data available'
                                    : 'Enter head office address'
                                }
                                rows={3}
                                disabled={validLeiData.operator}
                              />
                              {validLeiData.operator && (
                                <p className='text-xs text-gray-500 mt-1'>
                                  Field disabled - head office information
                                  available from LEI lookup
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor='operatorRegistrationDate'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Registration date
                              </label>
                              <input
                                type='date'
                                id='operatorRegistrationDate'
                                value={formData.operatorRegistrationDate}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.operatorRegistrationDate,
                                  validLeiData.operator
                                )}
                                placeholder={
                                  validLeiData.operator
                                    ? 'Disabled - LEI data available'
                                    : 'Enter registration date'
                                }
                                disabled={validLeiData.operator}
                              />
                              {validLeiData.operator && (
                                <p className='text-xs text-gray-500 mt-1'>
                                  Field disabled - registration date information
                                  available from LEI lookup
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor='operatorParentCompanyName'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Name of the parent company
                              </label>
                              <input
                                type='text'
                                id='operatorParentCompanyName'
                                value={formData.operatorParentCompanyName}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.operatorParentCompanyName
                                )}
                                placeholder='If there is no parent company, leave this blank'
                              />
                            </div>
                          </div>
                        )} */}
                      </div>
                    </>
                  )}

                  {(formData.tokenClassification === 'ART' ||
                    formData.tokenClassification === 'EMT') && (
                    <div className='mb-4'>
                      <label
                        htmlFor='issuer-information'
                        className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                      >
                        Issuer Information
                      </label>

                      <LEILookup
                        onLeiData={handleIssuerLeiData}
                        formData={{
                          ...formData,
                          leiNumber: formData.issuerLeiNumber,
                        }}
                        setFormData={updateFn => {
                          setFormData(prev => {
                            const updated = updateFn(prev);
                            return {
                              ...updated,
                              issuerLeiNumber: updated.leiNumber,
                            };
                          });
                        }}
                        getInputClassName={getInputClassName}
                        title='Issuer LEI Lookup'
                        description='Enter LEI for the issuer'
                        entityType='issuer'
                        onClearLei={handleClearLei}
                      />

                      <div id='issuer-information' className='mt-4 space-y-4'>
                        <div>
                          <label
                            htmlFor='issuerName'
                            className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                          >
                            Statutory name
                          </label>
                          <input
                            type='text'
                            id='issuerName'
                            value={formData.issuerName}
                            onChange={handleInputChange}
                            className={getInputClassName(formData.issuerName)}
                            placeholder='Enter statutory name'
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor='issuerLegalForm'
                            className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                          >
                            Legal form
                          </label>
                          <input
                            type='text'
                            id='issuerLegalForm'
                            value={formData.issuerLegalForm}
                            onChange={handleInputChange}
                            className={getInputClassName(
                              formData.issuerLegalForm,
                              validLeiData.issuer
                            )}
                            placeholder={
                              validLeiData.issuer
                                ? 'Disabled - LEI data available'
                                : 'Enter legal form'
                            }
                            disabled={validLeiData.issuer}
                          />
                          {validLeiData.issuer && (
                            <p className='text-xs text-gray-500 mt-1'>
                              Field disabled - legal form information available
                              from LEI lookup
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor='issuerRegisteredAddress'
                            className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                          >
                            Registered address
                          </label>
                          <textarea
                            id='issuerRegisteredAddress'
                            value={formData.issuerRegisteredAddress}
                            onChange={handleInputChange}
                            className={getInputClassName(
                              formData.issuerRegisteredAddress,
                              validLeiData.issuer
                            )}
                            placeholder={
                              validLeiData.issuer
                                ? 'Disabled - LEI data available'
                                : 'Enter registered address'
                            }
                            rows={3}
                            disabled={validLeiData.issuer}
                          />
                          {validLeiData.issuer && (
                            <p className='text-xs text-gray-500 mt-1'>
                              Field disabled - registered address information
                              available from LEI lookup
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor='issuerHeadOffice'
                            className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                          >
                            Head office
                          </label>
                          <textarea
                            id='issuerHeadOffice'
                            value={formData.issuerHeadOffice}
                            onChange={handleInputChange}
                            className={getInputClassName(
                              formData.issuerHeadOffice,
                              validLeiData.issuer
                            )}
                            placeholder={
                              validLeiData.issuer
                                ? 'Disabled - LEI data available'
                                : 'Enter head office address'
                            }
                            rows={3}
                            disabled={validLeiData.issuer}
                          />
                          {validLeiData.issuer && (
                            <p className='text-xs text-gray-500 mt-1'>
                              Field disabled - head office information available
                              from LEI lookup
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor='issuerRegistrationDate'
                            className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                          >
                            Registration date
                          </label>
                          <input
                            type='date'
                            id='issuerRegistrationDate'
                            value={formData.issuerRegistrationDate}
                            onChange={handleInputChange}
                            className={getInputClassName(
                              formData.issuerRegistrationDate,
                              validLeiData.issuer
                            )}
                            placeholder={
                              validLeiData.issuer
                                ? 'Disabled - LEI data available'
                                : 'Enter registration date'
                            }
                            disabled={validLeiData.issuer}
                          />
                          {validLeiData.issuer && (
                            <p className='text-xs text-gray-500 mt-1'>
                              Field disabled - registration date information
                              available from LEI lookup
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor='issuerParentCompanyName'
                            className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                          >
                            Name of the parent company
                          </label>
                          <input
                            type='text'
                            id='issuerParentCompanyName'
                            value={formData.issuerParentCompanyName}
                            onChange={handleInputChange}
                            className={getInputClassName(
                              formData.issuerParentCompanyName
                            )}
                            placeholder='If there is no parent company, leave this blank'
                          />
                        </div>

                        {formData.tokenClassification !== 'ART' && (
                          <>
                            <div>
                              <label
                                htmlFor='issuerPhone'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Contact telephone number
                              </label>
                              <input
                                type='text'
                                id='issuerPhone'
                                value={formData.issuerPhone}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.issuerPhone
                                )}
                                placeholder='Enter contact telephone number'
                                required
                              />
                            </div>

                            <div>
                              <label
                                htmlFor='issuerEmail'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                E-mail address
                              </label>
                              <input
                                type='email'
                                id='issuerEmail'
                                value={formData.issuerEmail}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.issuerEmail
                                )}
                                placeholder='Enter e-mail address'
                                required
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <label
                            htmlFor='issuerFinancialCondition'
                            className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                          >
                            <span>{getFinancialConditionLabel()}</span>
                            <div className='tooltip'>
                              <span className='question-mark'>?</span>
                              <div className='tooltip-content'>
                                <strong>Financial Condition Guidelines:</strong>
                                <br />
                                <br />
                                • How has your business developed each year (and
                                any interim periods) since your registration?
                                <br />
                                <br />
                                • Can you explain any unusual or infrequent
                                events, or new developments, that significantly
                                affected your income or operations?
                                <br />
                                <br />
                                • What are your available capital resources,
                                both short-term and long-term?
                                <br />
                                <br />
                                • Can you describe your cash flows since
                                registration?
                                <br />
                                <br />• Where financial statements exist, can
                                you reference and explain key figures from those
                                statements?
                              </div>
                            </div>
                          </label>
                          <textarea
                            id='issuerFinancialCondition'
                            value={formData.issuerFinancialCondition}
                            onChange={handleInputChange}
                            className={getInputClassName(
                              formData.issuerFinancialCondition
                            )}
                            placeholder='Describe the financial condition'
                            rows={4}
                            required
                          />
                        </div>

                        {formData.tokenClassification === 'ART' && (
                          <>
                            <div>
                              <label
                                htmlFor='keyDecisionMakers'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Who makes the key decisions for the project
                                (e.g. protocol changes, reserve management), and
                                how are those decisions made?
                              </label>
                              <textarea
                                id='keyDecisionMakers'
                                value={formData.keyDecisionMakers}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.keyDecisionMakers
                                )}
                                placeholder='Describe who makes key decisions and how they are made'
                                rows={4}
                                required
                              />
                            </div>

                            <div>
                              <label
                                htmlFor='formalStructures'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                What formal structures (e.g. boards, committees,
                                governance bodies) are in place to oversee the
                                project?
                              </label>
                              <textarea
                                id='formalStructures'
                                value={formData.formalStructures}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.formalStructures
                                )}
                                placeholder='Describe the formal structures in place for project oversight'
                                rows={4}
                                required
                              />
                            </div>

                            <div>
                              <label
                                htmlFor='thirdPartyReserveManagement'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Are any third-party entities involved in
                                managing or operating the reserve assets? If
                                yes, who are they and what are their
                                responsibilities?
                              </label>
                              <textarea
                                id='thirdPartyReserveManagement'
                                value={formData.thirdPartyReserveManagement}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.thirdPartyReserveManagement
                                )}
                                placeholder="Describe any third-party entities involved in reserve asset management and their responsibilities, or enter 'No' if none"
                                rows={4}
                                required
                              />
                            </div>

                            <div>
                              <label
                                htmlFor='thirdPartyInvestmentAuth'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Are any third parties authorised to invest the
                                reserve assets? If so, what are their investment
                                powers, limitations, and reporting obligations?
                              </label>
                              <textarea
                                id='thirdPartyInvestmentAuth'
                                value={formData.thirdPartyInvestmentAuth}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.thirdPartyInvestmentAuth
                                )}
                                placeholder="Describe any third parties authorized to invest reserve assets, their powers, limitations, and reporting obligations, or enter 'No' if none"
                                rows={4}
                                required
                              />
                            </div>

                            <div>
                              <label
                                htmlFor='thirdPartyDistribution'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Are third parties involved in the distribution
                                or sale of the asset-referenced token to the
                                public? If yes, what role do they play and how
                                are they held accountable?
                              </label>
                              <textarea
                                id='thirdPartyDistribution'
                                value={formData.thirdPartyDistribution}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.thirdPartyDistribution
                                )}
                                placeholder="Describe any third parties involved in distribution/sale, their role, and accountability measures, or enter 'No' if none"
                                rows={4}
                                required
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* ART-specific qualification questions after issuer information */}
                      {formData.tokenClassification === 'ART' && (
                        <>
                          <div className='mb-4'>
                            <label
                              htmlFor='artMarketValueBelow5M'
                              className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                            >
                              Has the market value of the token (including other
                              versions of the same token issued by &quot;linked
                              issuers&quot;) averaged below 5 million EUR over
                              the past 12 months?
                            </label>
                            <div
                              id='artMarketValueBelow5M'
                              className='flex gap-5'
                            >
                              <label className='inline-flex items-center'>
                                <input
                                  type='radio'
                                  name='artMarketValueBelow5M'
                                  checked={
                                    formData.artMarketValueBelow5M === 'Yes'
                                  }
                                  onChange={() =>
                                    handleRadioChange(
                                      'artMarketValueBelow5M',
                                      'Yes'
                                    )
                                  }
                                  className='form-radio h-5 w-5 text-blue-600'
                                />
                                <span className='ml-2'>Yes</span>
                              </label>
                              <label className='inline-flex items-center'>
                                <input
                                  type='radio'
                                  name='artMarketValueBelow5M'
                                  checked={
                                    formData.artMarketValueBelow5M === 'No'
                                  }
                                  onChange={() =>
                                    handleRadioChange(
                                      'artMarketValueBelow5M',
                                      'No'
                                    )
                                  }
                                  className='form-radio h-5 w-5 text-blue-600'
                                />
                                <span className='ml-2'>No</span>
                              </label>
                            </div>
                          </div>

                          <div className='mb-4'>
                            <label
                              htmlFor='artIssuerCreditInstitution'
                              className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                            >
                              Is the issuer a credit institution?
                            </label>
                            <div
                              id='artIssuerCreditInstitution'
                              className='flex gap-5'
                            >
                              <label className='inline-flex items-center'>
                                <input
                                  type='radio'
                                  name='artIssuerCreditInstitution'
                                  checked={
                                    formData.artIssuerCreditInstitution ===
                                    'Yes'
                                  }
                                  onChange={() =>
                                    handleRadioChange(
                                      'artIssuerCreditInstitution',
                                      'Yes'
                                    )
                                  }
                                  className='form-radio h-5 w-5 text-blue-600'
                                />
                                <span className='ml-2'>Yes</span>
                              </label>
                              <label className='inline-flex items-center'>
                                <input
                                  type='radio'
                                  name='artIssuerCreditInstitution'
                                  checked={
                                    formData.artIssuerCreditInstitution === 'No'
                                  }
                                  onChange={() =>
                                    handleRadioChange(
                                      'artIssuerCreditInstitution',
                                      'No'
                                    )
                                  }
                                  className='form-radio h-5 w-5 text-blue-600'
                                />
                                <span className='ml-2'>No</span>
                              </label>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className='mb-4'>
                    <label
                      htmlFor='whitepaperSubmitter'
                      className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                    >
                      Who will submit this whitepaper to the authorities?
                    </label>
                    <select
                      id='whitepaperSubmitter'
                      value={formData.whitepaperSubmitter}
                      onChange={handleInputChange}
                      className={getSelectClassName(
                        formData.whitepaperSubmitter
                      )}
                      required
                    >
                      <option value='' disabled className='text-gray-400'>
                        -- Select Submitter --
                      </option>
                      <option value='Issuer'>Issuer</option>
                      <option value='Operator'>Operator</option>
                      <option value='Person'>
                        Offeror or person seeking admission to trading
                      </option>
                    </select>
                  </div>

                  <div className='mb-4'>
                    <label
                      htmlFor='cryptoAssetSituation'
                      className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                    >
                      What describes this crypto-asset&apos;s situation best?
                    </label>
                    <select
                      id='cryptoAssetSituation'
                      value={formData.cryptoAssetSituation}
                      onChange={handleInputChange}
                      className={getSelectClassName(
                        formData.cryptoAssetSituation
                      )}
                      required
                    >
                      <option value='' disabled className='text-gray-400'>
                        -- Select Situation --
                      </option>
                      <option value='admission'>
                        Seeking admission to trading
                      </option>
                      <option value='offer'>Seeking offer to the public</option>
                      <option value='both'>Seeking both</option>
                      <option value='compliance'>
                        Seeking compliance for an asset that has been trading
                        before MiCA
                      </option>
                    </select>
                  </div>

                  {(formData.cryptoAssetSituation === 'offer' ||
                    formData.cryptoAssetSituation === 'admission' ||
                    formData.cryptoAssetSituation === 'both') && (
                    <>
                      <div className='mb-4'>
                        <label
                          htmlFor='prospectiveHolders'
                          className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                        >
                          Prospective holders targeted by the offer or admission
                          to trading:
                        </label>
                        <select
                          id='prospectiveHolders'
                          value={formData.prospectiveHolders}
                          onChange={handleInputChange}
                          className={getSelectClassName(
                            formData.prospectiveHolders
                          )}
                          required
                        >
                          <option value='' disabled className='text-gray-400'>
                            -- Select Target Holders --
                          </option>
                          <option value='RETL'>Retail investors</option>
                          <option value='PROF'>Professional investors</option>
                          <option value='ALL'>All</option>
                        </select>
                      </div>

                      <div className='mb-4'>
                        <label
                          htmlFor='reasonForOffer'
                          className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                        >
                          Reason for the offer or admission to trading:
                        </label>
                        <textarea
                          id='reasonForOffer'
                          value={formData.reasonForOffer}
                          onChange={handleInputChange}
                          className={getInputClassName(formData.reasonForOffer)}
                          placeholder='Please explain the reason for seeking offer or admission to trading'
                          rows={4}
                          required
                        />
                      </div>
                    </>
                  )}

                  {formData.tokenClassification !== 'ART' && (
                    <div className='mb-4'>
                      <label
                        htmlFor='responseTime'
                        className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                      >
                        How many days does it take to receive a response? (in
                        days)?
                      </label>
                      <input
                        type='number'
                        id='responseTime'
                        value={formData.responseTime}
                        onChange={handleInputChange}
                        className={getInputClassName(formData.responseTime)}
                        placeholder='Response time in days'
                        required
                        max='999'
                        min='1'
                        maxLength='3'
                        onInput={e => {
                          if (e.target.value > 999) e.target.value = 999;
                          if (e.target.value < 0) e.target.value = 1;
                        }}
                      />
                    </div>
                  )}

                  <div className='mb-4'>
                    <label
                      htmlFor='publicationDate'
                      className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                    >
                      Effective or intended publication date of the white paper
                      or of the modified white paper
                    </label>
                    <input
                      type='date'
                      id='publicationDate'
                      value={formData.publicationDate}
                      onChange={handleInputChange}
                      className={getInputClassName(formData.publicationDate)}
                      placeholder='YYYY-MM-DD'
                      required
                    />
                  </div>

                  <div className='mb-4'>
                    <label
                      htmlFor='submissionType'
                      className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                    >
                      What is the Type of submission?
                    </label>
                    <select
                      id='submissionType'
                      value={formData.submissionType}
                      onChange={handleInputChange}
                      className={getSelectClassName(formData.submissionType)}
                      required
                    >
                      <option value='' disabled className='text-gray-400'>
                        -- Select Submission Type --
                      </option>
                      <option value='NEWT'>New</option>
                      <option value='MODI'>Modify</option>
                      <option value='EROR'>Error</option>
                      <option value='CORR'>Correction</option>
                    </select>
                  </div>

                  <div className='mb-4'>
                    <label
                      htmlFor='keyInformation'
                      className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                    >
                      Key information about the offer and/or admission to
                      trading
                    </label>
                    <textarea
                      id='keyInformation'
                      value={formData.keyInformation}
                      onChange={handleInputChange}
                      className={getInputClassName(formData.keyInformation)}
                      placeholder='Provide key information about the offer and/or admission to trading'
                      rows={4}
                      required
                    />
                  </div>

                  {(formData.tokenClassification === 'OTH_UTILITY' ||
                    formData.tokenClassification === 'OTH_NON_UTILITY' ||
                    formData.tokenClassification === 'ART') && (
                    <div className='mb-4'>
                      <label
                        htmlFor='futureCryptoOffers'
                        className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                      >
                        Are any future public offers of crypto-assets planned by
                        the issuer?
                      </label>
                      <div id='futureCryptoOffers' className='flex gap-5'>
                        <label className='inline-flex items-center'>
                          <input
                            type='radio'
                            name='futureCryptoOffers'
                            checked={formData.futureCryptoOffers === 'Yes'}
                            onChange={() =>
                              handleRadioChange('futureCryptoOffers', 'Yes')
                            }
                            className='form-radio h-5 w-5 text-blue-600'
                          />
                          <span className='ml-2'>Yes</span>
                        </label>
                        <label className='inline-flex items-center'>
                          <input
                            type='radio'
                            name='futureCryptoOffers'
                            checked={formData.futureCryptoOffers === 'No'}
                            onChange={() =>
                              handleRadioChange('futureCryptoOffers', 'No')
                            }
                            className='form-radio h-5 w-5 text-blue-600'
                          />
                          <span className='ml-2'>No</span>
                        </label>
                      </div>

                      {formData.futureCryptoOffers === 'Yes' && (
                        <div className='mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50'>
                          <h6 className='font-semibold text-gray-700 mb-4'>
                            Future Crypto Offer Details
                          </h6>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                            <div>
                              <label
                                htmlFor='minTargetSubscription'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Minimum target subscription goals
                              </label>
                              <input
                                type='text'
                                id='minTargetSubscription'
                                value={formData.minTargetSubscription}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.minTargetSubscription
                                )}
                                placeholder='Enter minimum target'
                                required={formData.futureCryptoOffers === 'Yes'}
                              />
                            </div>

                            <div>
                              <label
                                htmlFor='maxTargetSubscription'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Maximum target subscription goals
                              </label>
                              <input
                                type='text'
                                id='maxTargetSubscription'
                                value={formData.maxTargetSubscription}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.maxTargetSubscription
                                )}
                                placeholder='Enter maximum target'
                                required={formData.futureCryptoOffers === 'Yes'}
                              />
                            </div>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                            <div>
                              <label
                                htmlFor='issuePrice'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Issue price of the crypto-asset
                              </label>
                              <input
                                type='text'
                                id='issuePrice'
                                value={formData.issuePrice}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.issuePrice
                                )}
                                placeholder='Enter issue price'
                                required={formData.futureCryptoOffers === 'Yes'}
                              />
                            </div>

                            <div>
                              <label
                                htmlFor='subscriptionFees'
                                className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                              >
                                Subscription fees
                              </label>
                              <input
                                type='text'
                                id='subscriptionFees'
                                value={formData.subscriptionFees}
                                onChange={handleInputChange}
                                className={getInputClassName(
                                  formData.subscriptionFees
                                )}
                                placeholder='Enter subscription fees'
                                required={formData.futureCryptoOffers === 'Yes'}
                              />
                            </div>
                          </div>

                          <div className='mb-4'>
                            <label
                              htmlFor='numberOfCryptoAssets'
                              className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                            >
                              How many crypto-assets will be offered?
                            </label>
                            <input
                              type='number'
                              id='numberOfCryptoAssets'
                              value={formData.numberOfCryptoAssets}
                              onChange={handleInputChange}
                              className={getInputClassName(
                                formData.numberOfCryptoAssets
                              )}
                              placeholder='Enter number of crypto-assets'
                              required={formData.futureCryptoOffers === 'Yes'}
                              min='1'
                            />
                          </div>

                          <div className='mb-4'>
                            <label
                              htmlFor='offerTargetAudience'
                              className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                            >
                              Who will the offer be made to? (e.g. retail
                              investors, professional investors, current
                              holders, etc)
                            </label>
                            <input
                              type='text'
                              id='offerTargetAudience'
                              value={formData.offerTargetAudience}
                              onChange={handleInputChange}
                              className={getInputClassName(
                                formData.offerTargetAudience
                              )}
                              placeholder='e.g. retail investors, professional investors, current holders, etc.'
                              required={formData.futureCryptoOffers === 'Yes'}
                            />
                          </div>

                          <div className='mb-4'>
                            <label
                              htmlFor='offerConditionsRestrictions'
                              className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                            >
                              Will any conditions or restrictions attach to the
                              offer?
                            </label>
                            <textarea
                              id='offerConditionsRestrictions'
                              value={formData.offerConditionsRestrictions}
                              onChange={handleInputChange}
                              className={getInputClassName(
                                formData.offerConditionsRestrictions
                              )}
                              placeholder="Describe any conditions or restrictions, or enter 'None' if no restrictions apply"
                              rows={3}
                              required={formData.futureCryptoOffers === 'Yes'}
                            />
                          </div>

                          <div className='mb-4'>
                            <label
                              htmlFor='isPhasedOffer'
                              className='block text-gray-600 text-[14px] leading-[17px] mb-2'
                            >
                              Will the offer be phased (e.g. discounts for early
                              purchasers)?
                            </label>
                            <div id='isPhasedOffer' className='flex gap-5'>
                              <label className='inline-flex items-center'>
                                <input
                                  type='radio'
                                  name='isPhasedOffer'
                                  checked={formData.isPhasedOffer === 'Yes'}
                                  onChange={() =>
                                    handleRadioChange('isPhasedOffer', 'Yes')
                                  }
                                  className='form-radio h-4 w-4 text-blue-600'
                                />
                                <span className='ml-2 text-sm'>Yes</span>
                              </label>
                              <label className='inline-flex items-center'>
                                <input
                                  type='radio'
                                  name='isPhasedOffer'
                                  checked={formData.isPhasedOffer === 'No'}
                                  onChange={() =>
                                    handleRadioChange('isPhasedOffer', 'No')
                                  }
                                  className='form-radio h-4 w-4 text-blue-600'
                                />
                                <span className='ml-2 text-sm'>No</span>
                              </label>
                            </div>
                          </div>

                          <div className='mb-4'>
                            <label
                              htmlFor='caspInCharge'
                              className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                            >
                              Who is the CASP in charge of placing the
                              crypto-assets?
                            </label>
                            <input
                              type='text'
                              id='caspInCharge'
                              value={formData.caspInCharge}
                              onChange={handleInputChange}
                              className={getInputClassName(
                                formData.caspInCharge
                              )}
                              placeholder='Enter CASP name and details'
                              required={formData.futureCryptoOffers === 'Yes'}
                            />
                          </div>

                          <div className='mb-4'>
                            <label
                              htmlFor='offerDate'
                              className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                            >
                              When will the offer be made?
                            </label>
                            <input
                              type='date'
                              id='offerDate'
                              value={formData.offerDate}
                              onChange={handleInputChange}
                              className={getInputClassName(formData.offerDate)}
                              required={formData.futureCryptoOffers === 'Yes'}
                            />
                          </div>

                          <div className='mb-4'>
                            <label
                              htmlFor='offerJurisdictions'
                              className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                            >
                              In which jurisdictions will the offer be made?
                            </label>
                            <textarea
                              id='offerJurisdictions'
                              value={formData.offerJurisdictions}
                              onChange={handleInputChange}
                              className={getInputClassName(
                                formData.offerJurisdictions
                              )}
                              placeholder='List all jurisdictions where the offer will be made'
                              rows={2}
                              required={formData.futureCryptoOffers === 'Yes'}
                            />
                          </div>

                          <div className='mb-4'>
                            <label
                              htmlFor='plannedUseOfFunds'
                              className='block text-gray-600 text-[14px] leading-[17px] mb-1'
                            >
                              What is the planned use of collected funds?
                            </label>
                            <textarea
                              id='plannedUseOfFunds'
                              value={formData.plannedUseOfFunds}
                              onChange={handleInputChange}
                              className={getInputClassName(
                                formData.plannedUseOfFunds
                              )}
                              placeholder='Describe how the collected funds will be used'
                              rows={4}
                              required={formData.futureCryptoOffers === 'Yes'}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add the contract terms question here, just before DTI selection */}
                  {(formData.tokenClassification === 'OTH_UTILITY' ||
                    formData.tokenClassification === 'OTH_NON_UTILITY') && (
                    <>
                      <div className='mb-4'>
                        <label
                          htmlFor='hasContractTerms'
                          className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                        >
                          Is there a smart contract or legal contract other set
                          of legal terms provided by the issuer that govern how
                          token-holders may hold or use the crypto-asset tokens?
                        </label>
                        <div id='hasContractTerms' className='flex gap-5'>
                          <label className='inline-flex items-center'>
                            <input
                              type='radio'
                              name='hasContractTerms'
                              checked={formData.hasContractTerms === 'Yes'}
                              onChange={() =>
                                handleRadioChange('hasContractTerms', 'Yes')
                              }
                              className='form-radio h-5 w-5 text-blue-600'
                            />
                            <span className='ml-2'>Yes</span>
                          </label>
                          <label className='inline-flex items-center'>
                            <input
                              type='radio'
                              name='hasContractTerms'
                              checked={formData.hasContractTerms === 'No'}
                              onChange={() =>
                                handleRadioChange('hasContractTerms', 'No')
                              }
                              className='form-radio h-5 w-5 text-blue-600'
                            />
                            <span className='ml-2'>No</span>
                          </label>
                        </div>
                      </div>

                      {formData.tokenClassification === 'OTH_UTILITY' && (
                        <div className='mb-4'>
                          <label
                            htmlFor='utilityTokenDescription'
                            className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                          >
                            Description of Quality and quantity of
                            goods/services linked to utility tokens
                          </label>
                          <textarea
                            id='utilityTokenDescription'
                            value={formData.utilityTokenDescription}
                            onChange={handleInputChange}
                            className={getInputClassName(
                              formData.utilityTokenDescription
                            )}
                            placeholder='Describe the quality and quantity of goods/services that these utility tokens provide access to'
                            rows={4}
                            required
                          />
                        </div>
                      )}

                      {formData.tokenClassification === 'OTH_UTILITY' && (
                        <div className='mb-4'>
                          <label
                            htmlFor='keyFeaturesGoodsServices'
                            className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                          >
                            Key Features of Goods/Services for Utility Token
                            Projects
                          </label>
                          <textarea
                            id='keyFeaturesGoodsServices'
                            value={formData.keyFeaturesGoodsServices}
                            onChange={handleInputChange}
                            className={getInputClassName(
                              formData.keyFeaturesGoodsServices
                            )}
                            placeholder='Describe the key features of goods/services for utility token projects'
                            rows={4}
                            required
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* DTI Lookup components */}
                  <div className='mb-4'>
                    <label
                      htmlFor='selectedDTIs'
                      className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                    >
                      Select Digital Token Identifiers (DTIs):
                    </label>
                    <p className='text-gray-600 mb-3 text-sm'>
                      Search and select one or more regular DTIs (Type 0, 1, 2)
                      that apply to your crypto asset.
                    </p>
                    <div id='selectedDTIs'>
                      <DTILookup
                        onSelectWithRecord={handleDTISelection}
                        selectedDTIs={formData.selectedDTIs}
                        selectedDTIRecords={selectedDTIRecords}
                      />
                    </div>
                  </div>

                  <div className='mb-4'>
                    <label
                      htmlFor='selectedFungibleDTIs'
                      className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                    >
                      Select Functionally Fungible DTIs:
                    </label>
                    <p className='text-gray-600 mb-3 text-sm'>
                      Search and select functionally fungible DTIs (Type 3)
                      related to your crypto asset.
                    </p>
                    <div id='selectedFungibleDTIs'>
                      <DTILookup
                        onSelectWithRecord={handleFungibleDTISelection}
                        selectedDTIs={formData.selectedFungibleDTIs || []}
                        selectedDTIRecords={selectedFungibleDTIRecords}
                        mode='fungible'
                      />
                    </div>
                  </div>

                  <div className='mb-4'>
                    <label
                      htmlFor='uploadDocuments'
                      className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
                    >
                      Upload Documents:
                    </label>
                    <div id='uploadDocuments'>
                      <FileUploader
                        selectedFiles={selectedFiles}
                        setSelectedFiles={setSelectedFiles}
                      />
                    </div>
                  </div>

                  <div className='flex items-center justify-between mt-8'>
                    <Link
                      to='/'
                      className='bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300'
                    >
                      Back
                    </Link>

                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setShowWhitepapersModal(true)}
                      size='lg'
                    >
                      View Whitepapers
                    </Button>

                    <Button
                      type='submit'
                      variant='default'
                      size='lg'
                      disabled={
                        isFormLoading ||
                        isQuestionnaireLocked ||
                        isProcessingFiles
                      }
                    >
                      {isQuestionnaireLocked ? (
                        'Questionnaire Locked - Unload to Generate New'
                      ) : isProcessingFiles ? (
                        `Files Processing (${getProcessingFiles().length}) - Please Wait`
                      ) : isFormLoading ? (
                        <div className='flex items-center justify-center'>
                          <Loader />
                          <span className='ml-2'>Generating Fillouts...</span>
                        </div>
                      ) : (
                        'Generate Whitepaper'
                      )}
                    </Button>
                  </div>

                  {error && <p className='text-red-500 mt-4'>{error}</p>}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Whitepapers Modal */}
      {showWhitepapersModal && (
        <GeneratedWhitepapersModal
          isOpen={showWhitepapersModal}
          onClose={() => setShowWhitepapersModal(false)}
          onLoadWhitepaper={handleLoadWhitepaper}
        />
      )}

      {/* Generation Info Modal */}
      <GenerationInfoModal
        isOpen={showGenerationInfoModal}
        onGenerate={handleConfirmGeneration}
        onCancel={handleCancelGeneration}
      />
    </div>
  );
};

export default Questionnaire;
