// src/components/PartB.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useDataContext } from '../../../context/DataContext';
import { useMarkedFields } from '../../../context/MarkedFieldsContext';
import { useSectionTitle } from '../../../context/SectionTitleContext';
import BaseSectionComponent from '../../BaseSectionComponent';
import { useApi } from '../../../services/api';
import BreadcrumbNav from '../../Common/BreadcrumbNav';
import FlagIcon from '../../Common/FlagIcon';
import HighlightedField from '../../Common/HighlightedField';
import EditableTable from '../../Common/EditableTable';

const PartB = props => {
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

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSectionFields(4, 'EMT'); // Specify "EMT" token type
      setFields(data.fields || []);
      setIsLoading(false);
      if (fieldDataError) {
        setError(`Error loading field data: ${fieldDataError}`);
      }
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleFieldChange = (fieldId, value) => {
    setFieldData(prev => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        field_text: value,
      },
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
    sectionNumber: 4,
    sectionTitle: 'Part B: Information about the e-money token',
    sectionDescription: 'Please fill in these sections',
    nextRoute: '/emt/partC',
  };

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

    if (error || fieldDataError || fields.length === 0) {
      return (
        <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6'>
          <p className='font-bold'>Error loading fields</p>
          <p>
            {error || fieldDataError || 'No fields found for this section.'}
          </p>
        </div>
      );
    }

    return fields.map(field => {
      const id = field.field_id;
      const dataItem = fieldData[id] || {};
      const text = dataItem.field_text || '';

      const isAccepted = acceptedFields.includes(id);
      const isImproved = improvedFields.includes(id);
      const isConfirmed = dataItem.confirmed_correct === true;
      const hasUnanswered =
        dataItem.unanswered_questions &&
        dataItem.unanswered_questions.length > 0;
      const totallyUnanswered = dataItem.totally_unanswered;

      const getBg = () => {
        if (isAccepted || isImproved || isConfirmed) {
          return 'bg-white border-gray-300';
        }
        if (!hasUnanswered) {
          return 'bg-[rgba(99,93,255,0.05)] border-[rgba(99,93,255,0.5)]';
        }
        if (hasUnanswered && totallyUnanswered === false) {
          return 'bg-yellow-200 border-yellow-400';
        }
        if (hasUnanswered && totallyUnanswered) {
          return 'bg-red-200 border-red-400';
        }
        return 'bg-[rgba(99,93,255,0.05)] border-[rgba(99,93,255,0.5)]';
      };

      const bgClasses = getBg();

      return (
        <HighlightedField key={id} fieldId={id}>
          <div className='mb-10'>
            <label
              htmlFor={`field-${id}`}
              className='block text-gray-700 font-semibold mb-2'
            >
              <span className='text-blue-500 font-mono mr-2'>{id}:</span>{' '}
              {field.field_name}
              <FlagIcon fieldId={id} section='partB' sectionName='Part B' />
            </label>
            <div className='flex flex-col'>
              <textarea
                id={`field-${id}`}
                rows='2'
                className={`${bgClasses} border p-4 rounded-lg resize-none overflow-hidden ${getHighlightClass(id)}`}
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

  const renderBreadcrumb = () => (
    <BreadcrumbNav currentPageName='Part B' additionalCrumbs={[]} />
  );

  return (
    <BaseSectionComponent
      {...props}
      {...sectionConfig}
      api={api}
      renderBreadcrumb={renderBreadcrumb}
      renderCustomButton={base => (
        <button
          onClick={() => base.handleNavigateToNext()}
          className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
        >
          Next
        </button>
      )}
      renderFields={baseProps =>
        renderFields({
          ...baseProps,
          getFieldValue: props.getFieldValue || baseProps.getFieldValue,
          getHighlightClass:
            props.getHighlightClass || baseProps.getHighlightClass,
          renderActionButtons:
            props.renderActionButtons || baseProps.renderActionButtons,
        })
      }
    />
  );
};

export default PartB;
