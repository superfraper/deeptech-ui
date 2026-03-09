import { useEffect, useState } from 'react';
import { useDataContext } from '../../../context/DataContext';
import { useApi } from '../../../services/api';
import BaseSectionComponent from '../../BaseSectionComponent';
import BreadcrumbNav from '../../Common/BreadcrumbNav';
import FlagIcon from '../../Common/FlagIcon';
import HighlightedField from '../../Common/HighlightedField';

const PartG = props => {
  const api = useApi();
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

  // State for country picker for G.18 and G.19
  const [searchTermG18, setSearchTermG18] = useState('');
  const [selectedCountriesG18, setSelectedCountriesG18] = useState([]);
  const [showDropdownG18, setShowDropdownG18] = useState(false);

  const [searchTermG19, setSearchTermG19] = useState('');
  const [selectedCountriesG19, setSelectedCountriesG19] = useState([]);
  const [showDropdownG19, setShowDropdownG19] = useState(false);

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSectionFields(10);
      console.log('PartG fetched fields:', data);
      setFields(data.fields || []);
      setIsLoading(false);
      if (fieldDataError) {
        setError(`Error loading field data: ${fieldDataError}`);
      }
    } catch (error) {
      console.error('Error fetching data for PartG:', error);
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

  const handleFieldChange = (fieldId, value) => {
    setFieldData(prevData => {
      const updatedData = {
        ...prevData,
        [fieldId]: {
          ...prevData[fieldId],
          field_text: value,
        },
      };

      saveUserContextData();

      return updatedData;
    });
  };

  // Handle textarea change with auto-resize
  const handleTextareaChange = (fieldId, event) => {
    handleFieldChange(fieldId, event.target.value);
    autoResizeTextarea(event.target);
  };

  const sectionConfig = {
    sectionNumber: 10,
    sectionTitle:
      'Part G: Information on the rights and obligations attached to the crypto-assets',
    sectionDescription: 'Please fill in these sections',
    nextRoute: '/oth/partH',
  };

  // Handle field value change for countries
  const handleCountrySelect = (fieldId, country) => {
    if (fieldId === 'G.18') {
      const updatedCountries = [...selectedCountriesG18];
      if (!updatedCountries.includes(country)) {
        updatedCountries.push(country);
        setSelectedCountriesG18(updatedCountries);
        const countriesString = updatedCountries.join(', ');
        handleFieldChange(fieldId, countriesString);
      }
    } else if (fieldId === 'G.19') {
      const updatedCountries = [...selectedCountriesG19];
      if (!updatedCountries.includes(country)) {
        updatedCountries.push(country);
        setSelectedCountriesG19(updatedCountries);
        const countriesString = updatedCountries.join(', ');
        handleFieldChange(fieldId, countriesString);
      }
    }
  };

  // Handle removing a country
  const handleCountryRemove = (fieldId, country) => {
    if (fieldId === 'G.18') {
      const updatedCountries = selectedCountriesG18.filter(c => c !== country);
      setSelectedCountriesG18(updatedCountries);
      const countriesString = updatedCountries.join(', ');
      handleFieldChange(fieldId, countriesString);
    } else if (fieldId === 'G.19') {
      const updatedCountries = selectedCountriesG19.filter(c => c !== country);
      setSelectedCountriesG19(updatedCountries);
      const countriesString = updatedCountries.join(', ');
      handleFieldChange(fieldId, countriesString);
    }
  };

  // Initialize selected countries from field data when component mounts
  useEffect(() => {
    if (fieldData && fieldData['G.18'] && fieldData['G.18'].field_text) {
      const countriesText = fieldData['G.18'].field_text;
      const countriesArray = countriesText
        .split(', ')
        .filter(c => c.trim() !== '');
      setSelectedCountriesG18(countriesArray);
    }
    if (fieldData && fieldData['G.19'] && fieldData['G.19'].field_text) {
      const countriesText = fieldData['G.19'].field_text;
      const countriesArray = countriesText
        .split(', ')
        .filter(c => c.trim() !== '');
      setSelectedCountriesG19(countriesArray);
    }
  }, [fieldData]);

  const renderFields = baseProps => {
    const {
      getFieldValue,
      getHighlightClass,
      renderActionButtons,
      renderInlineFollowUpQuestions,
    } = baseProps;

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

      // Special handling for G.6 - True or False dropdown
      if (field.field_id === 'G.6') {
        const isG6Accepted =
          acceptedFields.includes(field.field_id) ||
          acceptedFields.includes(alternateFieldId);
        const isG6Improved =
          improvedFields.includes(field.field_id) ||
          improvedFields.includes(alternateFieldId);
        const isG6Confirmed =
          fieldDataItem?.confirmed_correct === true ||
          fieldDataItem?.confirmed_correct === 'true' ||
          fieldDataItem?.confirmed_correct == true;
        const g6BackgroundClasses =
          isG6Accepted || isG6Improved || isG6Confirmed
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
                  section='partG'
                  sectionName='Part G'
                />
              </label>
              <div className='flex flex-col'>
                <select
                  className={`${g6BackgroundClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
                  id={`field-${field.field_id}`}
                  value={currentValue}
                  onChange={e =>
                    handleFieldChange(field.field_id, e.target.value)
                  }
                >
                  <option value='FALSE'>False</option>
                  <option value='TRUE'>True</option>
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

      // Special handling for G.9 - True, False, or N/A dropdown
      if (field.field_id === 'G.9') {
        const isG9Accepted =
          acceptedFields.includes(field.field_id) ||
          acceptedFields.includes(alternateFieldId);
        const isG9Improved =
          improvedFields.includes(field.field_id) ||
          improvedFields.includes(alternateFieldId);
        const isG9Confirmed =
          fieldDataItem?.confirmed_correct === true ||
          fieldDataItem?.confirmed_correct === 'true' ||
          fieldDataItem?.confirmed_correct == true;
        const g9BackgroundClasses =
          isG9Accepted || isG9Improved || isG9Confirmed
            ? 'bg-white border-gray-300'
            : backgroundColorClasses;

        // Normalize the value to uppercase "TRUE", "FALSE" or "N/A" regardless of input format
        const normalizeValue = value => {
          if (!value) return 'FALSE'; // Default to FALSE if empty

          // Handle string values
          if (typeof value === 'string') {
            const upperValue = value.trim().toUpperCase();
            if (upperValue === 'N/A' || upperValue === 'NA') return 'N/A';
            return upperValue === 'TRUE' ? 'TRUE' : 'FALSE';
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
                  section='partG'
                  sectionName='Part G'
                />
              </label>
              <div className='flex flex-col'>
                <select
                  className={`${g9BackgroundClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
                  id={`field-${field.field_id}`}
                  value={currentValue}
                  onChange={e =>
                    handleFieldChange(field.field_id, e.target.value)
                  }
                >
                  <option value='TRUE'>TRUE</option>
                  <option value='FALSE'>FALSE</option>
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

      // Special handling for G.12 - True or False dropdown
      if (field.field_id === 'G.12') {
        const isG12Accepted =
          acceptedFields.includes(field.field_id) ||
          acceptedFields.includes(alternateFieldId);
        const isG12Improved =
          improvedFields.includes(field.field_id) ||
          improvedFields.includes(alternateFieldId);
        const isG12Confirmed =
          fieldDataItem?.confirmed_correct === true ||
          fieldDataItem?.confirmed_correct === 'true' ||
          fieldDataItem?.confirmed_correct == true;
        const g12BackgroundClasses =
          isG12Accepted || isG12Improved || isG12Confirmed
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
                  section='partG'
                  sectionName='Part G'
                />
              </label>
              <div className='flex flex-col'>
                <select
                  className={`${g12BackgroundClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
                  id={`field-${field.field_id}`}
                  value={currentValue}
                  onChange={e =>
                    handleFieldChange(field.field_id, e.target.value)
                  }
                >
                  <option value='FALSE'>False</option>
                  <option value='TRUE'>True</option>
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

      // Special handling for G.14 - True or False dropdown
      if (field.field_id === 'G.14') {
        const isG14Accepted =
          acceptedFields.includes(field.field_id) ||
          acceptedFields.includes(alternateFieldId);
        const isG14Improved =
          improvedFields.includes(field.field_id) ||
          improvedFields.includes(alternateFieldId);
        const isG14Confirmed =
          fieldDataItem?.confirmed_correct === true ||
          fieldDataItem?.confirmed_correct === 'true' ||
          fieldDataItem?.confirmed_correct == true;
        const g14BackgroundClasses =
          isG14Accepted || isG14Improved || isG14Confirmed
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
                  section='partG'
                  sectionName='Part G'
                />
              </label>
              <div className='flex flex-col'>
                <select
                  className={`${g14BackgroundClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
                  id={`field-${field.field_id}`}
                  value={currentValue}
                  onChange={e =>
                    handleFieldChange(field.field_id, e.target.value)
                  }
                >
                  <option value='FALSE'>False</option>
                  <option value='TRUE'>True</option>
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

      // Special handling for G.16 - True or False dropdown
      if (field.field_id === 'G.16') {
        const isG16Accepted =
          acceptedFields.includes(field.field_id) ||
          acceptedFields.includes(alternateFieldId);
        const isG16Improved =
          improvedFields.includes(field.field_id) ||
          improvedFields.includes(alternateFieldId);
        const isG16Confirmed =
          fieldDataItem?.confirmed_correct === true ||
          fieldDataItem?.confirmed_correct === 'true' ||
          fieldDataItem?.confirmed_correct == true;
        const g16BackgroundClasses =
          isG16Accepted || isG16Improved || isG16Confirmed
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
                  section='partG'
                  sectionName='Part G'
                />
              </label>
              <div className='flex flex-col'>
                <select
                  className={`${g16BackgroundClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
                  id={`field-${field.field_id}`}
                  value={currentValue}
                  onChange={e =>
                    handleFieldChange(field.field_id, e.target.value)
                  }
                >
                  <option value='FALSE'>False</option>
                  <option value='TRUE'>True</option>
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

      // Special handling for G.18 - Country dropdown with search (replacing the regulatory framework dropdown)
      if (field.field_id === 'G.18') {
        const filteredCountries = countries.filter(country =>
          country.toLowerCase().includes(searchTermG18.toLowerCase())
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
                  section='partG'
                  sectionName='Part G'
                />
              </label>
              <div className='flex flex-col relative'>
                {/* Search input */}
                <div className='relative'>
                  <input
                    type='text'
                    className={`${backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full`}
                    placeholder='Search countries...'
                    value={searchTermG18}
                    onChange={e => setSearchTermG18(e.target.value)}
                    onFocus={() => setShowDropdownG18(true)}
                  />
                </div>

                {/* Dropdown with search results */}
                {showDropdownG18 && (
                  <div className='absolute top-full left-0 right-0 bg-white border border-[rgba(99,93,255,0.5)] rounded-b-[7px] max-h-[200px] overflow-y-auto z-10 mt-[-1px]'>
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map(country => (
                        <div
                          key={country}
                          className='p-2 hover:bg-[rgba(99,93,255,0.1)] cursor-pointer'
                          onClick={() => {
                            handleCountrySelect(field.field_id, country);
                            setSearchTermG18('');
                            setShowDropdownG18(false);
                          }}
                          role='button'
                          tabIndex={0}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCountrySelect(field.field_id, country);
                              setSearchTermG18('');
                              setShowDropdownG18(false);
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
                  {selectedCountriesG18.length > 0 ? (
                    selectedCountriesG18.map(country => (
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
                  value={selectedCountriesG18.join(', ')}
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

      // Special handling for G.19 - Country dropdown with search
      if (field.field_id === 'G.19') {
        const filteredCountries = countries.filter(country =>
          country.toLowerCase().includes(searchTermG19.toLowerCase())
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
                  section='partG'
                  sectionName='Part G'
                />
              </label>
              <div className='flex flex-col relative'>
                {/* Search input */}
                <div className='relative'>
                  <input
                    type='text'
                    className={`${backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full`}
                    placeholder='Search countries...'
                    value={searchTermG19}
                    onChange={e => setSearchTermG19(e.target.value)}
                    onFocus={() => setShowDropdownG19(true)}
                  />
                </div>

                {/* Dropdown with search results */}
                {showDropdownG19 && (
                  <div className='absolute top-full left-0 right-0 bg-white border border-[rgba(99,93,255,0.5)] rounded-b-[7px] max-h-[200px] overflow-y-auto z-10 mt-[-1px]'>
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map(country => (
                        <div
                          key={country}
                          className='p-2 hover:bg-[rgba(99,93,255,0.1)] cursor-pointer'
                          onClick={() => {
                            handleCountrySelect(field.field_id, country);
                            setSearchTermG19('');
                            setShowDropdownG19(false);
                          }}
                          role='button'
                          tabIndex={0}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCountrySelect(field.field_id, country);
                              setSearchTermG19('');
                              setShowDropdownG19(false);
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
                  {selectedCountriesG19.length > 0 ? (
                    selectedCountriesG19.map(country => (
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
                  value={selectedCountriesG19.join(', ')}
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
                section='partG'
                sectionName='Part G'
              />
            </label>
            <div className='flex flex-col'>
              <textarea
                className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full resize-none overflow-hidden ${getHighlightClass(field.field_id)}`}
                rows='3'
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
                placeholder={
                  !fieldText && !getFieldValue(field.field_id)
                    ? 'Answer follow-up questions in order to generate a fill-out'
                    : field.placeholder || ''
                }
                spellCheck='false'
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
    return <BreadcrumbNav currentPageName='Part G' additionalCrumbs={[]} />;
  };

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

export default PartG;
