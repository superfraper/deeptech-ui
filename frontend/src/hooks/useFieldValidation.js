import { useState } from 'react';
import {
  generateFollowUpQuestions,
  submitAnswersAndRegenerate,
} from '../services/questionService';

const useFieldValidation = (initialAcceptedFields = []) => {
  // Track fields that have been manually accepted despite low certainty
  const [acceptedFields, setAcceptedFields] = useState(initialAcceptedFields);

  // States for the FollowUpModal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFieldValue, setCurrentFieldValue] = useState('');
  const [followUpQuestions, setFollowUpQuestions] = useState([]);

  // Standard placeholder questions for all fields (only used as fallback)
  const standardQuestions = [
    'Is there any additional information in the document that could be relevant for this field?',
    'Are there any specific regulatory references or requirements that should be reflected here?',
  ];

  // Set initial accepted fields (useful when initializing from context)
  const setInitialAcceptedFields = fields => {
    setAcceptedFields(fields);
  };

  // Function to accept a field value despite low certainty
  const acceptFieldValue = fieldKey => {
    setAcceptedFields(prev => [...prev, fieldKey]);
  };

  // Function to handle follow-up question click
  const handleFollowUpQuestion = (
    fieldKey,
    fieldValue,
    fieldTitle,
    guidelines = '',
    unansweredQuestions = []
  ) => {
    setCurrentField(fieldKey);
    setCurrentFieldValue(fieldValue);
    setIsModalOpen(true);
    if (unansweredQuestions && unansweredQuestions.length > 0) {
      setFollowUpQuestions(unansweredQuestions);
      return;
    }

    setIsLoading(true);
    generateFollowUpQuestions(fieldKey, fieldTitle, guidelines, fieldValue)
      .then(questions => {
        // Use the generated questions from the service
        setIsLoading(false);
        setFollowUpQuestions(questions);
      })
      .catch(error => {
        console.error('Error generating follow-up questions:', error);
        setIsLoading(false);
        // Fallback to standard questions in case of error
        setFollowUpQuestions(standardQuestions);
      });
  };

  // Function to submit answers and regenerate content
  const handleSubmitAnswers = async (
    fieldKey,
    answers,
    tokenClassification = 'OTH'
  ) => {
    setIsLoading(true);
    try {
      const result = await submitAnswersAndRegenerate(
        fieldKey,
        answers,
        currentFieldValue,
        tokenClassification
      );

      await new Promise(resolve => setTimeout(resolve, 600));
      return result;
    } catch (error) {
      console.error('Error submitting answers:', error);
      return null;
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
      setCurrentField(null);
    }
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentField(null);
    setCurrentFieldValue('');
    setFollowUpQuestions([]);
  };

  return {
    acceptedFields,
    isModalOpen,
    currentField,
    currentFieldValue,
    followUpQuestions,
    isLoading,
    acceptFieldValue,
    setInitialAcceptedFields,
    handleFollowUpQuestion,
    handleSubmitAnswers,
    handleCloseModal,
  };
};

export default useFieldValidation;
