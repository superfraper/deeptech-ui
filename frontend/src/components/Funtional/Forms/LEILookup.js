import { useState } from 'react';
import { useApi } from '../../../services/api';
import Loader from '../../Common/Loader';

const LEILookup = ({
  onLeiData,
  formData,
  setFormData,
  getInputClassName,
  title = 'Entity Information Lookup',
  description = 'Enter a Legal Entity Identifier (LEI) for complete company information, or an Entity Legal Form (ELF) code for legal form details.',
  entityType = 'offeror', // New prop to identify which entity type (offeror, issuer, operator)
  onClearLei, // New prop to notify parent to reset validLeiData
}) => {
  const api = useApi();
  const [leiData, setLeiData] = useState(null);
  const [leiLoading, setLeiLoading] = useState(false);
  const [leiError, setLeiError] = useState(null);
  const [showFullLeiData, setShowFullLeiData] = useState(false);

  // New state for ELF lookup
  const [searchMode, setSearchMode] = useState('lei'); // 'lei' or 'elf'
  const [elfData, setElfData] = useState(null);
  const [elfLoading, setElfLoading] = useState(false);
  const [elfError, setElfError] = useState(null);

  const handleInputChange = e => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    // Clear any previous results when input changes
    if (searchMode === 'lei') {
      setLeiData(null);
      setLeiError(null);
    } else {
      setElfData(null);
      setElfError(null);
    }
  };

  // Handler to clear all LEI-related fields for the current entity type
  const clearLEIFields = () => {
    setLeiData(null);
    setLeiError(null);
    setElfData(null);
    setElfError(null);
    setShowFullLeiData(false);
    setFormData(prev => {
      const cleared = { ...prev };
      if (entityType === 'offeror') {
        cleared.leiNumber = '';
        cleared.elfCode = '';
        cleared.offerorLeiNumber = '';
        cleared.offerorName = '';
        cleared.offerorCompaniesHouseLink = '';
        cleared.offerorPhone = '';
        cleared.offerorEmail = '';
        cleared.offerorLegalForm = '';
        cleared.offerorRegisteredAddress = '';
        cleared.offerorHeadOffice = '';
        cleared.offerorRegistrationDate = '';
        cleared.offerorParentCompanyName = '';
      } else if (entityType === 'issuer') {
        cleared.leiNumber = '';
        cleared.elfCode = '';
        cleared.issuerLeiNumber = '';
        cleared.issuerName = '';
        cleared.issuerCompaniesHouseLink = '';
        cleared.issuerPhone = '';
        cleared.issuerEmail = '';
        cleared.issuerLegalForm = '';
        cleared.issuerRegisteredAddress = '';
        cleared.issuerHeadOffice = '';
        cleared.issuerRegistrationDate = '';
        cleared.issuerParentCompanyName = '';
      } else if (entityType === 'operator') {
        cleared.leiNumber = '';
        cleared.elfCode = '';
        cleared.operatorLeiNumber = '';
        cleared.operatorName = '';
        cleared.operatorCompaniesHouseLink = '';
        cleared.operatorPhone = '';
        cleared.operatorEmail = '';
        cleared.operatorLegalForm = '';
        cleared.operatorRegisteredAddress = '';
        cleared.operatorHeadOffice = '';
        cleared.operatorRegistrationDate = '';
        cleared.operatorParentCompanyName = '';
      }
      return cleared;
    });
    if (onClearLei) {
      onClearLei(entityType);
    }
  };

  const lookupLEI = async () => {
    if (!formData.leiNumber) {
      setLeiError('Please enter a LEI number');
      return;
    }

    setLeiLoading(true);
    setLeiError(null);
    setLeiData(null);

    try {
      const data = await api.lookupLEI(formData.leiNumber);

      if (data.error) {
        throw new Error(data.message || `LEI lookup failed: ${data.error}`);
      }

      setLeiData(data);

      if (data.data && data.data.attributes && data.data.attributes.entity) {
        const entity = data.data.attributes.entity;

        // Auto-fill name if available based on entity type
        if (entity.legalName) {
          setFormData(prev => {
            const updates = {};
            // Set the correct name field based on entity type
            if (entityType === 'offeror') {
              updates.offerorName = entity.legalName.name || prev.offerorName;
            } else if (entityType === 'issuer') {
              updates.issuerName = entity.legalName.name || prev.issuerName;
            } else if (entityType === 'operator') {
              updates.operatorName = entity.legalName.name || prev.operatorName;
            }
            return { ...prev, ...updates };
          });
        }

        // Auto-fill contact information if available
        if (entity.headquartersAddress) {
          const phone = entity.headquartersAddress.contactPhone || '';
          const email = entity.headquartersAddress.contactEmail || '';

          // Create formatted address from headquarters address components
          const addressLines = entity.headquartersAddress.addressLines || [];
          const city = entity.headquartersAddress.city || '';
          const region = entity.headquartersAddress.region || '';
          const country = entity.headquartersAddress.country || '';
          const postalCode = entity.headquartersAddress.postalCode || '';

          const formattedAddress = [
            ...addressLines,
            city,
            region,
            country,
            postalCode,
          ]
            .filter(Boolean)
            .join(', ');

          setFormData(prev => {
            const updates = {};

            // Set the correct contact fields based on entity type
            if (entityType === 'offeror') {
              updates.offerorPhone = phone || prev.offerorPhone;
              updates.offerorEmail = email || prev.offerorEmail;
            } else if (entityType === 'issuer') {
              updates.issuerPhone = phone || prev.issuerPhone;
              updates.issuerEmail = email || prev.issuerEmail;
              updates.issuerHomeAddress =
                formattedAddress || prev.issuerHomeAddress;
            } else if (entityType === 'operator') {
              updates.operatorPhone = phone || prev.operatorPhone;
              updates.operatorEmail = email || prev.operatorEmail;
            }

            return { ...prev, ...updates };
          });
        }

        // Auto-fill parent company information if available
        const parentCompanyName = data.data.attributes?.parentCompanyName;
        if (parentCompanyName) {
          setFormData(prev => {
            const updates = {};

            // Set the correct parent company field based on entity type
            if (entityType === 'offeror') {
              updates.offerorParentCompanyName = parentCompanyName;
            } else if (entityType === 'issuer') {
              updates.issuerParentCompanyName = parentCompanyName;
            } else if (entityType === 'operator') {
              updates.operatorParentCompanyName = parentCompanyName;
            }

            return { ...prev, ...updates };
          });
        }
      }

      if (onLeiData) {
        onLeiData(data);
      }
    } catch (error) {
      console.error('LEI lookup error:', error);
      setLeiError(error.message || 'Failed to lookup LEI. Please try again.');
    } finally {
      setLeiLoading(false);
    }
  };

  const lookupELF = async () => {
    const inputField = searchMode === 'elf' ? 'elfCode' : 'leiNumber';

    if (!formData[inputField]) {
      setElfError('Please enter an ELF code');
      return;
    }

    setElfLoading(true);
    setElfError(null);
    setElfData(null);

    try {
      const data = await api.lookupELF(formData[inputField]);

      if (data.error) {
        throw new Error(data.message || `ELF lookup failed: ${data.error}`);
      }

      setElfData(data);

      // Auto-fill legal form information if available
      if (data.data && data.data.entity_legal_form_name) {
        setFormData(prev => {
          const updates = {};

          // Set the legal form based on entity type
          if (entityType === 'offeror') {
            updates.offerorLegalForm =
              data.data.entity_legal_form_name || prev.offerorLegalForm;
          } else if (entityType === 'issuer') {
            updates.issuerLegalForm =
              data.data.entity_legal_form_name || prev.issuerLegalForm;
          } else if (entityType === 'operator') {
            updates.operatorLegalForm =
              data.data.entity_legal_form_name || prev.operatorLegalForm;
          }

          return { ...prev, ...updates };
        });
      }

      // Note: ELF lookup provides legal form info but not entity details like LEI
      // So we don't call onLeiData callback for ELF lookups
      console.log('ELF lookup successful:', data);
    } catch (error) {
      console.error('ELF lookup error:', error);
      setElfError(
        error.message || 'Failed to lookup ELF code. Please try again.'
      );
    } finally {
      setElfLoading(false);
    }
  };

  return (
    <div className='mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50'>
      <h6 className='font-medium text-lg mb-2'>{title}</h6>
      <p className='text-gray-600 mb-4'>{description}</p>

      {/* Search Mode Switcher */}
      <div className='mb-4 flex gap-2'>
        <button
          type='button'
          onClick={() => {
            setSearchMode('lei');
            setElfData(null);
            setElfError(null);
            setFormData(prev => ({ ...prev, elfCode: '' }));
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            searchMode === 'lei'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
          }`}
        >
          LEI Lookup
        </button>
        <button
          type='button'
          onClick={() => {
            setSearchMode('elf');
            setLeiData(null);
            setLeiError(null);
            setFormData(prev => ({ ...prev, leiNumber: '' }));
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            searchMode === 'elf'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
          }`}
        >
          ELF Code Lookup
        </button>
      </div>

      <div className='flex flex-col md:flex-row gap-4'>
        {searchMode === 'lei' ? (
          <input
            type='text'
            id='leiNumber'
            value={formData.leiNumber || ''}
            onChange={handleInputChange}
            className={getInputClassName(formData.leiNumber)}
            placeholder='Enter LEI number (e.g. 529900W18LQJJN6SJ336)'
          />
        ) : (
          <input
            type='text'
            id='elfCode'
            value={formData.elfCode || ''}
            onChange={handleInputChange}
            className={getInputClassName(formData.elfCode)}
            placeholder='Enter ELF code (e.g. F0A6, U82F, 5AWN)'
          />
        )}

        <div className='flex gap-2'>
          <button
            type='button'
            onClick={searchMode === 'lei' ? lookupLEI : lookupELF}
            disabled={searchMode === 'lei' ? leiLoading : elfLoading}
            className={`px-4 py-2 text-white font-semibold rounded-lg ${
              (searchMode === 'lei' ? leiLoading : elfLoading)
                ? 'bg-gray-400'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {searchMode === 'lei' ? (
              leiLoading ? (
                <Loader />
              ) : (
                'Lookup LEI'
              )
            ) : elfLoading ? (
              <Loader />
            ) : (
              'Lookup ELF'
            )}
          </button>
          <button
            type='button'
            onClick={clearLEIFields}
            className='px-4 py-2 text-white font-semibold rounded-lg bg-red-500 hover:bg-red-600'
          >
            Clear
          </button>
        </div>
      </div>

      {/* Error Messages */}
      {leiError && <p className='mt-2 text-red-500'>{leiError}</p>}
      {elfError && <p className='mt-2 text-red-500'>{elfError}</p>}

      {leiData && (
        <div className='mt-4'>
          <div className='flex justify-between items-center mb-2'>
            <h6 className='font-medium'>LEI Information Found:</h6>
            <span className='text-green-600 text-sm font-semibold'>
              ✓ Information Retrieved
            </span>
          </div>

          <div className='p-4 bg-white border border-gray-300 rounded-lg'>
            {leiData.data &&
              leiData.data.attributes &&
              leiData.data.attributes.entity && (
                <div className='space-y-3'>
                  {/* Legal Name */}
                  {leiData.data.attributes.entity.legalName && (
                    <div>
                      <span className='font-semibold text-gray-700'>
                        Legal Name:{' '}
                      </span>
                      <span className='text-gray-900'>
                        {leiData.data.attributes.entity.legalName.name}
                      </span>
                    </div>
                  )}

                  {/* Other Names */}
                  {leiData.data.attributes.entity.otherNames &&
                    leiData.data.attributes.entity.otherNames.length > 0 && (
                      <div>
                        <span className='font-semibold text-gray-700'>
                          Other Names:{' '}
                        </span>
                        <div className='ml-4 mt-1'>
                          {leiData.data.attributes.entity.otherNames.map(
                            (otherName, index) => (
                              <div key={index} className='text-gray-900'>
                                • {otherName.name}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}
          </div>

          <div className='mt-2'>
            <span
              onClick={() => setShowFullLeiData(!showFullLeiData)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowFullLeiData(!showFullLeiData);
                }
              }}
              className='text-blue-600 hover:text-blue-800 text-xs cursor-pointer underline'
              role='button'
              tabIndex={0}
              aria-label={`${showFullLeiData ? 'Hide' : 'Show'} all LEI data`}
            >
              {showFullLeiData ? 'Hide' : 'Show'} all LEI data
            </span>
          </div>

          {/* Full LEI Data */}
          {showFullLeiData && (
            <div className='mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-96 overflow-y-auto'>
              <h6 className='font-semibold text-gray-700 mb-4'>
                Complete LEI Information:
              </h6>

              {leiData.data && leiData.data.attributes && (
                <div className='space-y-4 text-sm'>
                  {/* Basic Info */}
                  <div>
                    <h6 className='font-semibold text-gray-600 mb-2'>
                      Basic Information
                    </h6>
                    <div className='pl-4 space-y-1'>
                      <div>
                        <span className='font-medium'>LEI:</span>{' '}
                        {leiData.data.attributes.lei}
                      </div>
                      <div>
                        <span className='font-medium'>Status:</span>{' '}
                        {leiData.data.attributes.entity?.status}
                      </div>
                      <div>
                        <span className='font-medium'>Category:</span>{' '}
                        {leiData.data.attributes.entity?.category}
                      </div>
                      <div>
                        <span className='font-medium'>Jurisdiction:</span>{' '}
                        {leiData.data.attributes.entity?.jurisdiction}
                      </div>
                    </div>
                  </div>

                  {/* Entity Details */}
                  {leiData.data.attributes.entity && (
                    <div>
                      <h6 className='font-semibold text-gray-600 mb-2'>
                        Entity Details
                      </h6>
                      <div className='pl-4 space-y-1'>
                        {leiData.data.attributes.entity.legalName && (
                          <div>
                            <span className='font-medium'>Legal Name:</span>{' '}
                            {leiData.data.attributes.entity.legalName.name} (
                            {leiData.data.attributes.entity.legalName.language})
                          </div>
                        )}
                        {leiData.data.attributes.entity.registeredAs && (
                          <div>
                            <span className='font-medium'>
                              Registration Number:
                            </span>{' '}
                            {leiData.data.attributes.entity.registeredAs}
                          </div>
                        )}
                        {leiData.data.attributes.entity.legalForm && (
                          <div>
                            <span className='font-medium'>Legal Form:</span>{' '}
                            {leiData.data.attributes.entity.legalForm.id}
                          </div>
                        )}
                        {leiData.data.attributes.entity.creationDate && (
                          <div>
                            <span className='font-medium'>Creation Date:</span>{' '}
                            {new Date(
                              leiData.data.attributes.entity.creationDate
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Other Names */}
                  {leiData.data.attributes.entity?.otherNames &&
                    leiData.data.attributes.entity.otherNames.length > 0 && (
                      <div>
                        <h6 className='font-semibold text-gray-600 mb-2'>
                          Other Names
                        </h6>
                        <div className='pl-4 space-y-1'>
                          {leiData.data.attributes.entity.otherNames.map(
                            (name, index) => (
                              <div key={index}>
                                <span className='font-medium'>
                                  {name.type}:
                                </span>{' '}
                                {name.name} ({name.language})
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Legal Address */}
                  {leiData.data.attributes.entity?.legalAddress && (
                    <div>
                      <h6 className='font-semibold text-gray-600 mb-2'>
                        Legal Address
                      </h6>
                      <div className='pl-4 space-y-1'>
                        {leiData.data.attributes.entity.legalAddress
                          .addressLines && (
                          <div>
                            <span className='font-medium'>Address:</span>{' '}
                            {leiData.data.attributes.entity.legalAddress.addressLines.join(
                              ', '
                            )}
                          </div>
                        )}
                        {leiData.data.attributes.entity.legalAddress.city && (
                          <div>
                            <span className='font-medium'>City:</span>{' '}
                            {leiData.data.attributes.entity.legalAddress.city}
                          </div>
                        )}
                        {leiData.data.attributes.entity.legalAddress.region && (
                          <div>
                            <span className='font-medium'>Region:</span>{' '}
                            {leiData.data.attributes.entity.legalAddress.region}
                          </div>
                        )}
                        {leiData.data.attributes.entity.legalAddress
                          .country && (
                          <div>
                            <span className='font-medium'>Country:</span>{' '}
                            {
                              leiData.data.attributes.entity.legalAddress
                                .country
                            }
                          </div>
                        )}
                        {leiData.data.attributes.entity.legalAddress
                          .postalCode && (
                          <div>
                            <span className='font-medium'>Postal Code:</span>{' '}
                            {
                              leiData.data.attributes.entity.legalAddress
                                .postalCode
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Headquarters Address */}
                  {leiData.data.attributes.entity?.headquartersAddress && (
                    <div>
                      <h6 className='font-semibold text-gray-600 mb-2'>
                        Headquarters Address
                      </h6>
                      <div className='pl-4 space-y-1'>
                        {leiData.data.attributes.entity.headquartersAddress
                          .addressLines && (
                          <div>
                            <span className='font-medium'>Address:</span>{' '}
                            {leiData.data.attributes.entity.headquartersAddress.addressLines.join(
                              ', '
                            )}
                          </div>
                        )}
                        {leiData.data.attributes.entity.headquartersAddress
                          .city && (
                          <div>
                            <span className='font-medium'>City:</span>{' '}
                            {
                              leiData.data.attributes.entity.headquartersAddress
                                .city
                            }
                          </div>
                        )}
                        {leiData.data.attributes.entity.headquartersAddress
                          .region && (
                          <div>
                            <span className='font-medium'>Region:</span>{' '}
                            {
                              leiData.data.attributes.entity.headquartersAddress
                                .region
                            }
                          </div>
                        )}
                        {leiData.data.attributes.entity.headquartersAddress
                          .country && (
                          <div>
                            <span className='font-medium'>Country:</span>{' '}
                            {
                              leiData.data.attributes.entity.headquartersAddress
                                .country
                            }
                          </div>
                        )}
                        {leiData.data.attributes.entity.headquartersAddress
                          .postalCode && (
                          <div>
                            <span className='font-medium'>Postal Code:</span>{' '}
                            {
                              leiData.data.attributes.entity.headquartersAddress
                                .postalCode
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Registration Info */}
                  {leiData.data.attributes.registration && (
                    <div>
                      <h6 className='font-semibold text-gray-600 mb-2'>
                        Registration Information
                      </h6>
                      <div className='pl-4 space-y-1'>
                        {leiData.data.attributes.registration
                          .initialRegistrationDate && (
                          <div>
                            <span className='font-medium'>
                              Initial Registration:
                            </span>{' '}
                            {new Date(
                              leiData.data.attributes.registration.initialRegistrationDate
                            ).toLocaleDateString()}
                          </div>
                        )}
                        {leiData.data.attributes.registration
                          .lastUpdateDate && (
                          <div>
                            <span className='font-medium'>Last Update:</span>{' '}
                            {new Date(
                              leiData.data.attributes.registration.lastUpdateDate
                            ).toLocaleDateString()}
                          </div>
                        )}
                        {leiData.data.attributes.registration
                          .nextRenewalDate && (
                          <div>
                            <span className='font-medium'>Next Renewal:</span>{' '}
                            {new Date(
                              leiData.data.attributes.registration.nextRenewalDate
                            ).toLocaleDateString()}
                          </div>
                        )}
                        {leiData.data.attributes.registration.status && (
                          <div>
                            <span className='font-medium'>
                              Registration Status:
                            </span>{' '}
                            {leiData.data.attributes.registration.status}
                          </div>
                        )}
                        {leiData.data.attributes.registration
                          .corroborationLevel && (
                          <div>
                            <span className='font-medium'>
                              Corroboration Level:
                            </span>{' '}
                            {
                              leiData.data.attributes.registration
                                .corroborationLevel
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Identifiers */}
                  <div>
                    <h6 className='font-semibold text-gray-600 mb-2'>
                      Additional Identifiers
                    </h6>
                    <div className='pl-4 space-y-1'>
                      {leiData.data.attributes.ocid && (
                        <div>
                          <span className='font-medium'>OCID:</span>{' '}
                          {leiData.data.attributes.ocid}
                        </div>
                      )}
                      {leiData.data.attributes.qcc && (
                        <div>
                          <span className='font-medium'>QCC:</span>{' '}
                          {leiData.data.attributes.qcc}
                        </div>
                      )}
                      {leiData.data.attributes.spglobal &&
                        leiData.data.attributes.spglobal.length > 0 && (
                          <div>
                            <span className='font-medium'>SP Global:</span>{' '}
                            {leiData.data.attributes.spglobal.join(', ')}
                          </div>
                        )}
                      {leiData.data.attributes.conformityFlag && (
                        <div>
                          <span className='font-medium'>Conformity Flag:</span>{' '}
                          {leiData.data.attributes.conformityFlag}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ELF Data Display */}
      {elfData && (
        <div className='mt-4'>
          <div className='flex justify-between items-center mb-2'>
            <h6 className='font-medium'>ELF Information Found:</h6>
            <span className='text-green-600 text-sm font-semibold'>
              ✓ Legal Form Information Retrieved
            </span>
          </div>

          <div className='p-4 bg-white border border-gray-300 rounded-lg'>
            {elfData.data && (
              <div className='space-y-3'>
                {/* ELF Code */}
                <div>
                  <span className='font-semibold text-gray-700'>
                    ELF Code:{' '}
                  </span>
                  <span className='text-gray-900'>{elfData.data.elf_code}</span>
                </div>

                {/* Entity Legal Form Name */}
                {elfData.data.entity_legal_form_name && (
                  <div>
                    <span className='font-semibold text-gray-700'>
                      Legal Form:{' '}
                    </span>
                    <span className='text-gray-900'>
                      {elfData.data.entity_legal_form_name}
                    </span>
                  </div>
                )}

                {/* Country Information */}
                {elfData.data.country_of_formation && (
                  <div>
                    <span className='font-semibold text-gray-700'>
                      Country of Formation:{' '}
                    </span>
                    <span className='text-gray-900'>
                      {elfData.data.country_of_formation} (
                      {elfData.data.country_code})
                    </span>
                  </div>
                )}

                {/* Jurisdiction */}
                {elfData.data.jurisdiction && (
                  <div>
                    <span className='font-semibold text-gray-700'>
                      Jurisdiction:{' '}
                    </span>
                    <span className='text-gray-900'>
                      {elfData.data.jurisdiction}
                    </span>
                  </div>
                )}

                {/* Language */}
                {elfData.data.language && (
                  <div>
                    <span className='font-semibold text-gray-700'>
                      Language:{' '}
                    </span>
                    <span className='text-gray-900'>
                      {elfData.data.language} ({elfData.data.language_code})
                    </span>
                  </div>
                )}

                {/* Abbreviations */}
                {elfData.data.abbreviations_local && (
                  <div>
                    <span className='font-semibold text-gray-700'>
                      Abbreviations:{' '}
                    </span>
                    <span className='text-gray-900'>
                      {elfData.data.abbreviations_local}
                    </span>
                  </div>
                )}

                {/* Status */}
                {elfData.data.status && (
                  <div>
                    <span className='font-semibold text-gray-700'>
                      Status:{' '}
                    </span>
                    <span
                      className={`${elfData.data.status === 'ACTV' ? 'text-green-600' : 'text-red-600'} font-medium`}
                    >
                      {elfData.data.status === 'ACTV' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                )}

                {/* Note about ELF vs LEI */}
                <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded'>
                  <p className='text-sm text-blue-800'>
                    <strong>Note:</strong> ELF lookup provides legal form
                    information only. For complete entity details (name,
                    address, contact info), use LEI lookup if available.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LEILookup;
