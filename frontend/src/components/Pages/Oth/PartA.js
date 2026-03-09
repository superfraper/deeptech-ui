// src/components/Pages/Oth/PartA.js
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDataContext } from '../../../context/DataContext';
import { useApi } from '../../../services/api';
import BaseSectionComponent from '../../BaseSectionComponent';
import BreadcrumbNav from '../../Common/BreadcrumbNav';
import EditableTable from '../../Common/EditableTable';
import FlagIcon from '../../Common/FlagIcon';
import HighlightedField from '../../Common/HighlightedField';

// Create a simplified PartA component using the BaseSectionComponent
const PartA = props => {
  const api = useApi();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
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

  // Fetch fields when component mounts
  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setIsLoading(true);
    try {
      // Use the API service instead of direct fetch
      const data = await api.getSectionFields(4);
      console.log('PartA fetched fields:', data);
      setFields(data.fields || []);
      setIsLoading(false);
      if (fieldDataError) {
        setError(`Error loading field data: ${fieldDataError}`);
      }
    } catch (error) {
      console.error('Error fetching data for PartA:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Auto-resize textarea function
  const autoResizeTextarea = textarea => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(textarea.scrollHeight, 48) + 'px'; // Minimum height of 48px (2 rows)
    }
  };

  // Handle field value change with auto-resize
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
      // We can debounce this for better performance in a real app
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
    sectionNumber: 4,
    sectionTitle:
      'Part A: Information about the offeror or the person seeking admission to trading',
    sectionDescription: 'Please fill in these sections',
    nextRoute: '/oth/partB', // Route to navigate to next
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
      // SPRAWDŹMY acceptedFields i improvedFields - to może być klucz!
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

      // Special handling for A.5 - Date format [YYYY-MM-DD]
      if (field.field_id === 'A.5') {
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
                  section='partA'
                  sectionName='Part A'
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

      // Special handling for A.6 - Max 20 characters
      if (field.field_id === 'A.6') {
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
                  [Max 20 characters]
                </span>
                <FlagIcon
                  fieldId={field.field_id}
                  section='partA'
                  sectionName='Part A'
                />
              </label>
              <div className='flex flex-col'>
                <input
                  type='text'
                  maxLength='20'
                  className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
                  id={`field-${field.field_id}`}
                  defaultValue={fieldText || getFieldValue(field.field_id)}
                  onChange={e =>
                    handleFieldChange(field.field_id, e.target.value)
                  }
                  spellCheck='false'
                  placeholder={
                    !fieldText && !getFieldValue(field.field_id)
                      ? 'Max 20 characters'
                      : ''
                  }
                />
                <div className='text-xs text-gray-500 mt-1'>
                  {(fieldText || '').length}/20 characters
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

      // Special handling for A.8 - Telephone number
      if (field.field_id === 'A.8') {
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
                  [Telephone number]
                </span>
                <FlagIcon
                  fieldId={field.field_id}
                  section='partA'
                  sectionName='Part A'
                />
              </label>
              <div className='flex flex-col'>
                <input
                  type='tel'
                  pattern='[0-9+\s\-()]+'
                  className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
                  id={`field-${field.field_id}`}
                  defaultValue={fieldText || getFieldValue(field.field_id)}
                  onChange={e =>
                    handleFieldChange(field.field_id, e.target.value)
                  }
                  placeholder='+1 234 567 890'
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

      // Special handling for A.9 - Email
      if (field.field_id === 'A.9') {
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
                <span className='text-sm text-gray-500'>[Email address]</span>
                <FlagIcon
                  fieldId={field.field_id}
                  section='partA'
                  sectionName='Part A'
                />
              </label>
              <div className='flex flex-col'>
                <input
                  type='email'
                  className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
                  id={`field-${field.field_id}`}
                  defaultValue={fieldText || getFieldValue(field.field_id)}
                  onChange={e =>
                    handleFieldChange(field.field_id, e.target.value)
                  }
                  placeholder='example@domain.com'
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

      // Special handling for A.12 - Management table
      if (field.field_id === 'A.12') {
        const hasError = fieldText && fieldText.toLowerCase().includes('error');

        // Check if we have valid JSON format
        let hasValidJson = false;
        try {
          if (fieldText && fieldText.trim()) {
            const parsed = JSON.parse(fieldText);
            hasValidJson = Array.isArray(parsed) && parsed.length > 0;
          }
        } catch (e) {
          hasValidJson = false;
        }

        // If we have valid JSON format, always show table regardless of other states
        if (hasValidJson) {
          const tableColumns = [
            { key: 'identity', label: 'Identity' },
            { key: 'businessAddress', label: 'Business Address' },
            { key: 'functions', label: 'Functions' },
          ];

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
                    section='partA'
                    sectionName='Part A'
                  />
                </label>
                <div className='flex flex-col'>
                  <EditableTable
                    fieldId={field.field_id}
                    initialData={fieldText || getFieldValue(field.field_id)}
                    onChange={handleFieldChange}
                    columns={tableColumns}
                    className={getHighlightClass(field.field_id)}
                    fieldDataItem={fieldDataItem}
                    renderActionButtons={renderActionButtons}
                    renderInlineFollowUpQuestions={
                      renderInlineFollowUpQuestions
                    }
                    getHighlightClass={getHighlightClass}
                    acceptedFields={acceptedFields}
                    improvedFields={improvedFields}
                  />
                </div>
              </div>
            </HighlightedField>
          );
        }

        // If no valid JSON and has error or totally unanswered, show textarea
        if (totallyUnanswered === true || hasError) {
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
                    section='partA'
                    sectionName='Part A'
                  />
                </label>
                <div className='flex flex-col'>
                  <textarea
                    className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full resize-none overflow-hidden ${getHighlightClass(field.field_id)}`}
                    rows='2'
                    cols='50'
                    id={`field-${field.field_id}`}
                    value={
                      hasError
                        ? 'Answer follow-up questions in order to generate a fill-out'
                        : fieldText || getFieldValue(field.field_id)
                    }
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
                    readOnly={hasError}
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
        }

        const tableColumns = [
          { key: 'identity', label: 'Identity' },
          { key: 'businessAddress', label: 'Business Address' },
          { key: 'functions', label: 'Functions' },
        ];

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
                  section='partA'
                  sectionName='Part A'
                />
              </label>
              <div className='flex flex-col'>
                <EditableTable
                  fieldId={field.field_id}
                  initialData={fieldText || getFieldValue(field.field_id)}
                  onChange={handleFieldChange}
                  columns={tableColumns}
                  className={getHighlightClass(field.field_id)}
                  fieldDataItem={fieldDataItem}
                  renderActionButtons={renderActionButtons}
                  renderInlineFollowUpQuestions={renderInlineFollowUpQuestions}
                  getHighlightClass={getHighlightClass}
                  acceptedFields={acceptedFields}
                  improvedFields={improvedFields}
                />
                {/* Removed duplicate action buttons - EditableTable handles them now */}
                {/* {renderInlineFollowUpQuestions && renderInlineFollowUpQuestions(field.field_id)} */}
              </div>
            </div>
          </HighlightedField>
        );
      }

      // Special handling for A.15 - True or False dropdown
      if (field.field_id === 'A.15') {
        const isA15Accepted =
          acceptedFields.includes(field.field_id) ||
          acceptedFields.includes(alternateFieldId);
        const isA15Improved =
          improvedFields.includes(field.field_id) ||
          improvedFields.includes(alternateFieldId);
        const isA15Confirmed =
          fieldDataItem?.confirmed_correct === true ||
          fieldDataItem?.confirmed_correct === 'true' ||
          fieldDataItem?.confirmed_correct == true;
        const a15BackgroundClasses =
          isA15Accepted || isA15Improved || isA15Confirmed
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
                  section='partA'
                  sectionName='Part A'
                />
              </label>
              <div className='flex flex-col'>
                <select
                  className={`${a15BackgroundClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
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

      // For all other fields, use the default textarea rendering or read-only div
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
                section='partA'
                sectionName='Part A'
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
                    // Auto-resize on mount
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
    return <BreadcrumbNav currentPageName='Part A' additionalCrumbs={[]} />;
  };

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

export default PartA;
