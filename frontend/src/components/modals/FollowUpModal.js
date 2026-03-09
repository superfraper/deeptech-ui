import React, { useState, useEffect } from 'react';

const FollowUpModal = ({
  isOpen,
  onClose,
  fieldKey,
  fieldValue,
  questions,
  onSubmit,
  isLoading = false,
  isInline = false,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showError, setShowError] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Reset state when fieldKey changes or modal opens
  useEffect(() => {
    if (isOpen && fieldKey) {
      setCurrentQuestionIndex(0);
      setAnswers({});
      setCurrentAnswer('');
      setShowError(false);
      setValidationErrors({});
    }
  }, [isOpen, fieldKey]);

  const [wasLoading, setWasLoading] = useState(false);
  useEffect(() => {
    if (isOpen && isLoading) {
      setWasLoading(true);
    }
    if (isOpen && wasLoading && !isLoading) {
      setWasLoading(false);
      if (onClose) onClose();
    }
  }, [isLoading, isOpen, wasLoading, onClose]);

  if (!isOpen) return null;

  const handleNextQuestion = () => {
    // Validate if answer is provided
    if (!currentAnswer.trim()) {
      setShowError(true);
      return;
    }

    // Save current answer
    const updatedAnswers = { ...answers };
    updatedAnswers[questions[currentQuestionIndex]] = currentAnswer;
    setAnswers(updatedAnswers);
    setCurrentAnswer('');
    setShowError(false);

    // Move to next question or complete if done
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      onSubmit(fieldKey, updatedAnswers, fieldValue);
    }
  };

  const handleAnswerChange = (question, value) => {
    setAnswers(prev => ({
      ...prev,
      [question]: value,
    }));
    if (value.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        [question]: false,
      }));
    }
  };

  const handleSubmitAll = () => {
    const newValidationErrors = {};
    let hasError = false;

    questions.forEach(question => {
      if (!answers[question] || !answers[question].trim()) {
        newValidationErrors[question] = true;
        hasError = true;
      }
    });

    if (hasError) {
      setValidationErrors(newValidationErrors);
      return;
    }

    onSubmit(fieldKey, answers, fieldValue);
  };

  if (isInline) {
    return (
      <div className='w-full'>
        <h4 className='font-medium text-sm mb-3 text-blue-600'>
          Follow-up Questions ({questions.length})
        </h4>

        <div className='mb-3'>
          {questions.map((question, index) => (
            <div key={index} className='mb-4 bg-white p-3 rounded shadow-sm'>
              <p className='font-medium text-sm mb-2'>
                <span className='inline-block bg-blue-100 text-blue-800 px-1 rounded mr-2'>
                  {index + 1}
                </span>
                {question}
              </p>
              <textarea
                className={`w-full border rounded p-2 mb-1 ${validationErrors[question] ? 'border-red-500' : ''}`}
                rows='3'
                value={answers[question] || ''}
                onChange={e => handleAnswerChange(question, e.target.value)}
                placeholder='Your answer...'
                disabled={isLoading}
              ></textarea>

              {validationErrors[question] && (
                <p className='text-red-500 text-xs'>
                  Please provide an answer for this question
                </p>
              )}
            </div>
          ))}
        </div>

        <div className='flex justify-between'>
          <button
            className='bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm'
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            className={`bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSubmitAll}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className='animate-spin -ml-1 mr-2 h-3 w-3 text-white'
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
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              'Submit All Answers'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white p-6 rounded-lg shadow-lg max-w-md w-full'>
        <h3 className='text-xl font-semibold mb-4'>
          Follow-up Question for Field {fieldKey}
        </h3>

        <div className='mb-6'>
          <p className='text-gray-700 mb-2'>
            Question {currentQuestionIndex + 1}/{questions.length}
          </p>
          <p className='font-medium'>{questions[currentQuestionIndex]}</p>
        </div>

        <textarea
          className={`w-full border rounded p-2 mb-1 ${showError ? 'border-red-500' : ''}`}
          rows='3'
          value={currentAnswer}
          onChange={e => {
            setCurrentAnswer(e.target.value);
            if (showError && e.target.value.trim()) setShowError(false);
          }}
          placeholder='Your answer...'
          disabled={isLoading}
        ></textarea>

        {showError && (
          <p className='text-red-500 text-sm mb-3'>
            Please provide an answer before proceeding
          </p>
        )}

        <div className='flex justify-between'>
          <button
            className='bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded'
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleNextQuestion}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Processing...
              </>
            ) : currentQuestionIndex < questions.length - 1 ? (
              'Next Question'
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowUpModal;
