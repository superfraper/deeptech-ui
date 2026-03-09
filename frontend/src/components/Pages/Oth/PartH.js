// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import BaseSectionComponent from '../../BaseSectionComponent';
import { useDataContext } from '../../../context/DataContext';
import { useApi } from '../../../services/api';
import BreadcrumbNav from '../../Common/BreadcrumbNav';
import FlagIcon from '../../Common/FlagIcon';
import HighlightedField from '../../Common/HighlightedField';

const LOCAL_STORAGE_KEY = 'partH_prevH9Value';

// Create a simplified PartH component using the BaseSectionComponent
const PartH = props => {
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

  const [prevH9Value, setPrevH9ValueState] = useState(() => {
    // Read from localStorage on first render
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return '';
    try {
      // Try to parse as JSON (object)
      return JSON.parse(raw);
    } catch {
      // Fallback for legacy string-only values
      return raw;
    }
  });

  // Helper to set prevH9Value in state and localStorage
  const setPrevH9Value = val => {
    setPrevH9ValueState(val);
    if (val) {
      // Always store as JSON string
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(val));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  // Fetch fields when component mounts
  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setIsLoading(true);
    try {
      // Use the API service instead of direct fetch
      const data = await api.getSectionFields(11);
      console.log('PartH fetched fields:', data);
      setFields(data.fields || []);
      setIsLoading(false);
      if (fieldDataError) {
        setError(`Error loading field data: ${fieldDataError}`);
      }
    } catch (error) {
      console.error('Error fetching data for PartH:', error);
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

  // Add a useEffect to monitor H.8 value and update H.9 accordingly
  useEffect(() => {
    if (!fieldData || !fieldData['H.8']) return;

    const h8Value = fieldData['H.8'].field_text;
    console.log('useEffect detected H.8 change to:', h8Value);

    const isH8False =
      h8Value === 'FALSE' || h8Value === 'False' || h8Value === false;
    const isH8True =
      h8Value === 'TRUE' || h8Value === 'True' || h8Value === true;

    if (
      isH8False &&
      fieldData['H.9'] &&
      (fieldData['H.9'].field_text !== 'N/A' ||
        !fieldData['H.9'].confirmed_correct)
    ) {
      setPrevH9Value(fieldData['H.9'].field_text || '');
      // ...existing code...
      setFieldData(prevData => {
        // Skip update if already set correctly to prevent loop
        if (
          prevData['H.9']?.field_text === 'N/A' &&
          prevData['H.9']?.confirmed_correct === true
        ) {
          return prevData;
        }

        const updatedData = { ...prevData };
        // Update H.9 to be completely valid with no unanswered questions
        updatedData['H.9'] = {
          ...updatedData['H.9'],
          field_text: 'N/A',
          confirmed_correct: true,
          unanswered_questions: [],
          totally_unanswered: false,
          confirmed: true,
          validation_errors: [],
          validation_warnings: [],
        };

        // Save context data after updating
        saveUserContextData();
        return updatedData;
      });
    } else if (
      isH8True &&
      fieldData['H.9'] &&
      fieldData['H.9'].field_text === 'N/A'
    ) {
      setFieldData(prevData => {
        // Skip update if already set correctly to prevent loop
        if (prevData['H.9']?.field_text !== 'N/A') {
          return prevData;
        }

        const updatedData = { ...prevData };
        // Restore all previous H.9 properties if possible
        const prevH9 = prevH9Value
          ? typeof prevH9Value === 'object'
            ? prevH9Value
            : { field_text: prevH9Value }
          : {};
        updatedData['H.9'] = {
          ...updatedData['H.9'],
          ...prevH9,
          field_text: prevH9.field_text || '',
          confirmed_correct: false,
          confirmed: false,
          unanswered_questions:
            prevH9.unanswered_questions ||
            updatedData['H.9'].unanswered_questions ||
            [],
          totally_unanswered:
            prevH9.totally_unanswered ??
            updatedData['H.9'].totally_unanswered ??
            false,
          // keep other properties if present
        };

        saveUserContextData();
        return updatedData;
      });
    }
    // Dodaj prevH9Value do zależności
  }, [fieldData?.['H.8']?.field_text, saveUserContextData, prevH9Value]);

  // Handle field value change
  const handleFieldChange = (fieldId, value) => {
    console.log(`Changing field ${fieldId} to value:`, value);
    // Special handling for H.8 field changes
    if (fieldId === 'H.8') {
      setFieldData(prevData => {
        const updatedData = { ...prevData };

        // Ensure H.8 value is properly set regardless of format
        updatedData[fieldId] = {
          ...updatedData[fieldId],
          field_text: value,
        };

        console.log(`H.8 new value set to: ${value}`);

        // Update H.9 based on H.8 value
        if (value === 'FALSE' || value === 'False' || value === false) {
          // ZAPAMIĘTAJ poprzednią wartość H.9 zanim ustawisz N/A
          if (updatedData['H.9'] && updatedData['H.9'].field_text !== 'N/A') {
            // Save the full H.9 object for restoration
            setPrevH9Value({ ...updatedData['H.9'] });
          }
          // When H.8 is False, set H.9 to "N/A" and mark as fully validated
          if (updatedData['H.9']) {
            updatedData['H.9'] = {
              ...updatedData['H.9'],
              field_text: 'N/A',
              confirmed_correct: true,
              confirmed: true,
              unanswered_questions: [],
              totally_unanswered: false,
              validation_errors: [],
              validation_warnings: [],
            };
          } else {
            // If H.9 doesn't exist yet, create it with valid state
            updatedData['H.9'] = {
              field_id: 'H.9',
              field_name: 'Audit outcome',
              field_text: 'N/A',
              confirmed_correct: true,
              confirmed: true,
              unanswered_questions: [],
              totally_unanswered: false,
              validation_errors: [],
              validation_warnings: [],
            };
          }
        } else if (value === 'TRUE' || value === 'True' || value === true) {
          // Przywróć poprzednią wartość H.9 jeśli istnieje
          if (updatedData['H.9'] && updatedData['H.9'].field_text === 'N/A') {
            const prevH9 = prevH9Value
              ? typeof prevH9Value === 'object'
                ? prevH9Value
                : { field_text: prevH9Value }
              : {};
            updatedData['H.9'] = {
              ...updatedData['H.9'],
              ...prevH9,
              field_text: prevH9.field_text || '',
              confirmed_correct: false,
              confirmed: false,
              unanswered_questions:
                prevH9.unanswered_questions ||
                updatedData['H.9'].unanswered_questions ||
                [],
              totally_unanswered:
                prevH9.totally_unanswered ??
                updatedData['H.9'].totally_unanswered ??
                false,
            };
          }
        }

        // Save context data after updating
        saveUserContextData();
        return updatedData;
      });
    } else {
      // Regular field update for non-H.8 fields
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
    }
  };

  // Handle textarea change with auto-resize
  const handleTextareaChange = (fieldId, event) => {
    handleFieldChange(fieldId, event.target.value);
    autoResizeTextarea(event.target);
  };

  // Define the section-specific configuration
  const sectionConfig = {
    sectionNumber: 11,
    sectionTitle: 'Part H: Information on the underlying technology',
    sectionDescription: 'Please fill in these sections',
    nextRoute: '/oth/partI',
  };

  // Modify the renderFields function to ensure H.9 is properly handled
  const renderFields = baseProps => {
    const {
      getFieldValue,
      getHighlightClass,
      renderActionButtons,
      renderInlineFollowUpQuestions,
    } = baseProps;

    // Check if H.8 value is "False" (handle different formats)
    const h8FieldData = fieldData['H.8'];
    const h8Value = h8FieldData
      ? h8FieldData.field_text
      : getFieldValue('H.8', 'False');
    const isH8False =
      h8Value === 'FALSE' || h8Value === 'False' || h8Value === false;

    // If H.8 is False, immediately update H.9 to be valid
    if (isH8False && fieldData['H.9']) {
      // This ensures H.9 is always valid when H.8 is False, even during rendering
      fieldData['H.9'].unanswered_questions = [];
      fieldData['H.9'].totally_unanswered = false;
      fieldData['H.9'].confirmed_correct = true;
      fieldData['H.9'].confirmed = true;
    }

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

      // Special handling for H.9 when H.8 is False
      let fieldText = fieldDataItem ? fieldDataItem.field_text : '';
      let isFieldConfirmed = fieldDataItem?.confirmed_correct === true;
      let fieldHasUnansweredQuestions =
        fieldDataItem?.unanswered_questions &&
        fieldDataItem.unanswered_questions.length > 0;

      // Override values for H.9 when H.8 is False
      if (isH8False && field.field_id === 'H.9') {
        fieldText = 'N/A';
        isFieldConfirmed = true;
        fieldHasUnansweredQuestions = false;

        // Also directly update the fieldData object to ensure validation passes
        if (fieldDataItem) {
          fieldDataItem.field_text = 'N/A';
          fieldDataItem.confirmed_correct = true;
          fieldDataItem.confirmed = true;
          fieldDataItem.unanswered_questions = [];
          fieldDataItem.totally_unanswered = false;
        }
      }

      const totallyUnanswered = fieldDataItem?.totally_unanswered;

      const isAccepted =
        acceptedFields.includes(normalizedFieldId) ||
        acceptedFields.includes(alternateFieldId);
      const isImproved =
        improvedFields.includes(normalizedFieldId) ||
        improvedFields.includes(alternateFieldId);

      const getBackgroundColor = () => {
        // If H.8 is "False" and this is the H.9 field, use white background as if it's confirmed
        if (isH8False && field.field_id === 'H.9') {
          return 'bg-white border-gray-300';
        }

        if (isAccepted || isImproved) {
          return 'bg-white border-gray-300';
        }

        const isConfirmed =
          fieldDataItem?.confirmed_correct === true ||
          fieldDataItem?.confirmed_correct === 'true' ||
          fieldDataItem?.confirmed_correct == true ||
          fieldDataItem?.confirmed === true;

        if (isConfirmed) {
          return 'bg-white border-gray-300';
        }

        if (isFieldConfirmed || !fieldHasUnansweredQuestions) {
          return 'bg-[rgba(99,93,255,0.05)] border-[rgba(99,93,255,0.5)]';
        } else if (fieldHasUnansweredQuestions && totallyUnanswered === false) {
          return 'bg-yellow-200 border-yellow-400';
        } else if (fieldHasUnansweredQuestions && totallyUnanswered === true) {
          return 'bg-red-200 border-red-400';
        }
        return 'bg-[rgba(99,93,255,0.05)] border-[rgba(99,93,255,0.5)]';
      };

      const backgroundColorClasses = getBackgroundColor();

      // Determine if field should be disabled (when H.8 is "False" and this is H.9)
      const isFieldDisabled = isH8False && field.field_id === 'H.9';

      // Special handling for H.8 - True or False dropdown
      if (field.field_id === 'H.8') {
        // Normalize the value to uppercase "TRUE" or "FALSE" regardless of input format
        const normalizeValue = value => {
          console.log('Normalizing H.8 value:', value);
          if (value === undefined || value === null) return 'FALSE'; // Default to FALSE if empty

          // Handle string boolean values
          if (typeof value === 'string') {
            return value.trim().toUpperCase() === 'TRUE' ? 'TRUE' : 'FALSE';
          }

          // Handle actual boolean values
          return value === true ? 'TRUE' : 'FALSE';
        };

        // IMPORTANT: Use the actual field data from context instead of the normalized local value
        // This ensures we're always showing what's actually in the data context
        const actualH8Value = fieldDataItem?.field_text || 'FALSE';
        const currentValue = normalizeValue(actualH8Value);

        console.log('H.8 actual field data:', actualH8Value);
        console.log('H.8 dropdown current value:', currentValue);

        const isH8Accepted =
          acceptedFields.includes(field.field_id) ||
          acceptedFields.includes(alternateFieldId);
        const isH8Improved =
          improvedFields.includes(field.field_id) ||
          improvedFields.includes(alternateFieldId);
        const isH8Confirmed =
          fieldDataItem?.confirmed_correct === true ||
          fieldDataItem?.confirmed_correct === 'true' ||
          fieldDataItem?.confirmed_correct == true;
        const h8BackgroundClasses =
          isH8Accepted || isH8Improved || isH8Confirmed
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
                  section='partH'
                  sectionName='Part H'
                />
              </label>
              <div className='flex flex-col'>
                <select
                  className={`${h8BackgroundClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
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

      // For all other fields
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
                section='partH'
                sectionName='Part H'
              />
            </label>
            <div className='flex flex-col'>
              <textarea
                className={`${backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full resize-none overflow-hidden ${getHighlightClass(field.field_id)}`}
                rows='2'
                cols='50'
                id={`field-${field.field_id}`}
                value={fieldText}
                onChange={e => handleTextareaChange(field.field_id, e)}
                onInput={e => autoResizeTextarea(e.target)}
                ref={textarea => {
                  if (textarea) {
                    setTimeout(() => autoResizeTextarea(textarea), 0);
                  }
                }}
                spellCheck='false'
                placeholder={
                  isFieldDisabled
                    ? ''
                    : !fieldText && !getFieldValue(field.field_id)
                      ? 'Answer follow-up questions in order to generate a fill-out'
                      : ''
                }
                disabled={isFieldDisabled}
                readOnly={isFieldDisabled}
              ></textarea>
              <div className='self-start mt-1'>
                {isFieldDisabled ? null : renderActionButtons(field.field_id)}
              </div>
              {!isFieldDisabled &&
                renderInlineFollowUpQuestions &&
                renderInlineFollowUpQuestions(field.field_id)}
            </div>
          </div>
        </HighlightedField>
      );
    });
  };

  const renderBreadcrumb = () => {
    return <BreadcrumbNav currentPageName='Part H' additionalCrumbs={[]} />;
  };

  // Return a BaseSectionComponent instance with our custom props
  return (
    <BaseSectionComponent
      {...props}
      {...sectionConfig}
      api={api}
      // Exclude H.9 from gating/validation checks like I.01, I.02, etc.
      nonEditableFields={['H.9']}
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

export default PartH;
