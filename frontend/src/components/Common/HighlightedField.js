import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const HighlightedField = ({ fieldId, children }) => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const highlightedFieldId = searchParams.get('fieldId');

    if (highlightedFieldId === fieldId) {
      const element = document.getElementById(`field-${fieldId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  }, [fieldId, searchParams]);

  return children;
};

export default HighlightedField;
