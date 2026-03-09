import React, { createContext, useContext, useState, useEffect } from 'react';

const MarkedFieldsContext = createContext();

export const MarkedFieldsProvider = ({ children }) => {
  // Load marked fields from localStorage on initial load
  const [markedFields, setMarkedFields] = useState(() => {
    const savedMarkedFields = localStorage.getItem('markedFields');
    return savedMarkedFields ? JSON.parse(savedMarkedFields) : [];
  });

  // Save to localStorage whenever markedFields changes
  useEffect(() => {
    localStorage.setItem('markedFields', JSON.stringify(markedFields));
  }, [markedFields]);

  // Toggle marking a field
  const toggleMarkField = (fieldId, section, sectionName) => {
    setMarkedFields(prev => {
      const existingIndex = prev.findIndex(item => item.fieldId === fieldId);

      if (existingIndex >= 0) {
        // If already marked, remove it
        return prev.filter(item => item.fieldId !== fieldId);
      } else {
        // Otherwise add it
        return [...prev, { fieldId, section, sectionName }];
      }
    });
  };

  // Check if a field is marked
  const isFieldMarked = fieldId => {
    return markedFields.some(item => item.fieldId === fieldId);
  };

  return (
    <MarkedFieldsContext.Provider
      value={{
        markedFields,
        toggleMarkField,
        isFieldMarked,
      }}
    >
      {children}
    </MarkedFieldsContext.Provider>
  );
};

export const useMarkedFields = () => useContext(MarkedFieldsContext);
