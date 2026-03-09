/**
 * Service to handle generation of follow-up questions and field regeneration
 * This service will connect to backend APIs when they are implemented
 */

import { createApiService } from './api';

// Function to fetch follow-up questions for a specific field
const getFollowUpQuestions = async (fieldKey, fieldValue) => {
  try {
    console.log(
      `Fetching questions for field ${fieldKey} with value:`,
      fieldValue
    );

    const api = createApiService();
    const data = await api.generateFollowUpQuestions({
      fieldKey,
      fieldTitle: fieldKey,
      guidelines: '',
      currentValue: fieldValue,
    });

    return {
      questions: data.questions || [
        'Could you provide more context about this field?',
        'Is there any additional information from the document that could help improve this answer?',
      ],
    };
  } catch (error) {
    console.error('Error fetching follow-up questions:', error);

    // Fallback response
    return {
      questions: [
        'Could you provide more context about this field?',
        'Is there any additional information from the document that could help improve this answer?',
      ],
    };
  }
};

// Function to regenerate a field based on answers to follow-up questions
const regenerateField = async (fieldKey, answers, originalValue) => {
  try {
    console.log(`Regenerating field ${fieldKey} with answers:`, answers);
    console.log('Original value:', originalValue);

    // Convert answers object to arrays for the backend API format
    const questions = Object.keys(answers);
    const answersArray = Object.values(answers);

    const api = createApiService();
    const data = await api.regenerate({
      field_id: fieldKey,
      field_name: fieldKey, // Using fieldKey as name
      field_text: originalValue,
      unanswered_questions: questions,
      answers: answersArray,
    });

    return {
      success: true,
      regeneratedValue: data.field_text,
      certainty: data.certainty || 0.95,
    };
  } catch (error) {
    console.error('Error regenerating field:', error);
    return {
      success: false,
      error: error.message,
      regeneratedValue: `${originalValue} (Updated based on context)`,
      certainty: Math.min(0.95, Math.random() * 0.3 + 0.7),
    };
  }
};

export default {
  getFollowUpQuestions,
  regenerateField,
};
