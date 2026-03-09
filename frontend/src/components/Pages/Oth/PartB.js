// src/components/Dashboard.js
import { useEffect, useState } from 'react';
import { useDataContext } from '../../../context/DataContext';
import { useApi } from '../../../services/api';
import BaseSectionComponent from '../../BaseSectionComponent';
import BreadcrumbNav from '../../Common/BreadcrumbNav';
import EditableTable from '../../Common/EditableTable';
import FlagIcon from '../../Common/FlagIcon';
import HighlightedField from '../../Common/HighlightedField';
import { Button } from '../../ui/button';

// Create a simplified PartB component using the BaseSectionComponent
const PartB = props => {
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

  // State to keep track of original field values before clearing
  const [originalFieldValues, setOriginalFieldValues] = useState({});

  // Fetch fields when component mounts
  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setIsLoading(true);
    try {
      // Use the API service instead of direct fetch
      const data = await api.getSectionFields(5);
      console.log('PartB fetched fields:', data);
      setFields(data.fields || []);
      setIsLoading(false);
      if (fieldDataError) {
        setError(`Error loading field data: ${fieldDataError}`);
      }
    } catch (error) {
      console.error('Error fetching data for PartB:', error);
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
    // Special handling for B.1 field changes
    if (fieldId === 'B.1') {
      if (value === 'FALSE') {
        // Store original values before clearing (ONLY for Part B fields)
        const currentValues = {};
        Object.keys(fieldData).forEach(key => {
          if (
            key !== 'B.1' &&
            key.startsWith('B.') &&
            fieldData[key]?.field_text &&
            fieldData[key].field_text !== 'N/A'
          ) {
            currentValues[key] = fieldData[key].field_text;
          }
        });
        setOriginalFieldValues(currentValues);

        // Set only Part B field values to "N/A" except B.1
        setFieldData(prevData => {
          const updatedData = { ...prevData };
          Object.keys(updatedData).forEach(key => {
            // Only update keys that start with "B." and aren't "B.1"
            if (key !== 'B.1' && key.startsWith('B.')) {
              updatedData[key] = {
                ...updatedData[key],
                field_text: 'N/A',
              };
            }
          });
          // Update B.1 value
          updatedData[fieldId] = {
            ...updatedData[fieldId],
            field_text: value,
          };

          return updatedData;
        });

        // Save context data after updating
        saveUserContextData();
      } else if (value === 'TRUE') {
        // Restore original values when switching back to Yes (ONLY for Part B fields)
        setFieldData(prevData => {
          const updatedData = { ...prevData };
          // Update B.1 value
          updatedData[fieldId] = {
            ...updatedData[fieldId],
            field_text: value,
          };

          // Restore original field values only for Part B fields
          Object.keys(originalFieldValues).forEach(key => {
            if (updatedData[key] && key.startsWith('B.')) {
              updatedData[key] = {
                ...updatedData[key],
                field_text: originalFieldValues[key],
              };
            }
          });

          return updatedData;
        });

        // Save context data after updating
        saveUserContextData();
      }
    } else {
      // Block changes to other fields when B.1 is "FALSE"/"No"
      const b1FieldData = fieldData['B.1'];
      const b1Value = b1FieldData ? b1FieldData.field_text : 'TRUE';
      const isB1NoLocal =
        b1Value === false ||
        b1Value === 'FALSE' ||
        b1Value === 'False' ||
        b1Value === 'false' ||
        b1Value === 'No' ||
        b1Value === 'no';

      if (isB1NoLocal) {
        // Don't allow changes when B.1 is false
        return;
      }

      // Regular field update for non-B.1 fields
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
    sectionNumber: 5, // Using section 5 from the database for PartB
    sectionTitle:
      'Part B: Information about the issuer, if different from the offeror or person seeking admission to trading',
    sectionDescription: 'Please fill in these sections',
    nextRoute: '/oth/partC', // Route to navigate to next
  };

  // Create a renderFields function that will be passed to BaseSectionComponent
  const renderFields = baseProps => {
    const {
      getFieldValue,
      getHighlightClass,
      renderActionButtons,
      renderInlineFollowUpQuestions,
    } = baseProps;

    // Check if B.1 value is "No"
    const b1FieldData = fieldData['B.1'];
    const b1Value = b1FieldData
      ? b1FieldData.field_text
      : getFieldValue('B.1', 'TRUE');

    // Fixed: Handle all variations of "No" values including "False"
    const isB1No =
      b1Value === 'FALSE' ||
      b1Value === 'False' ||
      b1Value === 'false' ||
      b1Value === 'No' ||
      b1Value === 'no';

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

      // Set field text to "N/A" if B.1 is "No" and this is not the B.1 field
      const displayFieldText =
        isB1No && field.field_id !== 'B.1' ? 'N/A' : fieldText;

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
        // If B.1 is "No" and this is not the B.1 field, use white background
        if (isB1No && field.field_id !== 'B.1') {
          return 'bg-white border-gray-300';
        }

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

      // Determine if field should be disabled (when B.1 is "No" and this is not B.1)
      const isFieldDisabled = isB1No && field.field_id !== 'B.1';

      // Special handling for B.1 - Yes or No dropdown
      if (field.field_id === 'B.1') {
        const isB1Accepted =
          acceptedFields.includes(field.field_id) ||
          acceptedFields.includes(alternateFieldId);
        const isB1Improved =
          improvedFields.includes(field.field_id) ||
          improvedFields.includes(alternateFieldId);
        const isB1Confirmed =
          fieldDataItem?.confirmed_correct === true ||
          fieldDataItem?.confirmed_correct === 'true' ||
          fieldDataItem?.confirmed_correct == true;
        const b1BackgroundClasses =
          isB1Accepted || isB1Improved || isB1Confirmed
            ? 'bg-white border-gray-300'
            : backgroundColorClasses;

        // Fixed: Map field_text values to dropdown TRUE/FALSE
        const getDropdownValueTF = fieldText => {
          if (
            fieldText === false ||
            fieldText === 'FALSE' ||
            fieldText === 'False' ||
            fieldText === 'false' ||
            fieldText === 'No' ||
            fieldText === 'no'
          ) {
            return 'FALSE';
          }
          return 'TRUE'; // Default to TRUE for any other value including "TRUE", "True", "true", "Yes", "yes", null, undefined
        };

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
                  section='partB'
                  sectionName='Part B'
                />
              </label>
              <div className='flex flex-col'>
                <select
                  className={`${b1BackgroundClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)}`}
                  id={`field-${field.field_id}`}
                  value={getDropdownValueTF(b1Value)}
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

      // Special handling for B.6 - Date format [YYYY-MM-DD] with N/A option
      if (field.field_id === 'B.6') {
        const isNAValue = displayFieldText === 'N/A';

        return (
          <HighlightedField key={field.field_id} fieldId={field.field_id}>
            <div className='mb-10'>
              <label
                className={`block text-gray-700 font-semibold font-inter text-[16px] leading-[19px] text-black text-[20px] leading-[24px] mb-[10px] mb-5 ${isFieldDisabled ? 'text-gray-500' : ''}`}
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
                  section='partB'
                  sectionName='Part B'
                />
              </label>
              <div className='flex flex-col'>
                <div className='flex items-center gap-2'>
                  {isNAValue ? (
                    <input
                      type='text'
                      className={`${backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black flex-1 ${getHighlightClass(field.field_id)} cursor-not-allowed`}
                      value='N/A'
                      readOnly
                      disabled={isFieldDisabled}
                    />
                  ) : (
                    <input
                      type={isFieldDisabled ? 'text' : 'date'}
                      className={`${backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black flex-1 ${getHighlightClass(field.field_id)} ${isFieldDisabled ? 'cursor-not-allowed' : ''}`}
                      id={`field-${field.field_id}`}
                      value={displayFieldText || ''}
                      onChange={e =>
                        handleFieldChange(field.field_id, e.target.value)
                      }
                      placeholder={isFieldDisabled ? '' : 'YYYY-MM-DD'}
                      disabled={isFieldDisabled}
                      readOnly={isFieldDisabled}
                    />
                  )}
                  {!isFieldDisabled && (
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
                  )}
                </div>
                <div className='self-start mt-1'>
                  {!isFieldDisabled && renderActionButtons(field.field_id)}
                </div>
                {!isFieldDisabled &&
                  renderInlineFollowUpQuestions &&
                  renderInlineFollowUpQuestions(field.field_id)}
              </div>
            </div>
          </HighlightedField>
        );
      }

      // Special handling for B.7 - Max 20 characters
      if (field.field_id === 'B.7') {
        return (
          <HighlightedField key={field.field_id} fieldId={field.field_id}>
            <div className='mb-10'>
              <label
                className={`block text-gray-700 font-semibold font-inter text-[16px] leading-[19px] text-black text-[20px] leading-[24px] mb-[10px] mb-5 ${isFieldDisabled ? 'text-gray-500' : ''}`}
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
                  section='partB'
                  sectionName='Part B'
                />
              </label>
              <div className='flex flex-col'>
                <input
                  type='text'
                  maxLength='20'
                  className={`${backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${getHighlightClass(field.field_id)} ${isFieldDisabled ? 'cursor-not-allowed' : ''}`}
                  id={`field-${field.field_id}`}
                  value={displayFieldText || ''}
                  onChange={e =>
                    handleFieldChange(field.field_id, e.target.value)
                  }
                  spellCheck='false'
                  placeholder={isFieldDisabled ? '' : 'Max 20 characters'}
                  disabled={isFieldDisabled}
                  readOnly={isFieldDisabled}
                />
                {!isFieldDisabled && (
                  <div className='text-xs text-gray-500 mt-1'>
                    {(displayFieldText || '').length}/20 characters
                  </div>
                )}
                <div className='self-start mt-1'>
                  {!isFieldDisabled && renderActionButtons(field.field_id)}
                </div>
                {!isFieldDisabled &&
                  renderInlineFollowUpQuestions &&
                  renderInlineFollowUpQuestions(field.field_id)}
              </div>
            </div>
          </HighlightedField>
        );
      }

      // Special handling for B.10 - Management table
      if (field.field_id === 'B.10') {
        const hasError =
          displayFieldText && displayFieldText.toLowerCase().includes('error');
        if (totallyUnanswered === true || hasError) {
          return (
            <HighlightedField key={field.field_id} fieldId={field.field_id}>
              <div className='mb-10'>
                <label
                  className={`block text-gray-700 font-semibold font-inter text-[16px] leading-[19px] text-black text-[20px] leading-[24px] mb-[10px] mb-5 ${isFieldDisabled ? 'text-gray-500' : ''}`}
                  htmlFor={`field-${field.field_id}`}
                >
                  <span className='text-blue-500 font-mono mr-2'>
                    {field.field_id}:
                  </span>
                  {field.field_name}
                  <FlagIcon
                    fieldId={field.field_id}
                    section='partB'
                    sectionName='Part B'
                  />
                </label>
                <div className='flex flex-col'>
                  <textarea
                    className={`${backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full resize-none overflow-hidden ${getHighlightClass(field.field_id)} ${isFieldDisabled ? 'cursor-not-allowed' : ''}`}
                    rows='2'
                    cols='50'
                    id={`field-${field.field_id}`}
                    value={
                      hasError
                        ? 'Answer follow-up questions in order to generate a fill-out'
                        : displayFieldText || ''
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
                      isFieldDisabled
                        ? ''
                        : 'Answer follow-up questions in order to generate a fill-out'
                    }
                    disabled={isFieldDisabled}
                    readOnly={hasError || isFieldDisabled}
                  ></textarea>
                  <div className='self-start mt-1'>
                    {!isFieldDisabled && renderActionButtons(field.field_id)}
                  </div>
                  {!isFieldDisabled &&
                    renderInlineFollowUpQuestions &&
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
                className={`block text-gray-700 font-semibold font-inter text-[16px] leading-[19px] text-black text-[20px] leading-[24px] mb-[10px] mb-5 ${isFieldDisabled ? 'text-gray-500' : ''}`}
                htmlFor={`field-${field.field_id}`}
              >
                <span className='text-blue-500 font-mono mr-2'>
                  {field.field_id}:
                </span>
                {field.field_name}
                <FlagIcon
                  fieldId={field.field_id}
                  section='partB'
                  sectionName='Part B'
                />
              </label>
              <div className='flex flex-col'>
                {isFieldDisabled ? (
                  <div
                    className={`${backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full cursor-not-allowed`}
                  >
                    N/A
                  </div>
                ) : (
                  <EditableTable
                    fieldId={field.field_id}
                    initialData={displayFieldText || ''}
                    onChange={handleFieldChange}
                    columns={tableColumns}
                    className={getHighlightClass(field.field_id)}
                    disabled={isFieldDisabled}
                    fieldDataItem={fieldDataItem}
                    renderActionButtons={renderActionButtons}
                    renderInlineFollowUpQuestions={
                      renderInlineFollowUpQuestions
                    }
                    getHighlightClass={getHighlightClass}
                    acceptedFields={acceptedFields}
                    improvedFields={improvedFields}
                  />
                )}
                {/* Removed duplicate action buttons - EditableTable handles them now */}
                {/* <div className="self-start mt-1">
                  {!isFieldDisabled && renderActionButtons(field.field_id)}
                </div>
                {!isFieldDisabled && renderInlineFollowUpQuestions && renderInlineFollowUpQuestions(field.field_id)} */}
              </div>
            </div>
          </HighlightedField>
        );
      }

      // For all other fields, use the default textarea rendering
      return (
        <HighlightedField key={field.field_id} fieldId={field.field_id}>
          <div className='mb-10'>
            <label
              className={`block text-gray-700 font-semibold font-inter text-[16px] leading-[19px] text-black text-[20px] leading-[24px] mb-[10px] mb-5 ${isFieldDisabled ? 'text-gray-500' : ''}`}
              htmlFor={`field-${field.field_id}`}
            >
              <span className='text-blue-500 font-mono mr-2'>
                {field.field_id}:
              </span>
              {field.field_name}
              <FlagIcon
                fieldId={field.field_id}
                section='partB'
                sectionName='Part B'
              />
            </label>
            <div className='flex flex-col'>
              <textarea
                className={`${backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full resize-none overflow-hidden ${getHighlightClass(field.field_id)} ${isFieldDisabled ? 'cursor-not-allowed' : ''}`}
                rows='2'
                cols='50'
                id={`field-${field.field_id}`}
                value={displayFieldText || ''}
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
                    : 'Answer follow-up questions in order to generate a fill-out'
                }
                disabled={isFieldDisabled}
                readOnly={isFieldDisabled}
              ></textarea>
              <div className='self-start mt-1'>
                {!isFieldDisabled && renderActionButtons(field.field_id)}
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
    return <BreadcrumbNav currentPageName='Part B' additionalCrumbs={[]} />;
  };

  // Pass custom props to BaseSectionComponent to override its behavior
  const renderCustomButton = baseSectionComponent => {
    return (
      <Button
        onClick={() => handleCustomNavigateToNext(baseSectionComponent)}
        variant='default'
      >
        Next
      </Button>
    );
  };

  // Custom navigation handler that overrides the validation for B fields when B.1 is "No"
  const handleCustomNavigateToNext = baseSectionComponent => {
    const b1FieldData = fieldData['B.1'];
    const b1Value = b1FieldData ? b1FieldData.field_text : 'TRUE';
    // Fixed: Handle all variations of "No" values including "False"
    const isB1No =
      b1Value === 'FALSE' ||
      b1Value === 'False' ||
      b1Value === 'false' ||
      b1Value === 'No' ||
      b1Value === 'no';

    if (isB1No) {
      // When B.1 is "No", skip the validation for Part B fields and navigate directly
      if (baseSectionComponent.props.updateAcceptedFields) {
        baseSectionComponent.props.updateAcceptedFields(
          baseSectionComponent.state.acceptedFields
        );
      }
      if (baseSectionComponent.props.updateImprovedFields) {
        baseSectionComponent.props.updateImprovedFields(
          baseSectionComponent.state.improvedFields
        );
      }
      if (baseSectionComponent.props.updateScrapedData) {
        baseSectionComponent.props.updateScrapedData(
          baseSectionComponent.state.localScrapedData
        );
      }

      // Navigate to next section without validation
      baseSectionComponent.props.navigate(sectionConfig.nextRoute, {
        state: {
          scrapedData: baseSectionComponent.state.localScrapedData,
          acceptedFields: baseSectionComponent.state.acceptedFields,
          improvedFields: baseSectionComponent.state.improvedFields,
        },
      });

      // Scroll to top after navigation
      window.scrollTo(0, 0);
    } else {
      // Use the original navigation logic when B.1 is "Yes"
      baseSectionComponent.handleNavigateToNext();
    }
  };

  // Override getUnresolvedFields to exclude Part B fields when B.1 is "No"
  const getCustomUnresolvedFields = () => {
    const b1FieldData = fieldData['B.1'];
    const b1Value = b1FieldData ? b1FieldData.field_text : 'TRUE';
    // Fixed: Handle all variations of "No" values including "False"
    const isB1No =
      b1Value === 'FALSE' ||
      b1Value === 'False' ||
      b1Value === 'false' ||
      b1Value === 'No' ||
      b1Value === 'no';

    // If B.1 is "No", consider all Part B fields as resolved
    if (isB1No) {
      return [];
    }

    // Otherwise, use the original unresolved fields logic
    return null; // This will make the component fall back to the default behavior
  };

  // Return a BaseSectionComponent instance with our custom props
  return (
    <BaseSectionComponent
      {...props}
      {...sectionConfig}
      api={api}
      renderBreadcrumb={renderBreadcrumb}
      renderCustomButton={renderCustomButton}
      getCustomUnresolvedFields={getCustomUnresolvedFields}
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

export default PartB;
