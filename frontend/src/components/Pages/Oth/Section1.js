import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDataContext } from '../../../context/DataContext';
import { useSectionTitleContext } from '../../../context/SectionTitleContext';
import { useApi } from '../../../services/api';
import BaseSectionComponent from '../../BaseSectionComponent';
import BreadcrumbNav from '../../Common/BreadcrumbNav';
import FlagIcon from '../../Common/FlagIcon';
import HighlightedField from '../../Common/HighlightedField';

// Create a simplified Section1 component using the BaseSectionComponent
const Section1 = props => {
  const location = useLocation();
  const { sectionTitles } = useSectionTitleContext();
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

  // Fetch fields when component mounts
  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setIsLoading(true);
    try {
      const fieldsData = await api.getSectionFields(1);
      console.log('Section1 fetched fields:', fieldsData);
      if (fieldData && fieldData['I.01']) {
        console.log('I.01 from context:', fieldData['I.01']);
      }

      setFields(fieldsData.fields || []);
      setIsLoading(false);
      if (fieldDataError) {
        setError(`Error loading field data: ${fieldDataError}`);
      }
    } catch (error) {
      console.error('Error fetching data for Section1:', error);
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

  // Format field ID for display - for OTH type, convert I.XX to XX format
  const formatFieldIdForDisplay = fieldId => {
    // For OTH type, convert I.00, I.01, etc. to 00, 01, etc.
    if (fieldId && fieldId.startsWith('I.') && fieldId.match(/^I\.\d{2}$/)) {
      return fieldId.substring(2); // Remove "I." prefix
    }
    return fieldId;
  };

  // Define the section-specific configuration
  const sectionConfig = {
    sectionNumber: 1,
    sectionTitle: 'Section 1: Compliance with duties of information',
    sectionDescription: 'Please fill in these sections',
    nextRoute: '/oth/summery',
  };

  // Create a renderFields function that will be passed to BaseSectionComponent
  const renderFields = baseProps => {
    const {
      getFieldValue,
      getHighlightClass,
      renderActionButtons,
      renderInlineFollowUpQuestions,
    } = baseProps;
    console.log('Section1 renderFields called with fields:', fields);

    // List of non-editable fields
    const nonEditableFields = ['I.00', 'I.01', 'I.03', 'I.04', 'I.06'];

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

    // Modified to show all fields including previously filtered ones
    const filteredFields = fields;

    // If all fields were filtered out, show a message
    if (filteredFields.length === 0) {
      return (
        <div className='bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6'>
          <p className='font-bold'>No fields to display</p>
          <p>There are no fields available to display in this section.</p>
        </div>
      );
    }

    return filteredFields.map(field => {
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

      return (
        <HighlightedField key={field.field_id} fieldId={field.field_id}>
          <div className='mb-10'>
            <label
              className='block text-gray-700 font-semibold font-inter text-[16px] leading-[19px] text-black text-[20px] leading-[24px] mb-[10px] mb-5'
              htmlFor={`field-${field.field_id}`}
            >
              <span className='text-blue-500 font-mono mr-2'>
                {formatFieldIdForDisplay(field.field_id)}:
              </span>
              {field.field_name}
              {!isNonEditable && (
                <FlagIcon
                  fieldId={field.field_id}
                  section='section1'
                  sectionName='Section 1'
                />
              )}
            </label>
            <div className='flex flex-col'>
              {isNonEditable ? (
                <div className='bg-gray-100 border border-gray-300 p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full'>
                  {fieldText ||
                    getFieldValue(field.field_id) ||
                    `System-defined field (${field.field_id})`}
                </div>
              ) : (
                <textarea
                  className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full resize-none overflow-hidden ${getHighlightClass(field.field_id)}`}
                  rows='5'
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
              <div className='self-start mt-2'>
                {!isNonEditable && renderActionButtons(field.field_id)}
              </div>
              {renderInlineFollowUpQuestions &&
                !isNonEditable &&
                renderInlineFollowUpQuestions(field.field_id)}
            </div>
          </div>
        </HighlightedField>
      );
    });
  };

  const renderBreadcrumb = () => {
    return <BreadcrumbNav currentPageName='Section 1' additionalCrumbs={[]} />;
  };

  return (
    <BaseSectionComponent
      {...props}
      {...sectionConfig}
      api={api}
      nonEditableFields={['I.00', 'I.01', 'I.03', 'I.04', 'I.06']}
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

export default Section1;
