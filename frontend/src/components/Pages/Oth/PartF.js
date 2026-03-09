// src/components/Dashboard.js
import { useEffect, useState } from 'react';
import { useDataContext } from '../../../context/DataContext';
import { useApi } from '../../../services/api';
import BaseSectionComponent from '../../BaseSectionComponent';
import BreadcrumbNav from '../../Common/BreadcrumbNav';
import FlagIcon from '../../Common/FlagIcon';
import HighlightedField from '../../Common/HighlightedField';

// Create a simplified PartF component using the BaseSectionComponent
const PartF = props => {
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

  // List of all countries
  const countries = [
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

  // List of EU countries for F.18 and F.19
  const euCountries = [
    'Austria',
    'Belgium',
    'Bulgaria',
    'Croatia',
    'Cyprus',
    'Czech Republic',
    'Denmark',
    'Estonia',
    'Finland',
    'France',
    'Germany',
    'Greece',
    'Hungary',
    'Ireland',
    'Italy',
    'Latvia',
    'Lithuania',
    'Luxembourg',
    'Malta',
    'Netherlands',
    'Poland',
    'Portugal',
    'Romania',
    'Slovakia',
    'Slovenia',
    'Spain',
    'Sweden',
  ];

  // State for country picker for F.18 and F.19
  const [searchTermF18, setSearchTermF18] = useState('');
  const [selectedCountriesF18, setSelectedCountriesF18] = useState([]);
  const [showDropdownF18, setShowDropdownF18] = useState(false);

  // State for F.19 (existing - now using euCountries)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch fields when component mounts
  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setIsLoading(true);
    try {
      // Use the API service instead of direct fetch
      const data = await api.getSectionFields(8);
      console.log('PartF fetched fields:', data);
      setFields(data.fields || []);
      setIsLoading(false);
      if (fieldDataError) {
        setError(`Error loading field data: ${fieldDataError}`);
      }
    } catch (error) {
      console.error('Error fetching data for PartF:', error);
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

  // Define the section-specific configuration
  const sectionConfig = {
    sectionNumber: 8,
    sectionTitle: 'Part F: Information about the crypto-assets',
    sectionDescription: 'Please fill in these sections',
    nextRoute: '/oth/partG',
  };

  // Handle field value change for countries
  const handleCountrySelect = (fieldId, country) => {
    if (fieldId === 'F.18') {
      // Handle F.18 country selection
      const updatedCountries = [...selectedCountriesF18];
      if (!updatedCountries.includes(country)) {
        updatedCountries.push(country);
        setSelectedCountriesF18(updatedCountries);
        const countriesString = updatedCountries.join(', ');
        handleFieldChange(fieldId, countriesString);
      }
    } else if (fieldId === 'F.19') {
      // Handle F.19 country selection
      const updatedCountries = [...selectedCountries];
      if (!updatedCountries.includes(country)) {
        updatedCountries.push(country);
        setSelectedCountries(updatedCountries);
        const countriesString = updatedCountries.join(', ');
        handleFieldChange(fieldId, countriesString);
      }
    }
  };

  // Handle removing a country
  const handleCountryRemove = (fieldId, country) => {
    if (fieldId === 'F.18') {
      const updatedCountries = selectedCountriesF18.filter(c => c !== country);
      setSelectedCountriesF18(updatedCountries);
      const countriesString = updatedCountries.join(', ');
      handleFieldChange(fieldId, countriesString);
    } else if (fieldId === 'F.19') {
      const updatedCountries = selectedCountries.filter(c => c !== country);
      setSelectedCountries(updatedCountries);
      const countriesString = updatedCountries.join(', ');
      handleFieldChange(fieldId, countriesString);
    }
  };

  // Initialize selected countries from field data when component mounts
  useEffect(() => {
    if (fieldData && fieldData['F.18'] && fieldData['F.18'].field_text) {
      const countriesText = fieldData['F.18'].field_text;
      const countriesArray = countriesText
        .split(', ')
        .filter(c => c.trim() !== '');
      setSelectedCountriesF18(countriesArray);
    }
    if (fieldData && fieldData['F.19'] && fieldData['F.19'].field_text) {
      const countriesText = fieldData['F.19'].field_text;
      const countriesArray = countriesText
        .split(', ')
        .filter(c => c.trim() !== '');
      setSelectedCountries(countriesArray);
    }
  }, [fieldData]);

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

      // Special handling for F.9 - Date format [YYYY-MM-DD]
      if (field.field_id === 'F.9') {
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
                  section='partF'
                  sectionName='Part F'
                />
              </label>
              <div className='flex flex-col'>
                <input
                  type='date'
                  className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
                  id={`field-${field.field_id}`}
                  defaultValue={fieldText || getFieldValue(field.field_id)}
                  onChange={e =>
                    handleFieldChange(field.field_id, e.target.value)
                  }
                  placeholder='YYYY-MM-DD'
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

      // Special handling for F.10 - Date format [YYYY-MM-DD]
      if (field.field_id === 'F.10') {
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
                  section='partF'
                  sectionName='Part F'
                />
              </label>
              <div className='flex flex-col'>
                <input
                  type='date'
                  className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
                  id={`field-${field.field_id}`}
                  defaultValue={fieldText || getFieldValue(field.field_id)}
                  onChange={e =>
                    handleFieldChange(field.field_id, e.target.value)
                  }
                  placeholder='YYYY-MM-DD'
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

      // Special handling for F.15 - True or False dropdown
      if (field.field_id === 'F.15') {
        const isF15Accepted =
          acceptedFields.includes(field.field_id) ||
          acceptedFields.includes(alternateFieldId);
        const isF15Improved =
          improvedFields.includes(field.field_id) ||
          improvedFields.includes(alternateFieldId);
        const isF15Confirmed =
          fieldDataItem?.confirmed_correct === true ||
          fieldDataItem?.confirmed_correct === 'true' ||
          fieldDataItem?.confirmed_correct == true;
        const f15BackgroundClasses =
          isF15Accepted || isF15Improved || isF15Confirmed
            ? 'bg-white border-gray-300'
            : backgroundColorClasses;

        // Normalize the value to uppercase "TRUE" or "FALSE" regardless of input format
        const normalizeValue = value => {
          if (!value) return 'FALSE'; // Default to FALSE if empty

          // Handle string boolean values
          if (typeof value === 'string') {
            return value.trim().toUpperCase() === 'TRUE' ? 'TRUE' : 'FALSE';
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
                  section='partF'
                  sectionName='Part F'
                />
              </label>
              <div className='flex flex-col'>
                <select
                  className={`${f15BackgroundClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
                  id={`field-${field.field_id}`}
                  value={currentValue}
                  onChange={e =>
                    handleFieldChange(field.field_id, e.target.value)
                  }
                >
                  <option value='TRUE'>True</option>
                  <option value='FALSE'>False</option>
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

      // Special handling for F.16 - True or False dropdown
      if (field.field_id === 'F.16') {
        const isF16Accepted =
          acceptedFields.includes(field.field_id) ||
          acceptedFields.includes(alternateFieldId);
        const isF16Improved =
          improvedFields.includes(field.field_id) ||
          improvedFields.includes(alternateFieldId);
        const isF16Confirmed =
          fieldDataItem?.confirmed_correct === true ||
          fieldDataItem?.confirmed_correct === 'true' ||
          fieldDataItem?.confirmed_correct == true;
        const f16BackgroundClasses =
          isF16Accepted || isF16Improved || isF16Confirmed
            ? 'bg-white border-gray-300'
            : backgroundColorClasses;

        // Normalize the value to uppercase "TRUE" or "FALSE" regardless of input format
        const normalizeValue = value => {
          if (!value) return 'FALSE'; // Default to FALSE if empty

          // Handle string boolean values
          if (typeof value === 'string') {
            return value.trim().toUpperCase() === 'TRUE' ? 'TRUE' : 'FALSE';
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
                  section='partF'
                  sectionName='Part F'
                />
              </label>
              <div className='flex flex-col'>
                <select
                  className={`${f16BackgroundClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
                  id={`field-${field.field_id}`}
                  value={currentValue}
                  onChange={e =>
                    handleFieldChange(field.field_id, e.target.value)
                  }
                >
                  <option value='TRUE'>True</option>
                  <option value='FALSE'>False</option>
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

      // Special handling for F.17 - True or False dropdown
      if (field.field_id === 'F.17') {
        const isF17Accepted =
          acceptedFields.includes(field.field_id) ||
          acceptedFields.includes(alternateFieldId);
        const isF17Improved =
          improvedFields.includes(field.field_id) ||
          improvedFields.includes(alternateFieldId);
        const isF17Confirmed =
          fieldDataItem?.confirmed_correct === true ||
          fieldDataItem?.confirmed_correct === 'true' ||
          fieldDataItem?.confirmed_correct == true;
        const f17BackgroundClasses =
          isF17Accepted || isF17Improved || isF17Confirmed
            ? 'bg-white border-gray-300'
            : backgroundColorClasses;

        // Normalize the value to uppercase "TRUE" or "FALSE" regardless of input format
        const normalizeValue = value => {
          if (!value) return 'FALSE'; // Default to FALSE if empty

          // Handle string boolean values
          if (typeof value === 'string') {
            return value.trim().toUpperCase() === 'TRUE' ? 'TRUE' : 'FALSE';
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
                  section='partF'
                  sectionName='Part F'
                />
              </label>
              <div className='flex flex-col'>
                <select
                  className={`${f17BackgroundClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
                  id={`field-${field.field_id}`}
                  value={currentValue}
                  onChange={e =>
                    handleFieldChange(field.field_id, e.target.value)
                  }
                >
                  <option value='TRUE'>True</option>
                  <option value='FALSE'>False</option>
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

      // Special handling for F.18 - EU Country dropdown with search
      if (field.field_id === 'F.18') {
        const filteredCountries = euCountries.filter(country =>
          country.toLowerCase().includes(searchTermF18.toLowerCase())
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
                  section='partF'
                  sectionName='Part F'
                />
              </label>
              <div className='flex flex-col relative dropdown-container-f18'>
                {/* Search input */}
                <div className='relative'>
                  <input
                    type='text'
                    className={`${backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full`}
                    placeholder='Search EU countries...'
                    value={searchTermF18}
                    onChange={e => setSearchTermF18(e.target.value)}
                    onFocus={() => setShowDropdownF18(true)}
                  />
                </div>

                {/* Dropdown with search results */}
                {showDropdownF18 && (
                  <div className='absolute top-full left-0 right-0 bg-white border border-[rgba(99,93,255,0.5)] rounded-b-[7px] max-h-[200px] overflow-y-auto z-10 mt-[-1px]'>
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map(country => (
                        <div
                          key={country}
                          className='p-2 hover:bg-[rgba(99,93,255,0.1)] cursor-pointer'
                          onClick={() => {
                            handleCountrySelect(field.field_id, country);
                            setSearchTermF18('');
                            setShowDropdownF18(false);
                          }}
                          role='button'
                          tabIndex={0}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCountrySelect(field.field_id, country);
                              setSearchTermF18('');
                              setShowDropdownF18(false);
                            }
                          }}
                        >
                          {country}
                        </div>
                      ))
                    ) : (
                      <div className='p-2 text-gray-500'>
                        No EU countries found
                      </div>
                    )}
                  </div>
                )}

                {/* Selected countries display */}
                <div
                  className={`flex flex-wrap gap-2 mt-3 min-h-[40px] p-2 border rounded-[7px] ${backgroundColorClasses}`}
                >
                  {selectedCountriesF18.length > 0 ? (
                    selectedCountriesF18.map(country => (
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
                      No EU countries selected
                    </div>
                  )}
                </div>

                {/* Hidden input to store actual value */}
                <input
                  type='hidden'
                  id={`field-${field.field_id}`}
                  value={selectedCountriesF18.join(', ')}
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

      // Special handling for F.19 - EU Country dropdown with search
      if (field.field_id === 'F.19') {
        const filteredCountries = euCountries.filter(country =>
          country.toLowerCase().includes(searchTerm.toLowerCase())
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
                  section='partF'
                  sectionName='Part F'
                />
              </label>
              <div className='flex flex-col relative'>
                {/* Search input */}
                <div className='relative'>
                  <input
                    type='text'
                    className={`${backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full`}
                    placeholder='Search EU countries...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                  />
                </div>

                {/* Dropdown with search results */}
                {showDropdown && (
                  <div className='absolute top-full left-0 right-0 bg-white border border-[rgba(99,93,255,0.5)] rounded-b-[7px] max-h-[200px] overflow-y-auto z-10 mt-[-1px]'>
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map(country => (
                        <div
                          key={country}
                          className='p-2 hover:bg-[rgba(99,93,255,0.1)] cursor-pointer'
                          onClick={() => {
                            handleCountrySelect(field.field_id, country);
                            setSearchTerm('');
                            setShowDropdown(false);
                          }}
                          role='button'
                          tabIndex={0}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCountrySelect(field.field_id, country);
                              setSearchTerm('');
                              setShowDropdown(false);
                            }
                          }}
                        >
                          {country}
                        </div>
                      ))
                    ) : (
                      <div className='p-2 text-gray-500'>
                        No EU countries found
                      </div>
                    )}
                  </div>
                )}

                {/* Selected countries display */}
                <div
                  className={`flex flex-wrap gap-2 mt-3 min-h-[40px] p-2 border rounded-[7px] ${backgroundColorClasses}`}
                >
                  {selectedCountries.length > 0 ? (
                    selectedCountries.map(country => (
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
                      No EU countries selected
                    </div>
                  )}
                </div>

                {/* Hidden input to store actual value */}
                <input
                  type='hidden'
                  id={`field-${field.field_id}`}
                  value={selectedCountries.join(', ')}
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
                section='partF'
                sectionName='Part F'
              />
            </label>
            <div className='flex flex-col'>
              <textarea
                className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full resize-none overflow-hidden ${getHighlightClass(field.field_id)}`}
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
    return <BreadcrumbNav currentPageName='Part F' additionalCrumbs={[]} />;
  };

  // Hide dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      // Handle F.18 dropdown
      if (!event.target.closest('.dropdown-container-f18')) {
        setShowDropdownF18(false);
      }

      // Handle F.19 dropdown (existing)
      const dropdown = document.getElementById('countries-dropdown');
      if (dropdown && !dropdown.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Return a BaseSectionComponent instance with our custom props
  return (
    <BaseSectionComponent
      {...props}
      {...sectionConfig}
      api={api}
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

export default PartF;
