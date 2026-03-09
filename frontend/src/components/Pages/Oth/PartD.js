import { useEffect, useState } from 'react';
import { useDataContext } from '../../../context/DataContext';
import { useApi } from '../../../services/api';
import BaseSectionComponent from '../../BaseSectionComponent';
import BreadcrumbNav from '../../Common/BreadcrumbNav';
import EditableTable from '../../Common/EditableTable';
import FlagIcon from '../../Common/FlagIcon';
import HighlightedField from '../../Common/HighlightedField';

// Create a simplified PartD component using the BaseSectionComponent
const PartD = props => {
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

  // Monitor D.6 changes and auto-update D.7
  useEffect(() => {
    if (fieldData) {
      const d6FieldData = fieldData['D.6'];
      const d7FieldData = fieldData['D.7'];

      if (d6FieldData) {
        const d6Value = d6FieldData.field_text;
        const isD6True =
          d6Value === true || String(d6Value).toUpperCase() === 'TRUE';

        // If D.6 is FALSE and D.7 is not N/A, update D.7 to N/A
        if (!isD6True && d7FieldData && d7FieldData.field_text !== 'N/A') {
          setFieldData(prev => ({
            ...prev,
            'D.7': { ...d7FieldData, field_text: 'N/A' },
          }));
        }
      }
    }
  }, [fieldData, setFieldData]);

  // Monitor D.2 changes and auto-update D.3
  useEffect(() => {
    if (fieldData) {
      const d2FieldData = fieldData['D.2'];
      const d3FieldData = fieldData['D.3'];

      if (d2FieldData) {
        const d2Value = d2FieldData.field_text;
        const isD2NA =
          d2Value === 'N/A' ||
          String(d2Value).trim().toUpperCase() === 'N/A' ||
          String(d2Value).trim() === 'N/A as DTI is provided in F.13';

        // If D.2 is N/A (or DTI variant) and D.3 is not N/A, update D.3 to N/A
        if (isD2NA && d3FieldData && d3FieldData.field_text !== 'N/A') {
          setFieldData(prev => ({
            ...prev,
            'D.3': { ...d3FieldData, field_text: 'N/A' },
          }));
        }
      }
    }
  }, [fieldData, setFieldData]);

  const fetchFields = async () => {
    setIsLoading(true);
    try {
      // Use the API service instead of direct fetch
      const data = await api.getSectionFields(7);
      setFields(data.fields || []);
      setIsLoading(false);
      if (fieldDataError) {
        setError(`Error loading field data: ${fieldDataError}`);
      }
    } catch (error) {
      console.error('Error fetching data for PartD:', error);
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
    sectionNumber: 7,
    sectionTitle: 'Part D: Information about the crypto-asset project',
    sectionDescription: 'Please fill in these sections',
    nextRoute: '/oth/partE',
  };

  // Create a renderFields function that will be passed to BaseSectionComponent
  const renderFields = baseProps => {
    const {
      getFieldValue,
      getHighlightClass,
      renderActionButtons,
      renderInlineFollowUpQuestions,
    } = baseProps;

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
      const isConfirmedCorrect = fieldDataItem?.confirmed_correct === true;
      const hasUnansweredQuestions =
        fieldDataItem?.unanswered_questions &&
        fieldDataItem.unanswered_questions.length > 0;
      const totallyUnanswered = fieldDataItem?.totally_unanswered;

      // Determine background color based on the three cases:
      const isAccepted =
        acceptedFields.includes(field.field_id) ||
        acceptedFields.includes(alternateFieldId);
      const isImproved =
        improvedFields.includes(field.field_id) ||
        improvedFields.includes(alternateFieldId);

      const getBackgroundColor = () => {
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
        if (!hasUnansweredQuestions) {
          return 'bg-[rgba(99,93,255,0.05)] border-[rgba(99,93,255,0.5)]';
        }
        if (hasUnansweredQuestions && totallyUnanswered === false) {
          return 'bg-yellow-200 border-yellow-400';
        }
        if (hasUnansweredQuestions && totallyUnanswered === true) {
          return 'bg-red-200 border-red-400';
        }
        return 'bg-[rgba(99,93,255,0.05)] border-[rgba(99,93,255,0.5)]';
      };

      const backgroundColorClasses = getBackgroundColor();

      // Special handling for D.5 - Management table
      if (field.field_id === 'D.5') {
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
                  className='block text-gray-700 font-semibold text-[20px] mb-5'
                  htmlFor={`field-${field.field_id}`}
                >
                  <span className='text-blue-500 font-mono mr-2'>
                    {field.field_id}:
                  </span>
                  {field.field_name}
                  <FlagIcon
                    fieldId={field.field_id}
                    section='partD'
                    sectionName='Part D'
                  />
                </label>
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
                  className='block text-gray-700 font-semibold text-[20px] mb-5'
                  htmlFor={`field-${field.field_id}`}
                >
                  <span className='text-blue-500 font-mono mr-2'>
                    {field.field_id}:
                  </span>
                  {field.field_name}
                  <FlagIcon
                    fieldId={field.field_id}
                    section='partD'
                    sectionName='Part D'
                  />
                </label>
                <div className='flex flex-col'>
                  <textarea
                    className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] text-[16px] text-black w-full resize-none overflow-hidden`}
                    id={`field-${field.field_id}`}
                    value={
                      hasError
                        ? 'Answer follow-up questions in order to generate a fill-out'
                        : fieldText || getFieldValue(field.field_id)
                    }
                    onChange={e => handleTextareaChange(field.field_id, e)}
                    onInput={e => autoResizeTextarea(e.target)}
                    ref={textarea =>
                      textarea &&
                      setTimeout(() => autoResizeTextarea(textarea), 0)
                    }
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

        // Default case: show table (for empty data or other states)
        const tableColumns = [
          { key: 'identity', label: 'Identity' },
          { key: 'businessAddress', label: 'Business Address' },
          { key: 'functions', label: 'Functions' },
        ];

        return (
          <HighlightedField key={field.field_id} fieldId={field.field_id}>
            <div className='mb-10'>
              <label
                className='block text-gray-700 font-semibold text-[20px] mb-5'
                htmlFor={`field-${field.field_id}`}
              >
                <span className='text-blue-500 font-mono mr-2'>
                  {field.field_id}:
                </span>
                {field.field_name}
                <FlagIcon
                  fieldId={field.field_id}
                  section='partD'
                  sectionName='Part D'
                />
              </label>
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
            </div>
          </HighlightedField>
        );
      }

      // Special handling for D.3 - depends on D.2 value
      if (field.field_id === 'D.3') {
        // Get D.2 value from fieldData
        const d2FieldData = fieldData['D.2'];
        const d2Value = d2FieldData ? d2FieldData.field_text : null;
        const isD2NA =
          d2Value === 'N/A' ||
          String(d2Value).trim().toUpperCase() === 'N/A' ||
          String(d2Value).trim() === 'N/A as DTI is provided in F.13';

        // If D.2 is N/A, D.3 should be N/A and disabled
        if (isD2NA) {
          return (
            <HighlightedField key={field.field_id} fieldId={field.field_id}>
              <div className='mb-10'>
                <label
                  className='block text-gray-700 font-semibold text-[20px] mb-5'
                  htmlFor={`field-${field.field_id}`}
                >
                  <span className='text-blue-500 font-mono mr-2'>
                    {field.field_id}:
                  </span>
                  {field.field_name}
                  <FlagIcon
                    fieldId={field.field_id}
                    section='partD'
                    sectionName='Part D'
                  />
                </label>
                <textarea
                  className={`${backgroundColorClasses} border p-[15px_25px] rounded-[7px] text-[16px] leading-[160%] text-black w-full resize-none overflow-hidden bg-gray-100`}
                  id={`field-${field.field_id}`}
                  value='N/A'
                  readOnly={true}
                  placeholder='N/A (depends on D.2 not being N/A)'
                ></textarea>
                <div className='text-sm text-gray-500 mt-1'>
                  This field is automatically set to N/A because D.2 is N/A or
                  &quot;N/A as DTI is provided in F.13&quot;. Change D.2 to
                  enable editing.
                </div>
                <div className='self-start mt-1'>
                  {renderActionButtons(field.field_id)}
                </div>
                {renderInlineFollowUpQuestions &&
                  renderInlineFollowUpQuestions(field.field_id)}
              </div>
            </HighlightedField>
          );
        }

        // If D.2 is not N/A, render D.3 as normal editable textarea
        return (
          <HighlightedField key={field.field_id} fieldId={field.field_id}>
            <div className='mb-10'>
              <label
                className='block text-gray-700 font-semibold text-[20px] mb-5'
                htmlFor={`field-${field.field_id}`}
              >
                <span className='text-blue-500 font-mono mr-2'>
                  {field.field_id}:
                </span>
                {field.field_name}
                <FlagIcon
                  fieldId={field.field_id}
                  section='partD'
                  sectionName='Part D'
                />
              </label>
              <textarea
                className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] text-[16px] leading-[160%] text-black w-full resize-none overflow-hidden`}
                id={`field-${field.field_id}`}
                defaultValue={fieldText || getFieldValue(field.field_id)}
                onChange={e => handleTextareaChange(field.field_id, e)}
                onInput={e => autoResizeTextarea(e.target)}
                ref={textarea =>
                  textarea && setTimeout(() => autoResizeTextarea(textarea), 0)
                }
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
          </HighlightedField>
        );
      }

      // Special handling for D.7 - depends on D.6 value
      if (field.field_id === 'D.7') {
        // Get D.6 value from fieldData
        const d6FieldData = fieldData['D.6'];
        const d6Value = d6FieldData ? d6FieldData.field_text : null;
        const isD6True =
          d6Value === true || String(d6Value).toUpperCase() === 'TRUE';

        // If D.6 is FALSE, D.7 should be N/A and disabled
        if (!isD6True) {
          return (
            <HighlightedField key={field.field_id} fieldId={field.field_id}>
              <div className='mb-10'>
                <label
                  className='block text-gray-700 font-semibold text-[20px] mb-5'
                  htmlFor={`field-${field.field_id}`}
                >
                  <span className='text-blue-500 font-mono mr-2'>
                    {field.field_id}:
                  </span>
                  {field.field_name}
                  <FlagIcon
                    fieldId={field.field_id}
                    section='partD'
                    sectionName='Part D'
                  />
                </label>
                <textarea
                  className={`${backgroundColorClasses} border p-[15px_25px] rounded-[7px] text-[16px] leading-[160%] text-black w-full resize-none overflow-hidden bg-gray-100`}
                  id={`field-${field.field_id}`}
                  value='N/A'
                  readOnly={true}
                  placeholder='N/A (depends on D.6 being TRUE)'
                ></textarea>
                <div className='text-sm text-gray-500 mt-1'>
                  This field is automatically set to N/A because D.6 is FALSE.
                  Set D.6 to TRUE to enable editing.
                </div>
                <div className='self-start mt-1'>
                  {renderActionButtons(field.field_id)}
                </div>
                {renderInlineFollowUpQuestions &&
                  renderInlineFollowUpQuestions(field.field_id)}
              </div>
            </HighlightedField>
          );
        }

        // If D.6 is TRUE, render D.7 as normal editable textarea
        return (
          <HighlightedField key={field.field_id} fieldId={field.field_id}>
            <div className='mb-10'>
              <label
                className='block text-gray-700 font-semibold text-[20px] mb-5'
                htmlFor={`field-${field.field_id}`}
              >
                <span className='text-blue-500 font-mono mr-2'>
                  {field.field_id}:
                </span>
                {field.field_name}
                <FlagIcon
                  fieldId={field.field_id}
                  section='partD'
                  sectionName='Part D'
                />
              </label>
              <textarea
                className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] text-[16px] leading-[160%] text-black w-full resize-none overflow-hidden`}
                id={`field-${field.field_id}`}
                defaultValue={fieldText || getFieldValue(field.field_id)}
                onChange={e => handleTextareaChange(field.field_id, e)}
                onInput={e => autoResizeTextarea(e.target)}
                ref={textarea =>
                  textarea && setTimeout(() => autoResizeTextarea(textarea), 0)
                }
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
          </HighlightedField>
        );
      }

      // Special handling for the D.6 field which is a dropdown
      if (field.field_id === 'D.6') {
        const isD6Accepted =
          acceptedFields.includes(field.field_id) ||
          acceptedFields.includes(alternateFieldId);
        const isD6Improved =
          improvedFields.includes(field.field_id) ||
          improvedFields.includes(alternateFieldId);
        const isD6Confirmed =
          fieldDataItem?.confirmed_correct === true ||
          fieldDataItem?.confirmed_correct === 'true' ||
          fieldDataItem?.confirmed_correct == true;
        const d6BackgroundClasses =
          isD6Accepted || isD6Improved || isD6Confirmed
            ? 'bg-white border-gray-300'
            : backgroundColorClasses;

        // Prepare controlled value as "TRUE" or "FALSE"
        const d6Value = fieldDataItem
          ? fieldDataItem.field_text === true ||
            String(fieldDataItem.field_text).toUpperCase() === 'TRUE'
            ? 'TRUE'
            : 'FALSE'
          : 'FALSE';

        return (
          <HighlightedField key={field.field_id} fieldId={field.field_id}>
            <div className='mb-10'>
              <label
                className='block text-gray-700 font-semibold text-[20px] mb-5'
                htmlFor={`field-${field.field_id}`}
              >
                <span className='text-blue-500 font-mono mr-2'>
                  {field.field_id}:
                </span>{' '}
                {field.field_name} (
                <a
                  href='https://lk648ntk1fo.typeform.com/utility'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:text-blue-800 underline'
                >
                  https://lk648ntk1fo.typeform.com/utility
                </a>
                )
                <FlagIcon
                  fieldId={field.field_id}
                  section='partD'
                  sectionName='Part D'
                />
              </label>
              <div className='flex flex-col'>
                <select
                  className={`${d6BackgroundClasses} border p-[15px_25px] rounded-[7px] text-[16px] leading-[160%] text-black w-full max-w-full`}
                  id={`field-${field.field_id}`}
                  value={d6Value}
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
              className='block text-gray-700 font-semibold text-[20px] mb-5'
              htmlFor={`field-${field.field_id}`}
            >
              <span className='text-blue-500 font-mono mr-2'>
                {field.field_id}:
              </span>{' '}
              {field.field_name}
              <FlagIcon
                fieldId={field.field_id}
                section='partD'
                sectionName='Part D'
              />
            </label>
            <textarea
              className={`${!fieldText && !getFieldValue(field.field_id) ? 'bg-[#EF4444] border-[#EF4444]' : backgroundColorClasses} border p-[15px_25px] rounded-[7px] text-[16px] leading-[160%] text-black w-full resize-none overflow-hidden`}
              id={`field-${field.field_id}`}
              defaultValue={fieldText || getFieldValue(field.field_id)}
              onChange={e => handleTextareaChange(field.field_id, e)}
              onInput={e => autoResizeTextarea(e.target)}
              ref={textarea =>
                textarea && setTimeout(() => autoResizeTextarea(textarea), 0)
              }
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
        </HighlightedField>
      );
    });
  };
  const renderBreadcrumb = () => {
    return <BreadcrumbNav currentPageName='Part D' additionalCrumbs={[]} />;
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

export default PartD;
