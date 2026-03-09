import { createApiService } from './api';

/**
 * Generates follow-up questions based on field title, guidelines, and current value
 *
 * @param {string} fieldKey - The identifier of the field
 * @param {string} fieldTitle - The title/label of the field
 * @param {string} guidelines - Any guidelines or expected format for the field
 * @param {string} currentValue - The current value of the field
 * @returns {Promise} - Promise that resolves to an array of questions
 */
export const generateFollowUpQuestions = async (
  fieldKey,
  fieldTitle,
  guidelines = '',
  currentValue = ''
) => {
  try {
    const api = createApiService();
    const data = await api.generateFollowUpQuestions({
      fieldKey,
      fieldTitle,
      guidelines,
      currentValue,
    });
    return data.questions || [];
  } catch (error) {
    console.error('Error fetching follow-up questions:', error);

    // Fallback to some basic questions if API call fails
    return [
      'Is there any additional information in the document that could be relevant for this field?',
      `What specific details about "${fieldTitle}" are mentioned in the document?`,
    ];
  }
};

/**
 * Submits answers to follow-up questions and gets regenerated field value
 *
 * @param {string} fieldKey - The identifier of the field
 * @param {Object} answers - The answers to follow-up questions
 * @param {string} originalValue - The original value of the field
 * @param {string} tokenClassification - The token classification (ART, EMT, OTH)
 * @returns {Promise} - Promise that resolves to the regenerated field data
 */
export const submitAnswersAndRegenerate = async (
  fieldKey,
  answers,
  originalValue,
  tokenClassification = 'OTH'
) => {
  try {
    // Convert answers object to array format expected by backend
    const questions = Object.keys(answers);
    const answersArray = Object.values(answers);

    // Build the request body according to RegenerateRequest model
    const requestBody = {
      field_id: fieldKey,
      field_name: fieldKey,
      field_text: originalValue,
      unanswered_questions: questions,
      answers: answersArray,
      token_classification: tokenClassification,
    };

    console.log('Submitting regeneration request:', requestBody);

    const api = createApiService();
    const data = await api.regenerate(requestBody);

    console.log('Regeneration response:', data);

    // Return the data with proper field naming for the component
    return {
      fieldKey,
      regeneratedValue: data.field_text,
      certainty: data.certainty || 0.95, // Default if not provided
    };
  } catch (error) {
    console.error('Error regenerating field value:', error);

    // Return original value in case of error
    return {
      fieldKey,
      regeneratedValue: originalValue,
      certainty: 0.95,
    };
  }
};
