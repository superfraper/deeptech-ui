import { useState, useEffect, useCallback } from 'react';

export const useFormValidation = formData => {
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let formValid = true;

    // Validate email
    if (formData.email) {
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      if (!emailValid) {
        newErrors.email = 'Please enter a valid email address.';
        formValid = false;
      }
    } else {
      newErrors.email = 'Email is required.';
      formValid = false;
    }

    // Validate token name
    if (!formData.tokenName || formData.tokenName.trim().length === 0) {
      newErrors.tokenName = 'Name is required.';
      formValid = false;
    }

    setErrors(newErrors);
    setIsFormValid(formValid);

    return formValid;
  }, [formData]);

  useEffect(() => {
    validateForm();
  }, [formData, validateForm]);

  return {
    errors,
    isFormValid,
    validateForm,
  };
};
