// src/components/PartE.js
import { useEffect, useState } from 'react';
import { useDataContext } from '../../../context/DataContext';
import { useApi } from '../../../services/api';
import BaseSectionComponent from '../../BaseSectionComponent';
import BreadcrumbNav from '../../Common/BreadcrumbNav';
import FlagIcon from '../../Common/FlagIcon';
import HighlightedField from '../../Common/HighlightedField';

// Create a simplified PartE component using the BaseSectionComponent
const PartE = props => {
  const api = useApi();
  // State to keep track of fetched fields
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    fieldData,
    setFieldData,
    isFieldDataLoading,
    fieldDataError,
    saveUserContextData,
    acceptedFields = [],
    improvedFields = [],
  } = useDataContext();

  // List of all countries for E.39 (same as G.19)
  const countries = [
    'N/A',
    'Afghanistan',
    'Albania',
    'Algeria',
    'Andorra',
    'Angola',
    'Antigua and Barbuda',
    'Argentina',
    'Armenia',
    'Australia',
    'Austria',
    'Azerbaijan',
    'Bahamas',
    'Bahrain',
    'Bangladesh',
    'Barbados',
    'Belarus',
    'Belgium',
    'Belize',
    'Benin',
    'Bhutan',
    'Bolivia',
    'Bosnia and Herzegovina',
    'Botswana',
    'Brazil',
    'Brunei',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Cabo Verde',
    'Cambodia',
    'Cameroon',
    'Canada',
    'Central African Republic',
    'Chad',
    'Chile',
    'China',
    'Colombia',
    'Comoros',
    'Congo (Congo-Brazzaville)',
    'Costa Rica',
    'Croatia',
    'Cuba',
    'Cyprus',
    'Czechia (Czech Republic)',
    'Democratic Republic of the Congo',
    'Denmark',
    'Djibouti',
    'Dominica',
    'Dominican Republic',
    'Ecuador',
    'Egypt',
    'El Salvador',
    'Equatorial Guinea',
    'Eritrea',
    'Estonia',
    'Eswatini (fmr. Swaziland)',
    'Ethiopia',
    'Fiji',
    'Finland',
    'France',
    'Gabon',
    'Gambia',
    'Georgia',
    'Germany',
    'Ghana',
    'Greece',
    'Grenada',
    'Guatemala',
    'Guinea',
    'Guinea-Bissau',
    'Guyana',
    'Haiti',
    'Holy See',
    'Honduras',
    'Hungary',
    'Iceland',
    'India',
    'Indonesia',
    'Iran',
    'Iraq',
    'Ireland',
    'Israel',
    'Italy',
    'Ivory Coast',
    'Jamaica',
    'Japan',
    'Jordan',
    'Kazakhstan',
    'Kenya',
    'Kiribati',
    'Kuwait',
    'Kyrgyzstan',
    'Laos',
    'Latvia',
    'Lebanon',
    'Lesotho',
    'Liberia',
    'Libya',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Maldives',
    'Mali',
    'Malta',
    'Marshall Islands',
    'Mauritania',
    'Mauritius',
    'Mexico',
    'Micronesia',
    'Moldova',
    'Monaco',
    'Mongolia',
    'Montenegro',
    'Morocco',
    'Mozambique',
    'Myanmar (formerly Burma)',
    'Namibia',
    'Nauru',
    'Nepal',
    'Netherlands',
    'New Zealand',
    'Nicaragua',
    'Niger',
    'Nigeria',
    'North Korea',
    'North Macedonia',
    'Norway',
    'Oman',
    'Pakistan',
    'Palau',
    'Palestine',
    'Panama',
    'Papua New Guinea',
    'Paraguay',
    'Peru',
    'Philippines',
    'Poland',
    'Portugal',
    'Qatar',
    'Romania',
    'Russia',
    'Rwanda',
    'Saint Kitts and Nevis',
    'Saint Lucia',
    'Saint Vincent and the Grenadines',
    'Samoa',
    'San Marino',
    'Sao Tome and Principe',
    'Saudi Arabia',
    'Senegal',
    'Serbia',
    'Seychelles',
    'Sierra Leone',
    'Singapore',
    'Slovakia',
    'Slovenia',
    'Solomon Islands',
    'Somalia',
    'South Africa',
    'South Korea',
    'South Sudan',
    'Spain',
    'Sri Lanka',
    'Sudan',
    'Suriname',
    'Sweden',
    'Switzerland',
    'Syria',
    'Tajikistan',
    'Tanzania',
    'Thailand',
    'Timor-Leste',
    'Togo',
    'Tonga',
    'Trinidad and Tobago',
    'Tunisia',
    'Turkey',
    'Turkmenistan',
    'Tuvalu',
    'Uganda',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States of America',
    'Uruguay',
    'Uzbekistan',
    'Vanuatu',
    'Venezuela',
    'Vietnam',
    'Yemen',
    'Zambia',
    'Zimbabwe',
  ];

  // State for country picker for E.39
  const [searchTermE39, setSearchTermE39] = useState('');
  const [selectedCountriesE39, setSelectedCountriesE39] = useState([]);
  const [showDropdownE39, setShowDropdownE39] = useState(false);

  // Fetch fields when component mounts
  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setIsLoading(true);
    try {
      // Use the API service instead of direct fetch
      const data = await api.getSectionFields(9);
      console.log('PartE fetched fields:', data);
      setFields(data.fields || []);
      setIsLoading(false);
      if (fieldDataError) {
        setError(`Error loading field data: ${fieldDataError}`);
      }
    } catch (error) {
      console.error('Error fetching data for PartE:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Auto-resize textarea function
  const autoResizeTextarea = textarea => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(textarea.scrollHeight, 48) + 'px';
    }
  };

  // Handle field value change
  const handleFieldChange = (fieldId, value) => {
    // Update the fieldData in the context
    setFieldData(prevData => {
      const updatedData = {
        ...prevData,
        [fieldId]: {
          ...prevData[fieldId],
          field_text: value,
        },
      };

      // Save context data after updating field value
      saveUserContextData();

      return updatedData;
    });
  };

  // Handle textarea change with auto-resize
  const handleTextareaChange = (fieldId, event) => {
    handleFieldChange(fieldId, event.target.value);
    autoResizeTextarea(event.target);
  };

  // Handle country selection for E.39
  const handleCountrySelect = (fieldId, country) => {
    if (fieldId === 'E.39') {
      const updatedCountries = [...selectedCountriesE39];
      if (!updatedCountries.includes(country)) {
        updatedCountries.push(country);
        setSelectedCountriesE39(updatedCountries);
        const countriesString = updatedCountries.join(', ');
        handleFieldChange(fieldId, countriesString);
      }
    }
  };

  // Handle removing a country
  const handleCountryRemove = (fieldId, country) => {
    if (fieldId === 'E.39') {
      const updatedCountries = selectedCountriesE39.filter(c => c !== country);
      setSelectedCountriesE39(updatedCountries);
      const countriesString = updatedCountries.join(', ');
      handleFieldChange(fieldId, countriesString);
    }
  };

  // Initialize selected countries from field data when component mounts
  useEffect(() => {
    if (fieldData && fieldData['E.39'] && fieldData['E.39'].field_text) {
      const countriesText = fieldData['E.39'].field_text;
      const countriesArray = countriesText
        .split(', ')
        .filter(c => c.trim() !== '');
      setSelectedCountriesE39(countriesArray);
    }
  }, [fieldData]);

  // Handle clicking outside dropdown for E.39
  useEffect(() => {
    const handleClickOutside = event => {
      if (!event.target.closest('.dropdown-container-e39')) {
        setShowDropdownE39(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Monitor E.33 changes and auto-update E.34
  useEffect(() => {
    if (fieldData) {
      const e33FieldData = fieldData['E.33'];
      const e34FieldData = fieldData['E.34'];

      if (e33FieldData) {
        const e33Value = e33FieldData.field_text;
        const isE33NA =
          e33Value === 'N/A' || String(e33Value).trim().toUpperCase() === 'N/A';

        // If E.33 is N/A and E.34 is not N/A, update E.34 to N/A
        if (isE33NA && e34FieldData && e34FieldData.field_text !== 'N/A') {
          setFieldData(prev => ({
            ...prev,
            'E.34': { ...e34FieldData, field_text: 'N/A' },
          }));
        }
      }
    }
  }, [fieldData, setFieldData]);

  // Define the section-specific configuration
  const sectionConfig = {
    sectionNumber: 9,
    sectionTitle:
      'Part E: Information about the offer to the public of crypto-assets or their admission to trading',
    sectionDescription:
      'This section should be completed by the offeror or person seeking admission. As this whitepaper is written as an academic exercise, most fields are not applicable.',
    nextRoute: '/oth/partF', // Route to navigate to next
  };

  // Create a renderFields function that will be passed to BaseSectionComponent
  const renderFields = baseProps => {
    const {
      getFieldValue,
      getHighlightClass,
      renderActionButtons,
      renderInlineFollowUpQuestions,
    } = baseProps;

    // List of non-editable fields
    const nonEditableFields = [];

    // Show loading state
    if (isLoading) {
      return (
        <div className='flex justify-center items-center py-10'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500'></div>
        </div>
      );
    }

    if (!fieldData || Object.keys(fieldData).length === 0) {
      return (
        <div className='bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6'>
          <p className='font-bold'>No data available</p>
          <p>
            Please go back to the questionnaire and submit the form to generate
            whitepaper data.
          </p>
        </div>
      );
    }

    // Show error state
    if (error || fieldDataError || !fields || fields.length === 0) {
      return (
        <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6'>
          <p className='font-bold'>Error loading fields</p>
          <p>
            {error ||
              fieldDataError ||
              'No fields found for this section. Please check the database.'}
          </p>
        </div>
      );
    }

    // If fields have been loaded from the database, render them dynamically
    return fields.map(field => {
      const normalizedFieldId = field.field_id;
      const alternateFieldId = normalizedFieldId.includes('.0')
        ? normalizedFieldId.replace(/\.0(\d)/, '.$1')
        : normalizedFieldId.replace(/\.(\d)$/, '.0$1');

      const fieldDataItem =
        fieldData[normalizedFieldId] || fieldData[alternateFieldId];
      const fieldText = fieldDataItem ? fieldDataItem.field_text : '';
      // Fixed logic: Check if field is confirmed as correct or has no unanswered questions
      const isConfirmedCorrect = fieldDataItem?.confirmed_correct === true;
      const hasUnansweredQuestions =
        fieldDataItem?.unanswered_questions &&
        fieldDataItem.unanswered_questions.length > 0;
      const totallyUnanswered = fieldDataItem?.totally_unanswered;

      // Determine background color based on the three cases:
      const isAccepted =
        acceptedFields.includes(normalizedFieldId) ||
        acceptedFields.includes(alternateFieldId);
      const isImproved =
        improvedFields.includes(normalizedFieldId) ||
        improvedFields.includes(alternateFieldId);

      const getBackgroundColor = () => {
        // HIGHEST PRIORITY: If accepted or improved, always return white/default
        if (isAccepted || isImproved) {
          return 'bg-white border-gray-300'; // White background for accepted/improved
        }

        // NEXT PRIORITY: If confirmed as correct, also return white/default
        const isConfirmed =
          fieldDataItem?.confirmed_correct === true ||
          fieldDataItem?.confirmed_correct === 'true' ||
          fieldDataItem?.confirmed_correct == true ||
          fieldDataItem?.confirmed === true;

        if (isConfirmed) {
          return 'bg-white border-gray-300'; // White background for confirmed correct
        }

        if (isConfirmedCorrect || !hasUnansweredQuestions) {
          return 'bg-[rgba(99,93,255,0.05)] border-[rgba(99,93,255,0.5)]'; // Case 1: default (light blue)
        } else if (hasUnansweredQuestions && totallyUnanswered === false) {
          return 'bg-yellow-200 border-yellow-400'; // Case 2: yellow/orange
        } else if (hasUnansweredQuestions && totallyUnanswered === true) {
          return 'bg-red-200 border-red-400'; // Case 3: red
        }
        return 'bg-[rgba(99,93,255,0.05)] border-[rgba(99,93,255,0.5)]'; // fallback
      };

      // Get the background color classes
      const backgroundColorClasses = getBackgroundColor();

      // Check if this field is non-editable
      const isNonEditable = nonEditableFields.includes(normalizedFieldId);

      // Handle non-editable fields first
      if (isNonEditable) {
        return (
          <HighlightedField key={field.field_id} fieldId={field.field_id}>
            <div className='mb-10'>
              <label
                className='block text-gray-700 font-semibold font-inter text-[16px] leading-[19px] text-black text-[20px] leading-[24px] mb-[10px] mb-5'
                htmlFor={`field-${field.field_id}`}
              >
                <span className='text-blue-500 font-mono mr-2'>
                  {field.field_id}:
                </span>
                {field.field_name}
              </label>
              <div className='flex flex-col'>
                <div className='bg-gray-100 border border-gray-300 p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full'>
                  {fieldText ||
                    getFieldValue(field.field_id) ||
                    `System-defined field (${field.field_id})`}
                </div>
              </div>
            </div>
          </HighlightedField>
        );
      }

      // Special handling for E.6 - True or False dropdown
      if (field.field_id === 'E.6') {
        const isE6Accepted =
          acceptedFields.includes(field.field_id) ||
          acceptedFields.includes(alternateFieldId);
        const isE6Improved =
          improvedFields.includes(field.field_id) ||
          improvedFields.includes(alternateFieldId);
        const isE6Confirmed =
          fieldDataItem?.confirmed_correct === true ||
          fieldDataItem?.confirmed_correct === 'true' ||
          fieldDataItem?.confirmed_correct == true;
        const e6BackgroundClasses =
          isE6Accepted || isE6Improved || isE6Confirmed
            ? 'bg-white border-gray-300'
            : backgroundColorClasses;

        // Normalize the value to uppercase "TRUE", "FALSE", or "N/A" regardless of input format
        const normalizeValue = value => {
          if (!value) return 'FALSE'; // Default to FALSE if empty

          // Handle string values
          if (typeof value === 'string') {
            const upperValue = value.trim().toUpperCase();
            if (upperValue === 'TRUE') return 'TRUE';
            if (upperValue === 'N/A') return 'N/A';
            return 'FALSE';
          }

          // Handle actual boolean values
          return value === true ? 'TRUE' : 'FALSE';
        };

        const currentValue = normalizeValue(
          fieldText || getFieldValue(field.field_id)
        );

        return (
          <HighlightedField key={field.field_id} fieldId={field.field_id}>
            <div className='mb-10'>
              <label
                className='block text-gray-700 font-semibold font-inter text-[16px] leading-[19px] text-black text-[20px] leading-[24px] mb-[10px] mb-5'
                htmlFor={`field-${field.field_id}`}
              >
                <span className='text-blue-500 font-mono mr-2'>
                  {field.field_id}:
                </span>{' '}
                {field.field_name}
                <FlagIcon
                  fieldId={field.field_id}
                  section='partE'
                  sectionName='Part E'
                />
              </label>
              <div className='flex flex-col'>
                <select
                  className={`${e6BackgroundClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
                  id={`field-${field.field_id}`}
                  value={currentValue}
                  onChange={e =>
                    handleFieldChange(field.field_id, e.target.value)
                  }
                >
                  <option value='FALSE'>False</option>
                  <option value='TRUE'>True</option>
                  <option value='N/A'>N/A</option>
                </select>
                <div className='self-start mt-1'>
                  {renderActionButtons(field.field_id)}
                </div>
                {renderInlineFollowUpQuestions &&
                  renderInlineFollowUpQuestions(field.field_id)}
              </div>
            </div>
          </HighlightedField>
        );
      }

      // Special handling for E.20 - True or False dropdown
      if (field.field_id === 'E.20') {
        const isE20Accepted =
          acceptedFields.includes(field.field_id) ||
          acceptedFields.includes(alternateFieldId);
        const isE20Improved =
          improvedFields.includes(field.field_id) ||
          improvedFields.includes(alternateFieldId);
        const isE20Confirmed =
          fieldDataItem?.confirmed_correct === true ||
          fieldDataItem?.confirmed_correct === 'true' ||
          fieldDataItem?.confirmed_correct == true;
        const e20BackgroundClasses =
          isE20Accepted || isE20Improved || isE20Confirmed
            ? 'bg-white border-gray-300'
            : backgroundColorClasses;

        // Normalize the value to uppercase "TRUE", "FALSE", or "N/A" regardless of input format
        const normalizeValue = value => {
          if (!value) return 'FALSE'; // Default to FALSE if empty

          // Handle string values
          if (typeof value === 'string') {
            const upperValue = value.trim().toUpperCase();
            if (upperValue === 'TRUE') return 'TRUE';
            if (upperValue === 'N/A') return 'N/A';
            return 'FALSE';
          }

          // Handle actual boolean values
          return value === true ? 'TRUE' : 'FALSE';
        };

        const currentValue = normalizeValue(
          fieldText || getFieldValue(field.field_id)
        );

        return (
          <HighlightedField key={field.field_id} fieldId={field.field_id}>
            <div className='mb-10'>
              <label
                className='block text-gray-700 font-semibold font-inter text-[16px] leading-[19px] text-black text-[20px] leading-[24px] mb-[10px] mb-5'
                htmlFor={`field-${field.field_id}`}
              >
                <span className='text-blue-500 font-mono mr-2'>
                  {field.field_id}:
                </span>{' '}
                {field.field_name}
                <FlagIcon
                  fieldId={field.field_id}
                  section='partE'
                  sectionName='Part E'
                />
              </label>
              <div className='flex flex-col'>
                <select
                  className={`${e20BackgroundClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
                  id={`field-${field.field_id}`}
                  value={currentValue}
                  onChange={e =>
                    handleFieldChange(field.field_id, e.target.value)
                  }
                >
                  <option value='FALSE'>False</option>
                  <option value='TRUE'>True</option>
                  <option value='N/A'>N/A</option>
                </select>
                <div className='self-start mt-1'>
                  {renderActionButtons(field.field_id)}
                </div>
                {renderInlineFollowUpQuestions &&
                  renderInlineFollowUpQuestions(field.field_id)}
              </div>
            </div>
          </HighlightedField>
        );
      }

      // Special handling for E.21 - Date format [YYYY-MM-DD] with N/A option
      if (field.field_id === 'E.21') {
        const currentValue = fieldText || getFieldValue(field.field_id);
        const isNAValue = currentValue === 'N/A';

        return (
          <HighlightedField key={field.field_id} fieldId={field.field_id}>
            <div className='mb-10'>
              <label
                className='block text-gray-700 font-semibold font-inter text-[16px] leading-[19px] text-black text-[20px] leading-[24px] mb-[10px] mb-5'
                htmlFor={`field-${field.field_id}`}
              >
                <span className='text-blue-500 font-mono mr-2'>
                  {field.field_id}:
                </span>
                {field.field_name}{' '}
                <span className='text-sm text-gray-500'>
                  [Format: YYYY-MM-DD or N/A]
                </span>
                <FlagIcon
                  fieldId={field.field_id}
                  section='partE'
                  sectionName='Part E'
                />
              </label>
              <div className='flex flex-col'>
                <div className='flex items-center gap-2'>
                  {isNAValue ? (
                    <input
                      type='text'
                      className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black flex-1 ${getHighlightClass(field.field_id)} cursor-not-allowed`}
                      value='N/A'
                      readOnly
                    />
                  ) : (
                    <input
                      type='date'
                      className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black flex-1 ${getHighlightClass(field.field_id)}`}
                      id={`field-${field.field_id}`}
                      defaultValue={currentValue || ''}
                      onChange={e =>
                        handleFieldChange(field.field_id, e.target.value)
                      }
                      placeholder='YYYY-MM-DD'
                    />
                  )}
                  <button
                    type='button'
                    onClick={() => {
                      if (isNAValue) {
                        handleFieldChange(field.field_id, '');
                      } else {
                        handleFieldChange(field.field_id, 'N/A');
                      }
                    }}
                    className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      isNAValue
                        ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                    title={isNAValue ? 'Switch to Date' : 'Mark as N/A'}
                  >
                    {isNAValue ? 'Set Date' : 'Mark as N/A'}
                  </button>
                </div>
                <div className='self-start mt-1'>
                  {renderActionButtons(field.field_id)}
                </div>
                {renderInlineFollowUpQuestions &&
                  renderInlineFollowUpQuestions(field.field_id)}
              </div>
            </div>
          </HighlightedField>
        );
      }

      // Special handling for E.22 - Date format [YYYY-MM-DD] with N/A option
      if (field.field_id === 'E.22') {
        const currentValue = fieldText || getFieldValue(field.field_id);
        const isNAValue = currentValue === 'N/A';

        return (
          <HighlightedField key={field.field_id} fieldId={field.field_id}>
            <div className='mb-10'>
              <label
                className='block text-gray-700 font-semibold font-inter text-[16px] leading-[19px] text-black text-[20px] leading-[24px] mb-[10px] mb-5'
                htmlFor={`field-${field.field_id}`}
              >
                <span className='text-blue-500 font-mono mr-2'>
                  {field.field_id}:
                </span>
                {field.field_name}{' '}
                <span className='text-sm text-gray-500'>
                  [Format: YYYY-MM-DD]
                </span>
                <FlagIcon
                  fieldId={field.field_id}
                  section='partE'
                  sectionName='Part E'
                />
              </label>
              <div className='flex flex-col'>
                <div className='flex items-center gap-2'>
                  {isNAValue ? (
                    <input
                      type='text'
                      className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black flex-1 ${getHighlightClass(field.field_id)} cursor-not-allowed`}
                      value='N/A'
                      readOnly
                    />
                  ) : (
                    <input
                      type='date'
                      className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black flex-1 ${getHighlightClass(field.field_id)}`}
                      id={`field-${field.field_id}`}
                      defaultValue={currentValue || ''}
                      onChange={e =>
                        handleFieldChange(field.field_id, e.target.value)
                      }
                      placeholder='YYYY-MM-DD'
                    />
                  )}
                  <button
                    type='button'
                    onClick={() => {
                      if (isNAValue) {
                        handleFieldChange(field.field_id, '');
                      } else {
                        handleFieldChange(field.field_id, 'N/A');
                      }
                    }}
                    className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      isNAValue
                        ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                    title={isNAValue ? 'Switch to Date' : 'Mark as N/A'}
                  >
                    {isNAValue ? 'Set Date' : 'Mark as N/A'}
                  </button>
                </div>
                <div className='self-start mt-1'>
                  {renderActionButtons(field.field_id)}
                </div>
                {renderInlineFollowUpQuestions &&
                  renderInlineFollowUpQuestions(field.field_id)}
              </div>
            </div>
          </HighlightedField>
        );
      }

      // Special handling for E.28 - Date format [YYYY-MM-DD] with N/A option
      if (field.field_id === 'E.28') {
        const currentValue = fieldText || getFieldValue(field.field_id);
        const isNAValue = currentValue === 'N/A';

        return (
          <HighlightedField key={field.field_id} fieldId={field.field_id}>
            <div className='mb-10'>
              <label
                className='block text-gray-700 font-semibold font-inter text-[16px] leading-[19px] text-black text-[20px] leading-[24px] mb-[10px] mb-5'
                htmlFor={`field-${field.field_id}`}
              >
                <span className='text-blue-500 font-mono mr-2'>
                  {field.field_id}:
                </span>
                {field.field_name}{' '}
                <span className='text-sm text-gray-500'>
                  [Format: YYYY-MM-DD]
                </span>
                <FlagIcon
                  fieldId={field.field_id}
                  section='partE'
                  sectionName='Part E'
                />
              </label>
              <div className='flex flex-col'>
                <div className='flex items-center gap-2'>
                  {isNAValue ? (
                    <input
                      type='text'
                      className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black flex-1 ${getHighlightClass(field.field_id)} cursor-not-allowed`}
                      value='N/A'
                      readOnly
                    />
                  ) : (
                    <input
                      type='date'
                      className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black flex-1 ${getHighlightClass(field.field_id)}`}
                      id={`field-${field.field_id}`}
                      defaultValue={currentValue || ''}
                      onChange={e =>
                        handleFieldChange(field.field_id, e.target.value)
                      }
                      placeholder='YYYY-MM-DD'
                    />
                  )}
                  <button
                    type='button'
                    onClick={() => {
                      if (isNAValue) {
                        handleFieldChange(field.field_id, '');
                      } else {
                        handleFieldChange(field.field_id, 'N/A');
                      }
                    }}
                    className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      isNAValue
                        ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                    title={isNAValue ? 'Switch to Date' : 'Mark as N/A'}
                  >
                    {isNAValue ? 'Set Date' : 'Mark as N/A'}
                  </button>
                </div>
                <div className='self-start mt-1'>
                  {renderActionButtons(field.field_id)}
                </div>
                {renderInlineFollowUpQuestions &&
                  renderInlineFollowUpQuestions(field.field_id)}
              </div>
            </div>
          </HighlightedField>
        );
      }

      // Special handling for E.13 - Investor type dropdown
      if (field.field_id === 'E.13') {
        const isE13Accepted =
          acceptedFields.includes(field.field_id) ||
          acceptedFields.includes(alternateFieldId);
        const isE13Improved =
          improvedFields.includes(field.field_id) ||
          improvedFields.includes(alternateFieldId);
        const isE13Confirmed =
          fieldDataItem?.confirmed_correct === true ||
          fieldDataItem?.confirmed_correct === 'true' ||
          fieldDataItem?.confirmed_correct == true;
        const e13BackgroundClasses =
          isE13Accepted || isE13Improved || isE13Confirmed
            ? 'bg-white border-gray-300'
            : backgroundColorClasses;

        return (
          <HighlightedField key={field.field_id} fieldId={field.field_id}>
            <div className='mb-10'>
              <label
                className='block text-gray-700 font-semibold font-inter text-[16px] leading-[19px] text-black text-[20px] leading-[24px] mb-[10px] mb-5'
                htmlFor={`field-${field.field_id}`}
              >
                <span className='text-blue-500 font-mono mr-2'>
                  {field.field_id}:
                </span>{' '}
                {field.field_name}
                <FlagIcon
                  fieldId={field.field_id}
                  section='partE'
                  sectionName='Part E'
                />
              </label>
              <div className='flex flex-col'>
                <select
                  className={`${e13BackgroundClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
                  id={`field-${field.field_id}`}
                  defaultValue={
                    fieldText || getFieldValue(field.field_id, 'RETL')
                  }
                  onChange={e =>
                    handleFieldChange(field.field_id, e.target.value)
                  }
                >
                  <option value='RETL'>Retail investors</option>
                  <option value='PROF'>Professional investors</option>
                  <option value='ALL'>All types of investors</option>
                  <option value='N/A'>N/A</option>
                </select>
                <div className='self-start mt-1'>
                  {renderActionButtons(field.field_id)}
                </div>
                {renderInlineFollowUpQuestions &&
                  renderInlineFollowUpQuestions(field.field_id)}
              </div>
            </div>
          </HighlightedField>
        );
      }

      // Special handling for E.34 - depends on E.33 value
      if (field.field_id === 'E.34') {
        // Get E.33 value from fieldData
        const e33FieldData = fieldData['E.33'];
        const e33Value = e33FieldData ? e33FieldData.field_text : null;
        const isE33NA =
          e33Value === 'N/A' || String(e33Value).trim().toUpperCase() === 'N/A';

        // If E.33 is N/A, E.34 should be N/A and disabled
        if (isE33NA) {
          return (
            <HighlightedField key={field.field_id} fieldId={field.field_id}>
              <div className='mb-10'>
                <label
                  className='block text-gray-700 font-semibold font-inter text-[16px] leading-[19px] text-black text-[20px] leading-[24px] mb-[10px] mb-5'
                  htmlFor={`field-${field.field_id}`}
                >
                  <span className='text-blue-500 font-mono mr-2'>
                    {field.field_id}:
                  </span>
                  {field.field_name}
                  <FlagIcon
                    fieldId={field.field_id}
                    section='partE'
                    sectionName='Part E'
                  />
                </label>
                <textarea
                  className='bg-white border border-gray-300 p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-full resize-none overflow-hidden'
                  id={`field-${field.field_id}`}
                  value='N/A'
                  readOnly={true}
                  placeholder='N/A (depends on E.33 not being N/A)'
                ></textarea>
                <div className='text-sm text-gray-500 mt-1'>
                  This field is automatically set to N/A because E.33 is N/A.
                  Change E.33 to enable editing.
                </div>
              </div>
            </HighlightedField>
          );
        }

        // If E.33 is not N/A, render E.34 as normal editable textarea
        return (
          <HighlightedField key={field.field_id} fieldId={field.field_id}>
            <div className='mb-10'>
              <label
                className='block text-gray-700 font-semibold font-inter text-[16px] leading-[19px] text-black text-[20px] leading-[24px] mb-[10px] mb-5'
                htmlFor={`field-${field.field_id}`}
              >
                <span className='text-blue-500 font-mono mr-2'>
                  {field.field_id}:
                </span>{' '}
                {field.field_name}
                <FlagIcon
                  fieldId={field.field_id}
                  section='partE'
                  sectionName='Part E'
                />
              </label>
              <div className='flex flex-col'>
                <div className='flex items-start gap-2'>
                  {(fieldText || getFieldValue(field.field_id)) === 'N/A' ? (
                    <textarea
                      className={`${backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full resize-none overflow-hidden flex-1 ${getHighlightClass(field.field_id)} cursor-not-allowed`}
                      rows='2'
                      cols='50'
                      id={`field-${field.field_id}`}
                      value='N/A'
                      readOnly={true}
                    ></textarea>
                  ) : (
                    <textarea
                      className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full resize-none overflow-hidden flex-1 ${getHighlightClass(field.field_id)}`}
                      rows='2'
                      cols='50'
                      id={`field-${field.field_id}`}
                      defaultValue={fieldText || getFieldValue(field.field_id)}
                      onChange={e => handleTextareaChange(field.field_id, e)}
                      onInput={e => autoResizeTextarea(e.target)}
                      ref={textarea => {
                        if (textarea) {
                          setTimeout(() => autoResizeTextarea(textarea), 0);
                        }
                      }}
                      spellCheck='false'
                      placeholder={
                        !fieldText && !getFieldValue(field.field_id)
                          ? 'Answer follow-up questions in order to generate a fill-out'
                          : ''
                      }
                    ></textarea>
                  )}
                  <button
                    type='button'
                    onClick={() => {
                      if (
                        (fieldText || getFieldValue(field.field_id)) === 'N/A'
                      ) {
                        handleFieldChange(field.field_id, '');
                      } else {
                        handleFieldChange(field.field_id, 'N/A');
                      }
                    }}
                    className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      (fieldText || getFieldValue(field.field_id)) === 'N/A'
                        ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                    title={
                      (fieldText || getFieldValue(field.field_id)) === 'N/A'
                        ? 'Switch to Text'
                        : 'Mark as N/A'
                    }
                  >
                    {(fieldText || getFieldValue(field.field_id)) === 'N/A'
                      ? 'Set Text'
                      : 'Mark as N/A'}
                  </button>
                </div>
                <div className='self-start mt-1'>
                  {renderActionButtons(field.field_id)}
                </div>
                {renderInlineFollowUpQuestions &&
                  renderInlineFollowUpQuestions(field.field_id)}
              </div>
            </div>
          </HighlightedField>
        );
      }

      // Special handling for E.39 - Country dropdown with search (same as G.19)
      if (field.field_id === 'E.39') {
        const filteredCountries = countries.filter(country =>
          country.toLowerCase().includes(searchTermE39.toLowerCase())
        );

        return (
          <HighlightedField key={field.field_id} fieldId={field.field_id}>
            <div className='mb-10'>
              <label
                className='block text-gray-700 font-semibold font-inter text-[16px] leading-[19px] text-black text-[20px] leading-[24px] mb-[10px] mb-5'
                htmlFor={`field-${field.field_id}`}
              >
                <span className='text-blue-500 font-mono mr-2'>
                  {field.field_id}:
                </span>{' '}
                {field.field_name}
                <FlagIcon
                  fieldId={field.field_id}
                  section='partE'
                  sectionName='Part E'
                />
              </label>
              <div className='flex flex-col relative dropdown-container-e39'>
                {/* Search input */}
                <div className='relative'>
                  <input
                    type='text'
                    className={`${backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full`}
                    placeholder='Search countries...'
                    value={searchTermE39}
                    onChange={e => setSearchTermE39(e.target.value)}
                    onFocus={() => setShowDropdownE39(true)}
                  />
                </div>

                {/* Dropdown with search results */}
                {showDropdownE39 && (
                  <div className='absolute top-full left-0 right-0 bg-white border border-[rgba(99,93,255,0.5)] rounded-b-[7px] max-h-[200px] overflow-y-auto z-10 mt-[-1px]'>
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map(country => (
                        <div
                          key={country}
                          className='p-2 hover:bg-[rgba(99,93,255,0.1)] cursor-pointer'
                          onClick={() => {
                            handleCountrySelect(field.field_id, country);
                            setSearchTermE39('');
                            setShowDropdownE39(false);
                          }}
                          role='button'
                          tabIndex={0}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCountrySelect(field.field_id, country);
                              setSearchTermE39('');
                              setShowDropdownE39(false);
                            }
                          }}
                        >
                          {country}
                        </div>
                      ))
                    ) : (
                      <div className='p-2 text-gray-500'>
                        No countries found
                      </div>
                    )}
                  </div>
                )}

                {/* Selected countries display */}
                <div
                  className={`flex flex-wrap gap-2 mt-3 min-h-[40px] p-2 border rounded-[7px] ${backgroundColorClasses}`}
                >
                  {selectedCountriesE39.length > 0 ? (
                    selectedCountriesE39.map(country => (
                      <div key={country} className='country-tag'>
                        {country}
                        <button
                          type='button'
                          onClick={() =>
                            handleCountryRemove(field.field_id, country)
                          }
                          className='country-tag-remove-btn'
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className='text-gray-500 italic'>
                      No countries selected
                    </div>
                  )}
                </div>

                {/* Hidden input to store actual value */}
                <input
                  type='hidden'
                  id={`field-${field.field_id}`}
                  value={selectedCountriesE39.join(', ')}
                />

                <div className='self-start mt-1'>
                  {renderActionButtons(field.field_id)}
                </div>
                {renderInlineFollowUpQuestions &&
                  renderInlineFollowUpQuestions(field.field_id)}
              </div>
            </div>
          </HighlightedField>
        );
      }

      return (
        <HighlightedField key={field.field_id} fieldId={field.field_id}>
          <div className='mb-10'>
            <label
              className='block text-gray-700 font-semibold font-inter text-[16px] leading-[19px] text-black text-[20px] leading-[24px] mb-[10px] mb-5'
              htmlFor={`field-${field.field_id}`}
            >
              <span className='text-blue-500 font-mono mr-2'>
                {field.field_id}:
              </span>{' '}
              {field.field_name}
              <FlagIcon
                fieldId={field.field_id}
                section='partE'
                sectionName='Part E'
              />
            </label>
            <div className='flex flex-col'>
              <div className='flex items-start gap-2'>
                {(fieldText || getFieldValue(field.field_id)) === 'N/A' ? (
                  <textarea
                    className={`${backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full resize-none overflow-hidden flex-1 ${getHighlightClass(field.field_id)} cursor-not-allowed`}
                    rows='2'
                    cols='50'
                    id={`field-${field.field_id}`}
                    value='N/A'
                    readOnly={true}
                  ></textarea>
                ) : (
                  <textarea
                    className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full resize-none overflow-hidden flex-1 ${getHighlightClass(field.field_id)}`}
                    rows='2'
                    cols='50'
                    id={`field-${field.field_id}`}
                    defaultValue={fieldText || getFieldValue(field.field_id)}
                    onChange={e => handleTextareaChange(field.field_id, e)}
                    onInput={e => autoResizeTextarea(e.target)}
                    ref={textarea => {
                      if (textarea) {
                        setTimeout(() => autoResizeTextarea(textarea), 0);
                      }
                    }}
                    spellCheck='false'
                    placeholder={
                      !fieldText && !getFieldValue(field.field_id)
                        ? 'Answer follow-up questions in order to generate a fill-out'
                        : ''
                    }
                  ></textarea>
                )}
                <button
                  type='button'
                  onClick={() => {
                    if (
                      (fieldText || getFieldValue(field.field_id)) === 'N/A'
                    ) {
                      handleFieldChange(field.field_id, '');
                    } else {
                      handleFieldChange(field.field_id, 'N/A');
                    }
                  }}
                  className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                    (fieldText || getFieldValue(field.field_id)) === 'N/A'
                      ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                  title={
                    (fieldText || getFieldValue(field.field_id)) === 'N/A'
                      ? 'Switch to Text'
                      : 'Mark as N/A'
                  }
                >
                  {(fieldText || getFieldValue(field.field_id)) === 'N/A'
                    ? 'Set Text'
                    : 'Mark as N/A'}
                </button>
              </div>
              <div className='self-start mt-1'>
                {renderActionButtons(field.field_id)}
              </div>
              {renderInlineFollowUpQuestions &&
                renderInlineFollowUpQuestions(field.field_id)}
            </div>
          </div>
        </HighlightedField>
      );
    });
  };
  const renderBreadcrumb = () => {
    return <BreadcrumbNav currentPageName='Part E' additionalCrumbs={[]} />;
  };

  // Custom function to get unresolved fields, excluding E.34 when E.33 is N/A
  const getCustomUnresolvedFields = () => {
    // Get the default unresolved fields first
    const currentSectionFieldIds = fields.map(field => field.field_id);

    const unresolvedFields = currentSectionFieldIds.filter(fieldId => {
      // Skip E.34 if E.33 is N/A
      if (fieldId === 'E.34') {
        const e33FieldData = fieldData['E.33'];
        const e33Value = e33FieldData ? e33FieldData.field_text : null;
        const isE33NA =
          e33Value === 'N/A' || String(e33Value).trim().toUpperCase() === 'N/A';

        // If E.33 is N/A, exclude E.34 from validation
        if (isE33NA) {
          return false;
        }
      }

      // Apply the same logic as BaseSectionComponent
      const normalizedFieldId = fieldId;
      const alternateFieldId = fieldId.includes('.0')
        ? fieldId.replace(/\.0(\d)/, '.$1')
        : fieldId.replace(/\.(\d)$/, '.0$1');

      // Get the field data using either format
      const field = fieldData[normalizedFieldId] || fieldData[alternateFieldId];

      // Check if this field has unanswered questions and hasn't been addressed
      const hasUnansweredQuestions =
        field &&
        field.unanswered_questions &&
        field.unanswered_questions.length > 0;

      const isAccepted =
        acceptedFields.includes(normalizedFieldId) ||
        acceptedFields.includes(alternateFieldId);

      const isImproved =
        improvedFields.includes(normalizedFieldId) ||
        improvedFields.includes(alternateFieldId);

      return hasUnansweredQuestions && !isAccepted && !isImproved;
    });

    return unresolvedFields;
  };

  // Return a BaseSectionComponent instance with our custom props
  return (
    <BaseSectionComponent
      {...props}
      {...sectionConfig}
      api={api}
      getCustomUnresolvedFields={getCustomUnresolvedFields}
      renderBreadcrumb={renderBreadcrumb}
      renderFields={baseProps =>
        renderFields({
          ...baseProps,
          getFieldValue:
            props.getFieldValue ||
            baseProps.getFieldValue ||
            ((key, defaultValue = '') => defaultValue),
          getHighlightClass:
            props.getHighlightClass ||
            baseProps.getHighlightClass ||
            (() => ''),
          renderActionButtons:
            props.renderActionButtons ||
            baseProps.renderActionButtons ||
            (() => null),
          renderInlineFollowUpQuestions:
            baseProps.renderInlineFollowUpQuestions,
          fields: fields || [],
        })
      }
    />
  );
};

export default PartE;
