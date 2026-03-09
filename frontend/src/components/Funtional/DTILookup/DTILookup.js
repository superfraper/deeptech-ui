import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../../../services/api';

const DTILookup = ({
  onSelect,
  onSelectWithRecord,
  selectedDTIs = [],
  selectedDTIRecords = {},
  mode = 'regular',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const dropdownRef = useRef(null);
  const api = useApi();

  // Function to fetch DTI records based on search query
  const searchDTIs = async searchQuery => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    setDebugInfo(null);

    console.log(
      `[DTILookup] Searching for DTIs with query: "${searchQuery}", mode: ${mode}`
    );

    try {
      // Add mode parameter to filter DTIs by type
      const dtiTypeParam = mode === 'fungible' ? 'type=3' : 'type=012';
      // Use api service instead of fetch directly
      const data = await api.searchDTI(searchQuery, dtiTypeParam);

      console.log('[DTILookup] API response:', data);

      if (data && data.results) {
        // Additional client-side filtering as a safeguard
        let filteredResults = data.results;
        if (mode === 'regular') {
          filteredResults = data.results.filter(
            dti =>
              dti.Header &&
              dti.Header.DTIType !== undefined &&
              dti.Header.DTIType !== 3
          );
        } else if (mode === 'fungible') {
          filteredResults = data.results.filter(
            dti =>
              dti.Header &&
              dti.Header.DTIType !== undefined &&
              dti.Header.DTIType === 3
          );
        }

        setResults(filteredResults);
        console.log(
          `[DTILookup] Search returned ${filteredResults.length} filtered results`
        );
      } else {
        setResults([]);
        setDebugInfo('API response is missing results property');
        console.warn(
          '[DTILookup] API response is missing results property:',
          data
        );
      }

      // Check for error in response
      if (data && data.error) {
        setDebugInfo(`API reported error: ${data.error}`);
        console.warn('[DTILookup] API reported error:', data.error);
      }
    } catch (err) {
      console.error('[DTILookup] Error fetching DTI data:', err);
      setError(
        `Failed to load DTI data. Please try again. Error: ${err.message}`
      );
      setDebugInfo(
        `Request failed: ${err.message}\n` +
          `Status: ${err.response?.status || 'unknown'}\n` +
          `Data: ${JSON.stringify(err.response?.data || {})}`
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to avoid excessive API calls
  useEffect(() => {
    console.log(`[DTILookup] Query changed to "${query}"`);
    const handler = setTimeout(() => {
      if (query.length >= 2) {
        searchDTIs(query);
      } else {
        console.log('[DTILookup] Query too short, not searching');
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to handle DTI selection
  const handleSelect = dti => {
    try {
      console.log('[DTILookup] DTI selected:', dti);

      // Check if the record has valid structure
      if (!dti || !dti.Header || !dti.Header.DTI) {
        console.error('[DTILookup] Invalid DTI record selected:', dti);
        setError('Invalid DTI record selected. Missing DTI code.');
        return;
      }
      const dtiCode = dti.Header.DTI;
      if (!selectedDTIs.includes(dtiCode)) {
        // Instead of updating local state, call parent callback with record info
        if (onSelectWithRecord) {
          onSelectWithRecord([...selectedDTIs, dtiCode], {
            ...selectedDTIRecords,
            [dtiCode]: {
              name: dti.Informative?.LongName || 'Unknown',
              shortName: dti.Informative?.ShortNames?.[0]?.ShortName || '',
            },
          });
        } else {
          onSelect([...selectedDTIs, dtiCode]);
        }
      } else {
        console.log(`[DTILookup] DTI already selected: ${dtiCode}`);
      }

      setQuery('');
      setDropdownVisible(false);
    } catch (err) {
      console.error('[DTILookup] Error in handleSelect:', err);
      setError(`Error selecting DTI: ${err.message}`);
    }
  };

  // Function to remove a selected DTI
  const handleRemove = dtiCode => {
    try {
      console.log(`[DTILookup] Removing DTI: ${dtiCode}`);
      const updatedDTIs = selectedDTIs.filter(code => code !== dtiCode);
      if (onSelectWithRecord) {
        // Remove from records as well
        const updatedRecords = { ...selectedDTIRecords };
        delete updatedRecords[dtiCode];
        onSelectWithRecord(updatedDTIs, updatedRecords);
      } else {
        onSelect(updatedDTIs);
      }
    } catch (err) {
      console.error('[DTILookup] Error in handleRemove:', err);
      setError(`Error removing DTI: ${err.message}`);
    }
  };

  // Get placeholder text based on mode
  const getPlaceholderText = () => {
    return mode === 'fungible'
      ? 'Search for Functionally Fungible DTIs...'
      : 'Search for DTIs (type 0, 1, 2)...';
  };

  return (
    <div className='dti-lookup-container'>
      <div className='relative' ref={dropdownRef}>
        <input
          type='text'
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setDropdownVisible(true);
          }}
          onFocus={() => setDropdownVisible(true)}
          placeholder={getPlaceholderText()}
          className='mt-1 p-2 w-full border rounded-lg border-gray-300'
        />

        {loading && (
          <div className='absolute right-3 top-3'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
          </div>
        )}

        {dropdownVisible && results.length > 0 && (
          <div className='absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto'>
            {results.map((dti, index) => (
              <div
                key={index}
                className='p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0'
                onClick={() => handleSelect(dti)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(dti);
                  }
                }}
                role='button'
                tabIndex={0}
                aria-label={`Select DTI: ${dti.Informative?.LongName || 'Unknown'}`}
              >
                <div className='font-medium'>
                  {dti.Informative?.LongName || 'Unknown'}
                </div>
                <div className='text-sm text-gray-600 flex justify-between'>
                  <span>
                    {dti.Informative?.ShortNames &&
                    Array.isArray(dti.Informative.ShortNames)
                      ? dti.Informative.ShortNames.map(n => n.ShortName).join(
                          ', '
                        )
                      : 'No symbol'}
                  </span>
                  <span className='text-xs rounded px-1 bg-gray-200'>
                    {dti.Header?.DTI || 'No DTI'}
                    {dti.Header?.DTIType !== undefined && (
                      <span className='ml-1 text-xs opacity-70'>
                        Type: {dti.Header.DTIType}
                      </span>
                    )}
                  </span>
                </div>

                {/* Removed the fungible-specific information display */}
              </div>
            ))}
          </div>
        )}

        {dropdownVisible &&
          query.length >= 2 &&
          results.length === 0 &&
          !loading && (
            <div className='absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 p-3 text-center text-gray-500'>
              {mode === 'fungible'
                ? `No Functionally Fungible DTIs found matching "${query}"`
                : `No Regular DTIs found matching "${query}"`}
            </div>
          )}

        {error && <div className='text-red-500 text-sm mt-1'>{error}</div>}

        {debugInfo && (
          <div className='text-gray-500 text-xs mt-1 bg-gray-100 p-2 rounded'>
            <details>
              <summary>Debug Info</summary>
              <pre className='whitespace-pre-wrap'>{debugInfo}</pre>
            </details>
          </div>
        )}
      </div>

      {selectedDTIs.length > 0 && (
        <div className='mt-3'>
          <label className='block text-gray-600 text-[14px] leading-[17px] mb-1'>
            {mode === 'fungible' ? 'Selected Fungible DTIs' : 'Selected DTIs'} (
            {selectedDTIs.length}):
          </label>
          <div className='flex flex-wrap gap-2 mt-1'>
            {selectedDTIs.map(dtiCode => (
              <div
                key={dtiCode}
                className='bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center'
              >
                <span>
                  {dtiCode}
                  {selectedDTIRecords[dtiCode] && (
                    <span className='ml-1 text-blue-600'>
                      -{' '}
                      {selectedDTIRecords[dtiCode].name ||
                        selectedDTIRecords[dtiCode].shortName ||
                        ''}
                    </span>
                  )}
                </span>
                <span
                  onClick={() => handleRemove(dtiCode)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRemove(dtiCode);
                    }
                  }}
                  className='ml-2 text-blue-600 hover:text-blue-800 cursor-pointer font-medium'
                  role='button'
                  tabIndex={0}
                  aria-label={`Remove DTI: ${dtiCode}`}
                  style={{
                    fontSize: '14px',
                    lineHeight: '14px',
                    width: '14px',
                    height: '14px',
                    textAlign: 'center',
                  }}
                >
                  ×
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DTILookup;
