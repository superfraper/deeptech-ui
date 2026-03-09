// src/components/PartG.js
import React, { useEffect, useState } from 'react';
import { useDataContext } from '../../../context/DataContext';
import { checkAllFieldsResolved } from '../../../services/acceptedFieldsService';
import { useApi } from '../../../services/api';
import BaseSectionComponent from '../../BaseSectionComponent';
import BreadcrumbNav from '../../Common/BreadcrumbNav';
import FlagIcon from '../../Common/FlagIcon';
import HighlightedField from '../../Common/HighlightedField';
import { Button } from '../../ui/button';

const PartG = props => {
  const api = useApi();
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
    fieldDataError,
    saveUserContextData,
    acceptedFields = [],
    improvedFields = [],
  } = useDataContext();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const data = await api.getSectionFields(13, 'EMT'); // Specify "EMT" token type
        setFields(data.fields || []);
        if (fieldDataError) setError(`Error loading: ${fieldDataError}`);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleFieldChange = (fieldId, value) => {
    setFieldData(prev => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], field_text: value },
    }));
    saveUserContextData();
  };

  const autoResizeTextarea = textarea => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(textarea.scrollHeight, 48) + 'px';
    }
  };

  const sectionConfig = {
    sectionNumber: 13,
    sectionTitle:
      'Part G: Information on the sustainability indicators in relation to adverse impact on the climate and other environment-related adverse impacts',
    sectionDescription:
      'The DeepTech whitepaper tool AI will populate this section, but please check for accuracy',
    nextRoute: '/thankyou',
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

  const renderFields = baseProps => {
    const {
      getHighlightClass,
      renderActionButtons,
      renderInlineFollowUpQuestions,
    } = baseProps;

    if (isLoading)
      return (
        <div className='flex justify-center items-center py-10'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500'></div>
        </div>
      );

    if (!fieldData || fields.length === 0)
      return (
        <div className='bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6'>
          <p className='font-bold'>No data available</p>
          <p>
            Please go back to the questionnaire and submit the form to generate
            whitepaper data.
          </p>
        </div>
      );

    if (error)
      return (
        <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6'>
          <p className='font-bold'>Error loading fields</p>
          <p>{error}</p>
        </div>
      );

    return fields.map(field => {
      const id = field.field_id;
      const text = fieldData[id]?.field_text || '';

      const isAccepted = acceptedFields.includes(id);
      const isImproved = improvedFields.includes(id);
      const isConfirmed = fieldData[id]?.confirmed_correct === true;
      const hasUnanswered = fieldData[id]?.unanswered_questions?.length > 0;
      const totallyUnanswered = fieldData[id]?.totally_unanswered;

      const getBg = () => {
        if (isAccepted || isImproved || isConfirmed)
          return 'bg-white border-gray-300';
        if (!hasUnanswered)
          return 'bg-[rgba(99,93,255,0.05)] border-[rgba(99,93,255,0.5)]';
        if (hasUnanswered && !totallyUnanswered)
          return 'bg-yellow-200 border-yellow-400';
        if (totallyUnanswered) return 'bg-red-200 border-red-400';
        return 'bg-[rgba(99,93,255,0.05)] border-[rgba(99,93,255,0.5)]';
      };

      return (
        <HighlightedField key={id} fieldId={id}>
          <div className='mb-10'>
            <label
              htmlFor={`field-${id}`}
              className='block text-gray-700 font-semibold mb-2'
            >
              <span className='text-blue-500 font-mono mr-2'>{id}:</span>{' '}
              {field.field_name}
              <FlagIcon fieldId={id} section='partG' sectionName='Part G' />
            </label>
            <div className='flex flex-col'>
              <textarea
                id={`field-${id}`}
                rows='2'
                className={`${getBg()} border p-4 rounded-lg resize-none overflow-hidden ${getHighlightClass(id)}`}
                value={text}
                onChange={e => {
                  handleFieldChange(id, e.target.value);
                  autoResizeTextarea(e.target);
                }}
                placeholder='Enter your response'
                spellCheck='false'
              />
              <div className='self-start mt-2'>{renderActionButtons(id)}</div>
              {renderInlineFollowUpQuestions &&
                renderInlineFollowUpQuestions(id)}
            </div>
          </div>
        </HighlightedField>
      );
    });
  };

  const renderCustomNextButton = function RenderCustomNextButtonFactory() {
    return function RenderCustomNextButton(baseComponentInstance) {
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
      </div>;
    };
  };

  return (
    <BaseSectionComponent
      {...props}
      {...sectionConfig}
      api={api}
      tokenType='EMT' // Explicitly set token type
      renderBreadcrumb={() => (
        <BreadcrumbNav currentPageName='Part G' additionalCrumbs={[]} />
      )}
      renderCustomButton={renderCustomNextButton()}
      renderFields={baseProps =>
        renderFields({
          ...baseProps,
          getHighlightClass:
            props.getHighlightClass || baseProps.getHighlightClass,
          renderActionButtons:
            props.renderActionButtons || baseProps.renderActionButtons,
        })
      }
      nextRoute='/thankyou'
    />
  );
};

export default PartG;
