// src/components/PartC.js
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
const PartC = props => {
  const api = useApi();
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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
        const data = await api.getSectionFields(5, 'EMT'); // Specify "EMT" token type
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
    sectionNumber: 5,
    sectionTitle:
      'Part C: Information about the offer to the public of the e-money token or its admission to trading',
    sectionDescription: 'Please fill in these sections',
    nextRoute: '/emt/partD',
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
      const dataItem = fieldData[id] || {};
      const text = dataItem.field_text || '';

      const isAccepted = acceptedFields.includes(id);
      const isImproved = improvedFields.includes(id);
      const isConfirmed = dataItem.confirmed_correct === true;
      const hasUnanswered = dataItem.unanswered_questions?.length > 0;
      const totallyUnanswered = dataItem.totally_unanswered;

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
              <FlagIcon fieldId={id} section='partC' sectionName='Part C' />
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

  return (
    <BaseSectionComponent
      {...props}
      {...sectionConfig}
      api={api}
      renderBreadcrumb={() => (
        <BreadcrumbNav currentPageName='Part C' additionalCrumbs={[]} />
      )}
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
          getHighlightClass:
            props.getHighlightClass || baseProps.getHighlightClass,
          renderActionButtons:
            props.renderActionButtons || baseProps.renderActionButtons,
        })
      }
    />
  );
};

export default PartC;
