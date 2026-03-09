// src/components/PartJ.js
import { useEffect, useState } from 'react';
import { useDataContext } from '../../../context/DataContext';
import { checkAllFieldsResolved } from '../../../services/acceptedFieldsService';
import { useApi } from '../../../services/api';
import BaseSectionComponent from '../../BaseSectionComponent';
import BreadcrumbNav from '../../Common/BreadcrumbNav';
import EditableTable from '../../Common/EditableTable';
import FlagIcon from '../../Common/FlagIcon';
import HighlightedField from '../../Common/HighlightedField';
import { Button } from '../../ui/button';

const PartJ = props => {
  const api = useApi();
  // State to keep track of fetched fields
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [baseComponentRef, setBaseComponentRef] = useState(null);
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
      const data = await api.getSectionFields(13);
      console.log('PartJ fetched fields:', data);
      setFields(data.fields || []);
      setIsLoading(false);
      if (fieldDataError) {
        setError(`Error loading field data: ${fieldDataError}`);
      }
    } catch (error) {
      console.error('Error fetching data for PartJ:', error);
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
    sectionNumber: 13,
    sectionTitle:
      'Part J: Information on the sustainability indicators in relation to adverse impact on the climate and other environment-related adverse impacts',
    sectionDescription: 'Please fill in these sections',
    nextRoute: '/thankyou',
  };

  useEffect(() => {
    if (props.highlightField) {
      console.log('PartJ: Highlighting field:', props.highlightField);

      const timer = setTimeout(() => {
        const selectors = [
          `field-${props.highlightField}`,
          `field-${props.highlightField.replace('S.', 'S.')}`,
        ];

        let element = null;
        for (const selector of selectors) {
          element = document.getElementById(selector);
          if (element) {
            console.log('Found element with selector:', selector);
            break;
          }
        }

        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
          element.classList.add('pulse-highlight');
          setTimeout(() => {
            element.classList.remove('pulse-highlight');
          }, 3000);
        } else {
          console.log('Element not found for field:', props.highlightField);
          console.log(
            'Available elements:',
            document.querySelectorAll('[id^="field-"]')
          );
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [props.highlightField]);

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

      // Special handling for S.17 - Energy mix table
      if (
        (field.field_id && field.field_id.trim() === 'S.17') ||
        (typeof field.field_name === 'string' &&
          field.field_name.toLowerCase().includes('energy mix'))
      ) {
        const hasError =
          fieldText &&
          typeof fieldText === 'string' &&
          fieldText.toLowerCase().includes('error');

        // Robust parsing and normalization (handles double-encoded JSON and bracketed lists)
        console.log('S.17 parsing - fieldId:', field.field_id);
        console.log(
          'S.17 parsing - raw fieldText (first 300 chars):',
          typeof fieldText,
          String(fieldText || '').slice(0, 300)
        );
        let hasValidJson = false;

        // Start from raw value (prefer context)
        let normalizedData = (
          fieldText ??
          getFieldValue(field.field_id) ??
          ''
        ).toString();
        let parsedLevel1 = null;

        // First attempt: direct JSON.parse
        try {
          if (normalizedData && normalizedData.trim()) {
            parsedLevel1 = JSON.parse(normalizedData);
            console.log(
              'S.17 parsing - level1 typeof:',
              typeof parsedLevel1,
              'isArray:',
              Array.isArray(parsedLevel1)
            );
            if (Array.isArray(parsedLevel1)) {
              hasValidJson = parsedLevel1.length > 0;
              normalizedData = JSON.stringify(parsedLevel1, null, 4);
            } else if (typeof parsedLevel1 === 'string') {
              // Handle JSON-encoded JSON string: '"[ {...} ]"'
              const inner = parsedLevel1.trim();
              console.log(
                'S.17 parsing - level1 returned string (first 200 chars):',
                inner.slice(0, 200)
              );
              if (inner.startsWith('[') || inner.startsWith('{')) {
                try {
                  const parsedLevel2 = JSON.parse(inner);
                  console.log(
                    'S.17 parsing - level2 typeof:',
                    typeof parsedLevel2,
                    'isArray:',
                    Array.isArray(parsedLevel2)
                  );
                  if (Array.isArray(parsedLevel2)) {
                    hasValidJson = parsedLevel2.length > 0;
                    normalizedData = JSON.stringify(parsedLevel2, null, 4);
                  }
                } catch (e2) {
                  console.warn('S.17 parsing - level2 JSON.parse failed:', e2);
                }
              }
            }
          }
        } catch (e1) {
          console.warn('S.17 parsing - level1 JSON.parse failed:', e1);
        }

        // Fallback: if still not valid JSON, try bracketed "Label: value" list
        if (!hasValidJson && typeof normalizedData === 'string') {
          const trimmed = normalizedData.trim();
          // Only attempt if it looks like a bracketed list and contains colons separating pairs
          if (
            trimmed.startsWith('[') &&
            trimmed.endsWith(']') &&
            trimmed.includes(':')
          ) {
            try {
              // Extract pairs using a regex to avoid splitting inside numbers
              // Matches "Label: 12.34" or "Label: 12,34"
              const content = trimmed.slice(1, -1);
              const pairs = [];
              const regex = /([^:,]+?)\s*:\s*([0-9]+(?:[.,][0-9]+)?)/g;
              let m;
              while ((m = regex.exec(content)) !== null) {
                const name = (m[1] || '').trim();
                const numRaw = (m[2] || '')
                  .trim()
                  .replace(/,/g, '.')
                  .replace(/%/g, '');
                const num = parseFloat(numRaw);
                pairs.push({
                  'Energy Source': name,
                  Percentage: isNaN(num) ? '' : num,
                });
              }
              console.log(
                'S.17 parsing - bracketed pairs found:',
                pairs.length,
                'sample:',
                pairs[0]
              );
              if (pairs.length) {
                normalizedData = JSON.stringify(pairs, null, 4);
                hasValidJson = true;
              }
            } catch (e3) {
              console.warn('S.17 parsing - bracketed list parse failed:', e3);
            }
          }
        }

        // Fallback: simple comma-delimited "Label: value" string (no brackets)
        if (!hasValidJson && typeof normalizedData === 'string') {
          try {
            const flat = normalizedData
              .replace(/^[\s'"]+|[\s'"]+$/g, '') // trim quotes/spaces
              .replace(/\.$/, ''); // strip trailing period

            if (flat.includes(':')) {
              const parts = flat.split(/\s*,\s*/).filter(Boolean);
              const pairs = [];
              const nums = [];

              for (const part of parts) {
                const m = part.match(
                  /^\s*([^:]+?)\s*:\s*([0-9]+(?:[.,][0-9]+)?)\s*%?\s*$/
                );
                if (m) {
                  const name = m[1].trim();
                  const numRaw = m[2].replace(',', '.');
                  const val = parseFloat(numRaw);
                  if (!Number.isNaN(val)) {
                    nums.push(val);
                    pairs.push({ 'Energy Source': name, Percentage: val });
                  }
                }
              }

              if (pairs.length) {
                const max = Math.max(...nums);
                const sum = nums.reduce((a, b) => a + b, 0);
                const treatAsFraction =
                  max <= 1.0 ||
                  (nums.filter(n => n <= 1).length >=
                    Math.ceil(nums.length / 2) &&
                    sum <= 1.2);

                const normalized = pairs.map(p => {
                  const v = treatAsFraction ? p.Percentage * 100 : p.Percentage;
                  return {
                    'Energy Source': p['Energy Source'],
                    Percentage: Math.round(v * 100) / 100,
                  };
                });

                normalizedData = JSON.stringify(normalized, null, 4);
                hasValidJson = true;
              }
            }
          } catch (e4) {
            console.warn('S.17 parsing - flat list parse failed:', e4);
          }
        }

        // Try coercion if we parsed an array but it's not in expected shape
        if (!hasValidJson && Array.isArray(parsedLevel1)) {
          const arr = parsedLevel1;
          console.log(
            'S.17 parsing - coercion attempt from parsed array, length:',
            arr.length
          );

          // Case 1: array of strings like "Coal: 18.80%" or "Gas - 32.47"
          if (arr.every(el => typeof el === 'string')) {
            const coerced = [];
            const strRegex = /^(.*?)\s*[:-]\s*([0-9]+(?:[.,][0-9]+)?)\s*%?$/;
            for (const s of arr) {
              const m = String(s).trim().match(strRegex);
              if (m) {
                const name = (m[1] || '').trim();
                const num = parseFloat((m[2] || '').replace(',', '.'));
                coerced.push({
                  'Energy Source': name,
                  Percentage: isNaN(num) ? '' : num,
                });
              }
            }
            console.log(
              'S.17 parsing - array<string> coercion produced:',
              coerced.length
            );
            if (coerced.length) {
              normalizedData = JSON.stringify(coerced, null, 4);
              hasValidJson = true;
            }
          }

          // Case 2: array of objects with unknown keys
          if (
            !hasValidJson &&
            arr.every(el => typeof el === 'object' && el !== null)
          ) {
            const pickNameKey = obj =>
              Object.keys(obj).find(
                k =>
                  /energy\s*source|energy_source|source|name/i.test(k) &&
                  typeof obj[k] === 'string'
              );
            const pickPercentKey = obj =>
              Object.keys(obj).find(k =>
                /perc|percent|share|value|amount|ratio/i.test(k)
              );

            const coerced = [];
            for (const obj of arr) {
              const nk = pickNameKey(obj);
              const pk = pickPercentKey(obj);
              if (nk && pk) {
                let val = obj[pk];
                if (typeof val === 'string') {
                  val = val.replace(/%/g, '').replace(/,/g, '.').trim();
                }
                const num = typeof val === 'number' ? val : parseFloat(val);
                if (typeof obj[nk] === 'string' && !Number.isNaN(num)) {
                  coerced.push({
                    'Energy Source': obj[nk].trim(),
                    Percentage: num,
                  });
                }
              }
            }
            console.log(
              'S.17 parsing - array<object> coercion produced:',
              coerced.length,
              'sample:',
              coerced[0]
            );
            if (coerced.length) {
              normalizedData = JSON.stringify(coerced, null, 4);
              hasValidJson = true;
            }
          }
        }

        // Final log of what will be rendered
        console.log(
          'S.17 parsing - hasValidJson:',
          hasValidJson,
          'normalizedData preview:',
          String(normalizedData || '').slice(0, 200)
        );

        // Columns match backend JSON keys
        const tableColumns = [
          { key: 'Energy Source', label: 'Energy Source' },
          { key: 'Percentage', label: 'Percentage' },
        ];

        // If we have valid JSON format, always show table
        if (hasValidJson) {
          // Persist normalized JSON back to context so subsequent renders always use table
          if (
            typeof normalizedData === 'string' &&
            normalizedData !== fieldText
          ) {
            handleFieldChange(field.field_id, normalizedData);
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
                    section='partJ'
                    sectionName='Part J'
                  />
                </label>
                <div className='flex flex-col'>
                  <EditableTable
                    fieldId={field.field_id}
                    initialData={normalizedData}
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
                    percentageDecimals={10}
                  />
                </div>
              </div>
            </HighlightedField>
          );
        }

        // For S.17 always prefer table view; skip textarea rendering even if unanswered

        // Default: show editable table (even if no JSON yet)
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
                  section='partJ'
                  sectionName='Part J'
                />
              </label>
              <div className='flex flex-col'>
                <EditableTable
                  fieldId={field.field_id}
                  initialData={normalizedData}
                  onChange={handleFieldChange}
                  columns={tableColumns}
                  className={getHighlightClass(field.field_id)}
                  fieldDataItem={fieldDataItem}
                  renderActionButtons={renderActionButtons}
                  renderInlineFollowUpQuestions={renderInlineFollowUpQuestions}
                  getHighlightClass={getHighlightClass}
                  acceptedFields={acceptedFields}
                  improvedFields={improvedFields}
                  percentageDecimals={10}
                />
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
                section='partJ'
                sectionName='Part J'
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
    return <BreadcrumbNav currentPageName='Part J' additionalCrumbs={[]} />;
  };

  const handleValidateAndGenerateReport = baseComponentInstance => {
    setIsValidating(true);
    setValidationError(null);
    setBaseComponentRef(baseComponentInstance);
    baseComponentInstance.findUnresolvedFields();
    const excludedFields = ['S.20', 'S.30'];
    const currentSectionAddressed =
      baseComponentInstance.checkAllFieldsAddressed(excludedFields);

    const { allResolved, unresolvedFields } = checkAllFieldsResolved(
      fieldData,
      baseComponentInstance.state.acceptedFields,
      baseComponentInstance.state.improvedFields
    );

    if (!currentSectionAddressed || !allResolved) {
      setIsValidating(false);
      // Instead of blocking, show confirmation dialog
      setShowConfirmDialog(true);
      return;
    }

    // If all fields are resolved, proceed without confirmation
    proceedWithGeneration(baseComponentInstance);
  };

  const proceedWithGeneration = baseComponentInstance => {
    if (baseComponentInstance.props.updateAcceptedFields) {
      baseComponentInstance.props.updateAcceptedFields(
        baseComponentInstance.state.acceptedFields
      );
    }
    if (baseComponentInstance.props.updateImprovedFields) {
      baseComponentInstance.props.updateImprovedFields(
        baseComponentInstance.state.improvedFields
      );
    }
    if (baseComponentInstance.props.updateScrapedData) {
      baseComponentInstance.props.updateScrapedData(
        baseComponentInstance.state.localScrapedData
      );
    }

    baseComponentInstance.props.navigate(
      baseComponentInstance.state.nextRoute,
      {
        state: {
          scrapedData: baseComponentInstance.state.localScrapedData,
          acceptedFields: baseComponentInstance.state.acceptedFields,
          improvedFields: baseComponentInstance.state.improvedFields,
        },
      }
    );

    window.scrollTo(0, 0);
  };

  // Confirmation dialog component
  const ConfirmationDialog = () => {
    if (!showConfirmDialog) return null;

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white p-6 rounded-lg max-w-md w-full'>
          <h3 className='font-semibold text-lg mb-4'>Warning</h3>
          <p className='mb-6'>
            The whitepaper might not be complete. Are you sure you want to
            generate?
          </p>
          <div className='flex justify-end space-x-3'>
            <button
              onClick={() => setShowConfirmDialog(false)}
              className='px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300'
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowConfirmDialog(false);
                proceedWithGeneration(baseComponentRef);
              }}
              className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
            >
              Generate Anyway
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomNextButton = () => {
    const CustomNextButton = baseComponentInstance => (
      <div className='flex flex-col w-full'>
        {validationError && (
          <div
            className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'
            role='alert'
          >
            <p>{validationError}</p>
          </div>
        )}

        <div className='flex flex-col items-start'>
          <Button
            onClick={() =>
              handleValidateAndGenerateReport(baseComponentInstance)
            }
            variant='default'
            disabled={isValidating}
          >
            {isValidating ? (
              <span className='flex items-center'>
                <svg
                  className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Validating...
              </span>
            ) : (
              'Validate and generate report'
            )}
          </Button>
        </div>
        <ConfirmationDialog />
      </div>
    );

    CustomNextButton.displayName = 'CustomNextButton';
    return CustomNextButton;
  };

  // Return a BaseSectionComponent instance with our custom props
  return (
    <BaseSectionComponent
      {...props}
      {...sectionConfig}
      api={api}
      renderBreadcrumb={renderBreadcrumb}
      renderCustomButton={renderCustomNextButton()}
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

export default PartJ;
