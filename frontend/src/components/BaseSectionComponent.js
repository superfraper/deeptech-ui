import React, { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDataContext } from '../context/DataContext';
import {
  generateFollowUpQuestions,
  submitAnswersAndRegenerate,
} from '../services/questionService';
import BreadcrumbNav from './Common/BreadcrumbNav';
import MarkedFieldsMenu from './Common/MarkedFieldsMenu'; // Import the menu
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import FollowUpModal from './modals/FollowUpModal';
import ProgressBar from './ProgressBar'; // Import ProgressBar component
import { Button } from './ui/button';

class BaseSectionComponent extends React.Component {
  constructor(props) {
    super(props);

    // Default state
    this.state = {
      localScrapedData: {},
      acceptedFields: [],
      improvedFields: [],
      attemptedNavigation: false,
      isModalOpen: false,
      currentField: null,
      currentFieldValue: '',
      followUpQuestions: [],
      isLoading: true,
      error: null,
      sectionNumber: props.sectionNumber || 1,
      sectionTitle: props.sectionTitle || 'Section',
      sectionDescription: props.sectionDescription || '',
      nextRoute: props.nextRoute || '/',
      tokenType: props.tokenType || 'OTH', // Add token type to state
      fields: [],
      fieldsWithUnresolvedQuestions: [],
      hasShownModal: false,
      expandedFields: {},
      progressUpdateTrigger: null, // Add trigger for ProgressBar re-render
    };

    // Standard questions for fallback
    this.standardQuestions = [
      'Is there any additional information in the document that could be relevant for this field?',
      'Are there any specific regulatory references or requirements that should be reflected here?',
    ];

    // Certainty threshold
    this.certaintyThreshold = 0.9;
  }

  componentDidMount() {
    // Get location state and context data from props
    const { state, contextData, contextAcceptedFields, contextImprovedFields } =
      this.props;

    // Set initial state from props - prioritize contextData if available
    this.setState({
      localScrapedData: contextData || state?.scrapedData || {},
      acceptedFields: state?.acceptedFields || contextAcceptedFields || [],
      improvedFields: state?.improvedFields || contextImprovedFields || [],
    });

    // Fetch fields for this section from the backend
    this.fetchSectionFields();

    // Add beforeunload event listener
    window.addEventListener('beforeunload', this.handleBeforeUnload);

    // Removed automatic modal opening on component mount
  }

  componentWillUnmount() {
    // Remove beforeunload event listener
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  componentDidUpdate(prevProps, prevState) {
    // Sync back to context whenever acceptedFields or improvedFields change
    if (
      prevState.acceptedFields !== this.state.acceptedFields &&
      this.props.updateAcceptedFields
    ) {
      this.props.updateAcceptedFields(this.state.acceptedFields);
    }

    if (
      prevState.improvedFields !== this.state.improvedFields &&
      this.props.updateImprovedFields
    ) {
      this.props.updateImprovedFields(this.state.improvedFields);
    }

    // Find unresolved fields, but don't show modal automatically
    if (
      (!prevState.fields.length && this.state.fields.length > 0) ||
      (prevState.isLoading && !this.state.isLoading)
    ) {
      this.findUnresolvedFields();
    }

    // Update localScrapedData if contextData changes - FIXED
    if (
      prevProps.contextData !== this.props.contextData &&
      this.props.contextData
    ) {
      console.log(
        'BaseSectionComponent - contextData changed, updating localScrapedData:',
        this.props.contextData
      );
      this.setState(
        {
          localScrapedData: this.props.contextData,
        },
        () => {
          console.log(
            'BaseSectionComponent - updated localScrapedData:',
            this.state.localScrapedData
          );
          // Re-check unresolved fields after data update
          this.findUnresolvedFields();
        }
      );
    }
  }

  // Fetch fields from the database for this section
  fetchSectionFields = async () => {
    try {
      this.setState({ isLoading: true, error: null });

      // Use the API service instead of direct fetch
      const data = await this.props.api.getSectionFields(
        this.state.sectionNumber
      );
      console.log('Fetched fields data:', data); // Debug log

      // Update fields in state
      this.setState(
        {
          fields: data.fields || [],
          isLoading: false,
        },
        () => {
          console.log('Updated state with fields:', this.state.fields); // Debug log after state update
        }
      );
    } catch (error) {
      console.error('Error fetching section fields:', error);
      // Set empty fields array on error to prevent further issues
      this.setState({
        fields: [],
        isLoading: false,
        error: error.message,
      });
    }
  };

  // Handle beforeunload event
  handleBeforeUnload = e => {
    if (!this.checkAllFieldsAddressed()) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  // Get highlight class for a field based on certainty
  getHighlightClass = fieldKey => {
    // Convert format (e.g., A.01 to A.1) if needed
    const apiFieldKey = fieldKey.includes('.0')
      ? fieldKey.replace(/\.0(\d)/, '.$1')
      : fieldKey.replace(/\.(\d)$/, '.0$1');

    // Try to find the field using either format
    const field =
      this.state.localScrapedData[fieldKey] ||
      this.state.localScrapedData[apiFieldKey];

    // Don't highlight if field has been accepted or improved through follow-up questions
    if (
      this.state.acceptedFields.includes(fieldKey) ||
      this.state.improvedFields.includes(fieldKey)
    ) {
      return '';
    }

    return field &&
      field.unanswered_questions &&
      field.unanswered_questions.length > 0
      ? 'bg-red-500'
      : '';
  };

  // Get field value
  getFieldValue = (fieldKey, defaultValue = '') => {
    // Convert format if needed
    const apiFieldKey = fieldKey.includes('.0')
      ? fieldKey.replace(/\.0(\d)/, '.$1')
      : fieldKey.replace(/\.(\d)$/, '.0$1');

    // Try to get the value from either format
    const value =
      this.state.localScrapedData[fieldKey]?.field_text ||
      this.state.localScrapedData[apiFieldKey]?.field_text ||
      defaultValue;

    return value;
  };

  // Accept a field value - Updated to force re-render of ProgressBar and close modal
  acceptFieldValue = fieldKey => {
    const updatedAcceptedFields = [...this.state.acceptedFields, fieldKey];
    this.setState({
      acceptedFields: updatedAcceptedFields,
      attemptedNavigation: false, // Reset navigation attempt indicator
      progressUpdateTrigger: Date.now(), // Add trigger to force ProgressBar re-render
      // Close any open modals/expanded states for this field
      expandedFields: {
        ...this.state.expandedFields,
        [fieldKey]: false,
      },
      isModalOpen: false,
      currentField: null,
      currentFieldValue: '',
      followUpQuestions: [],
    });
  };

  // Handle follow-up question click
  handleFollowUpQuestion = (
    fieldKey,
    fieldValue,
    fieldTitle,
    guidelines = '',
    unansweredQuestions = []
  ) => {
    this.setState({
      currentField: fieldKey,
      currentFieldValue: fieldValue,
      isModalOpen: true,
      attemptedNavigation: false, // Reset navigation attempt indicator
    });

    // If we have unanswered questions from the API, use those directly
    if (unansweredQuestions && unansweredQuestions.length > 0) {
      this.setState({ followUpQuestions: unansweredQuestions });
      return;
    }

    // Otherwise, fetch questions from the service
    this.setState({ isLoading: true });

    generateFollowUpQuestions(fieldKey, fieldTitle, guidelines, fieldValue)
      .then(questions => {
        // Use the generated questions instead of standard ones
        this.setState({
          isLoading: false,
          followUpQuestions: questions,
        });
      })
      .catch(error => {
        console.error('Error generating follow-up questions:', error);
        this.setState({
          isLoading: false,
          // Fallback to standard questions in case of error
          followUpQuestions: this.standardQuestions,
        });
      });
  };

  // Handle modal close
  handleCloseModal = () => {
    this.setState({
      isModalOpen: false,
      currentField: null,
      currentFieldValue: '',
      followUpQuestions: [],
    });
  };

  // Find fields with unresolved questions but don't show modal automatically
  findUnresolvedFields = () => {
    // Wait until fields and data are loaded
    if (
      this.state.isLoading ||
      !this.state.fields ||
      this.state.fields.length === 0
    ) {
      return;
    }

    // Find fields with unanswered questions (exclude explicitly non-editable fields if provided)
    const unresolvedFields = this.state.fields.filter(field => {
      const normalizedFieldId = field.field_id;
      const alternateFieldId = normalizedFieldId.includes('.0')
        ? normalizedFieldId.replace(/\.0(\d)/, '.$1')
        : normalizedFieldId.replace(/\.(\d)$/, '.0$1');

      const fieldData =
        this.state.localScrapedData[normalizedFieldId] ||
        this.state.localScrapedData[alternateFieldId];

      // Skip fields that are explicitly marked as non-editable by the page
      if (
        Array.isArray(this.props.nonEditableFields) &&
        this.props.nonEditableFields.includes(normalizedFieldId)
      ) {
        return false;
      }

      // Check if field has unanswered questions and hasn't been accepted or improved
      const hasUnansweredQuestions =
        fieldData &&
        fieldData.unanswered_questions &&
        fieldData.unanswered_questions.length > 0;
      const isAccepted =
        this.state.acceptedFields.includes(normalizedFieldId) ||
        this.state.acceptedFields.includes(alternateFieldId);
      const isImproved =
        this.state.improvedFields.includes(normalizedFieldId) ||
        this.state.improvedFields.includes(alternateFieldId);

      return hasUnansweredQuestions && !isAccepted && !isImproved;
    });

    console.log('Fields with unresolved questions:', unresolvedFields);
    this.setState({ fieldsWithUnresolvedQuestions: unresolvedFields });
  };

  // Handle submit answers - Updated to force re-render of ProgressBar
  handleSubmitAnswers = async (fieldKey, answers, originalValue) => {
    this.setState({ isLoading: true });

    try {
      // Get field name from the fields list
      const field = this.state.fields.find(f => f.field_id === fieldKey);
      const fieldName = field ? field.field_name : fieldKey;

      // Use the questionService to submit answers and get regenerated content
      const result = await submitAnswersAndRegenerate(
        fieldKey,
        answers,
        originalValue,
        this.props.contextType || 'OTH'
      );

      if (result) {
        // Get the regenerated text from the API response - directly use this
        const regeneratedValue = result.regeneratedValue;

        // Create the updated field data
        const updatedFieldData = {
          ...this.state.localScrapedData[fieldKey],
          fillOut: regeneratedValue,
          field_text: regeneratedValue,
          certainty: result.certainty,
          // Clear unanswered questions as they've been addressed
          unanswered_questions: [],
        };

        // Update the local scraped data
        const updatedLocalData = {
          ...this.state.localScrapedData,
          [fieldKey]: updatedFieldData,
        };

        this.setState(prevState => ({
          localScrapedData: updatedLocalData,
          improvedFields: [...prevState.improvedFields, fieldKey],
          expandedFields: {
            ...prevState.expandedFields,
            [fieldKey]: false,
          },
          progressUpdateTrigger: Date.now(), // Add trigger to force ProgressBar re-render
        }));

        // Force refresh the text field by re-rendering - use exactly what the API returns
        const textField = document.getElementById(`field-${fieldKey}`);
        if (textField) {
          textField.value = regeneratedValue;
        }

        // Update the context scraped data immediately
        if (this.props.updateScrapedData) {
          this.props.updateScrapedData(updatedLocalData);
        }

        // Update the context improved fields
        if (this.props.updateImprovedFields) {
          this.props.updateImprovedFields([
            ...this.state.improvedFields,
            fieldKey,
          ]);
        }

        // FIXED: Update the context field data using setFieldData to trigger auto-save
        if (this.props.setFieldData) {
          this.props.setFieldData(prevData => {
            const newData = {
              ...prevData,
              [fieldKey]: {
                ...prevData[fieldKey], // Preserve existing field data including field_name
                field_text: regeneratedValue,
                fillOut: regeneratedValue,
                certainty: result.certainty,
                unanswered_questions: [],
                lastUpdated: new Date().toISOString(),
              },
            };
            console.log(
              'Updating field data in context with regenerated value:',
              newData
            );
            return newData;
          });
        }

        // Also force an immediate save to ensure the regenerated data is persisted
        if (this.props.saveUserContextData && this.props.user?.sub) {
          try {
            await this.props.saveUserContextData(this.props.user.sub);
            console.log('Regenerated field data saved to context successfully');
          } catch (error) {
            console.error('Failed to save regenerated field data:', error);
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Error submitting answers:', error);
      return null;
    } finally {
      this.setState(
        {
          isLoading: false,
          isModalOpen: false,
          currentField: null,
        },
        () => {
          // Update the list of unresolved fields
          this.findUnresolvedFields();
        }
      );
    }
  };

  // Render accept button for fields with low certainty
  renderAcceptButton = fieldKey => {
    console.log(`renderAcceptButton called for ${fieldKey}`);
    console.log('Current localScrapedData:', this.state.localScrapedData);

    // Convert format if needed
    const apiFieldKey = fieldKey.includes('.0')
      ? fieldKey.replace(/\.0(\d)/, '.$1')
      : fieldKey.replace(/\.(\d)$/, '.0$1');

    // Try to find the field using either format
    const field =
      this.state.localScrapedData[fieldKey] ||
      this.state.localScrapedData[apiFieldKey];

    console.log(`renderAcceptButton - field data for ${fieldKey}:`, field);
    console.log(
      `renderAcceptButton - field data structure:`,
      JSON.stringify(field, null, 2)
    );

    const hasUnansweredQuestions =
      field &&
      field.unanswered_questions &&
      field.unanswered_questions.length > 0;
    const isAccepted = this.state.acceptedFields.includes(fieldKey);
    const isImproved = this.state.improvedFields.includes(fieldKey);

    console.log(`renderAcceptButton - conditions for ${fieldKey}:`, {
      hasUnansweredQuestions,
      isAccepted,
      isImproved,
    });

    if (hasUnansweredQuestions && !isAccepted && !isImproved) {
      console.log(`renderAcceptButton - rendering button for ${fieldKey}`);
      return (
        <button
          onClick={() => this.acceptFieldValue(fieldKey)}
          className='mt-0.5 bg-green-500 hover:bg-green-600 text-white px-1 py-0.5 rounded text-[8px] font-light h-5 inline-flex items-center justify-center'
        >
          Confirm as correct
        </button>
      );
    }
    console.log(`renderAcceptButton - NOT rendering button for ${fieldKey}`);
    return null;
  };

  // Render follow-up question button for uncertain fields
  renderFollowUpButton = fieldKey => {
    console.log(`renderFollowUpButton called for ${fieldKey}`);

    // Convert format if needed
    const apiFieldKey = fieldKey.includes('.0')
      ? fieldKey.replace(/\.0(\d)/, '.$1')
      : fieldKey.replace(/\.(\d)$/, '.0$1');

    // Try to find the field using either format
    const field =
      this.state.localScrapedData[fieldKey] ||
      this.state.localScrapedData[apiFieldKey];

    const hasUnansweredQuestions =
      field &&
      field.unanswered_questions &&
      field.unanswered_questions.length > 0;
    const isAccepted = this.state.acceptedFields.includes(fieldKey);
    const isImproved = this.state.improvedFields.includes(fieldKey);

    console.log(`renderFollowUpButton - conditions for ${fieldKey}:`, {
      hasUnansweredQuestions,
      isAccepted,
      isImproved,
    });

    if (hasUnansweredQuestions && !isAccepted && !isImproved) {
      const isExpanded = this.state.expandedFields[fieldKey];

      return (
        <button
          onClick={() => {
            console.log(
              `Toggle expanded state for ${fieldKey}. Current state:`,
              isExpanded
            );
            this.setState(
              prevState => ({
                expandedFields: {
                  ...prevState.expandedFields,
                  [fieldKey]: !prevState.expandedFields[fieldKey],
                },
                currentField: isExpanded ? null : fieldKey,
                currentFieldValue: isExpanded
                  ? ''
                  : this.getFieldValue(fieldKey),
                followUpQuestions: isExpanded
                  ? []
                  : field.unanswered_questions || [],
              }),
              () => {
                console.log(
                  `Updated expandedFields state:`,
                  this.state.expandedFields
                );
              }
            );
          }}
          className='mt-0.5 ml-2 bg-blue-400 hover:bg-blue-500 text-white px-1 py-0.5 rounded text-[8px] font-light h-5 inline-flex items-center justify-center'
        >
          {isExpanded ? 'Hide follow-up questions' : 'Show follow-up questions'}
        </button>
      );
    }
    return null;
  };

  // Render both buttons for uncertain fields
  renderActionButtons = fieldKey => {
    return (
      <div className='flex items-center gap-2'>
        {this.renderAcceptButton(fieldKey)}
        {this.renderFollowUpButton(fieldKey)}
      </div>
    );
  };

  // Pass to child components to allow them to show the follow-up modal
  showFollowUpModal = (
    fieldKey,
    fieldValue,
    fieldTitle,
    guidelines = '',
    unansweredQuestions = []
  ) => {
    console.log('showFollowUpModal called with:', {
      fieldKey,
      fieldTitle,
      hasQuestions: unansweredQuestions && unansweredQuestions.length > 0,
    });

    this.handleFollowUpQuestion(
      fieldKey,
      fieldValue,
      fieldTitle,
      guidelines,
      unansweredQuestions
    );
  };

  // Handle navigation to next page
  handleNavigateToNext = () => {
    // First make sure we have the latest data on unresolved fields
    this.findUnresolvedFields();

    // Check if all fields have been addressed
    const allAddressed = this.checkAllFieldsAddressed();

    if (allAddressed) {
      // Save all states to context before navigation
      if (this.props.updateAcceptedFields) {
        this.props.updateAcceptedFields(this.state.acceptedFields);
      }
      if (this.props.updateImprovedFields) {
        this.props.updateImprovedFields(this.state.improvedFields);
      }
      if (this.props.updateScrapedData) {
        this.props.updateScrapedData(this.state.localScrapedData);
      }

      // Get the next route from props or state
      const nextRoute = this.props.nextRoute || this.state.nextRoute;

      // Only navigate if all fields are addressed
      this.props.navigate(nextRoute, {
        state: {
          scrapedData: this.state.localScrapedData,
          acceptedFields: this.state.acceptedFields,
          improvedFields: this.state.improvedFields,
        },
      });

      // Scroll to top after navigation
      window.scrollTo(0, 0);
    } else {
      // Mark that we attempted navigation but it failed
      this.setState({ attemptedNavigation: true }, () => {
        // Get the unresolved fields
        const unresolvedFields = this.getUnresolvedFields();
        console.log(
          'Unresolved fields preventing navigation:',
          unresolvedFields
        );

        if (unresolvedFields.length > 0) {
          // Scroll to the first unresolved field with a delay to ensure state is updated
          setTimeout(() => {
            const firstUnresolvedField = document.getElementById(
              `field-${unresolvedFields[0]}`
            );
            if (firstUnresolvedField) {
              // Scroll to the element
              firstUnresolvedField.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });

              // Add a visual highlight effect with stronger styling
              firstUnresolvedField.classList.add('pulse-highlight');
              firstUnresolvedField.classList.add('border-red-500');
              firstUnresolvedField.classList.add('border-2');

              // Remove the highlight effect after some time
              setTimeout(() => {
                firstUnresolvedField.classList.remove('pulse-highlight');
                firstUnresolvedField.classList.remove('border-red-500');
                firstUnresolvedField.classList.remove('border-2');
              }, 3000);
            }
          }, 100);

          // Removed the alert dialog that was here
        }
      });
    }

    return false; // Prevent default behavior
  };
  renderWarningBanner = () => {
    if (this.state.attemptedNavigation && !this.checkAllFieldsAddressed()) {
      const unresolvedFields = this.getUnresolvedFields();

      return (
        <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 sticky top-0 z-10 shadow-md'>
          <div className='flex items-center'>
            <svg
              className='h-6 w-6 mr-2 flex-shrink-0'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z'
                clipRule='evenodd'
              />
            </svg>
            <div>
              <p className='font-bold text-lg'>
                You must address all highlighted fields before proceeding.
              </p>
              <p className='mt-1'>
                Please review the following fields:{' '}
                {unresolvedFields.join(', ')}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get unresolved fields for display in warning message
  getUnresolvedFields = () => {
    // If the child component provides a custom implementation, use it
    if (this.props.getCustomUnresolvedFields) {
      const customUnresolvedFields = this.props.getCustomUnresolvedFields();
      if (customUnresolvedFields !== null) {
        return customUnresolvedFields;
      }
    }

    // Get only the field IDs for the current section
    const currentSectionFieldIds = this.state.fields.map(
      field => field.field_id
    );

    return currentSectionFieldIds.filter(fieldId => {
      // Try both formats of the field ID
      const normalizedFieldId = fieldId;
      const alternateFieldId = fieldId.includes('.0')
        ? fieldId.replace(/\.0(\d)/, '.$1')
        : fieldId.replace(/\.(\d)$/, '.0$1');

      // Get the field data using either format
      const field =
        this.state.localScrapedData[normalizedFieldId] ||
        this.state.localScrapedData[alternateFieldId];

      // Skip fields that are explicitly marked as non-editable by the page
      if (
        Array.isArray(this.props.nonEditableFields) &&
        this.props.nonEditableFields.includes(normalizedFieldId)
      ) {
        return false;
      }

      // Check if this field has unanswered questions and hasn't been addressed
      const hasUnansweredQuestions =
        field &&
        field.unanswered_questions &&
        field.unanswered_questions.length > 0;

      const isAccepted =
        this.state.acceptedFields.includes(normalizedFieldId) ||
        this.state.acceptedFields.includes(alternateFieldId);

      const isImproved =
        this.state.improvedFields.includes(normalizedFieldId) ||
        this.state.improvedFields.includes(alternateFieldId);

      return hasUnansweredQuestions && !isAccepted && !isImproved;
    });
  };

  // Check if all uncertain fields have been addressed
  checkAllFieldsAddressed = () => {
    const unresolvedFields = this.getUnresolvedFields();
    console.log(
      'Checking if all fields addressed. Unresolved fields:',
      unresolvedFields
    );
    return unresolvedFields.length === 0;
  };

  renderInlineFollowUpQuestions = fieldKey => {
    console.log(`Checking if should render inline questions for ${fieldKey}`, {
      isExpanded: this.state.expandedFields[fieldKey],
      expandedFields: this.state.expandedFields,
    });

    if (!this.state.expandedFields[fieldKey]) return null;

    const apiFieldKey = fieldKey.includes('.0')
      ? fieldKey.replace(/\.0(\d)/, '.$1')
      : fieldKey.replace(/\.(\d)$/, '.0$1');
    const field =
      this.state.localScrapedData[fieldKey] ||
      this.state.localScrapedData[apiFieldKey];
    const questions = field?.unanswered_questions || [];

    console.log(`Found ${questions.length} questions for ${fieldKey}`);

    if (questions.length === 0) return null;

    return (
      <div className='mt-3 p-3 border border-blue-200 rounded bg-blue-50'>
        <FollowUpModal
          isInline={true}
          isOpen={true}
          fieldKey={fieldKey}
          fieldValue={this.getFieldValue(fieldKey)}
          questions={questions}
          onSubmit={this.handleSubmitAnswers}
          isLoading={this.state.isLoading}
          onClose={() => {
            this.setState(prevState => ({
              expandedFields: {
                ...prevState.expandedFields,
                [fieldKey]: false,
              },
              currentField: null,
            }));
          }}
        />
      </div>
    );
  };

  // This method should be overridden by child classes to render fields
  renderFields() {
    // Show loading state
    if (this.state.isLoading) {
      return (
        <div className='flex justify-center items-center py-10'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500'></div>
        </div>
      );
    }

    // Show error state
    if (
      this.state.error ||
      !this.state.fields ||
      this.state.fields.length === 0
    ) {
      return (
        <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6'>
          <p className='font-bold'>Error loading fields</p>
          <p>
            {this.state.error ||
              'No fields found for this section. Please check the database.'}
          </p>
        </div>
      );
    }

    // If fields have been loaded from the database, render them dynamically
    return this.state.fields.map(field => (
      <div key={field.field_id} className='mb-10'>
        <label
          className='block text-gray-700 font-semibold font-inter text-[16px] leading-[19px] text-black text-[20px] leading-[24px] mb-[10px] mb-5'
          htmlFor={`field-${field.field_id}`}
        >
          <span className='text-blue-500 font-mono mr-2'>
            {field.field_id}:
          </span>{' '}
          {field.field_name}
        </label>
        <div className='flex flex-col'>
          <textarea
            className={`bg-[rgba(99,93,255,0.05)] border border-[rgba(99,93,255,0.5)] p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full ${this.getHighlightClass(field.field_id)}`}
            rows='2'
            cols='50'
            id={`field-${field.field_id}`}
            defaultValue={this.getFieldValue(field.field_id)}
            spellCheck='false'
          ></textarea>
          <div className='self-start'>
            {this.renderActionButtons(field.field_id)}
          </div>
          {this.renderInlineFollowUpQuestions(field.field_id)}
        </div>
      </div>
    ));
  }

  render() {
    // Determine if this is a final section that should use "Validate and Generate" button
    const isFinalSection = this.state.nextRoute === '/thankyou';
    const isArtOrEmtToken =
      this.props.tokenType === 'ART' || this.props.tokenType === 'EMT';

    return (
      <>
        <Header />
        <Sidebar />

        <FollowUpModal
          isOpen={this.state.isModalOpen}
          onClose={this.handleCloseModal}
          fieldKey={this.state.currentField}
          fieldValue={this.state.currentFieldValue}
          questions={this.state.followUpQuestions}
          onSubmit={this.handleSubmitAnswers}
          isLoading={this.state.isLoading}
        />

        <div className='main-dashboard main-dashboard-bg ml-64' style={{ marginTop: 'var(--header-height)' }}>
          <div className='container'>
            <div className='main-dashboard-row'>
              <div className='main-banner questionare-btn rounded-lg pr-0 w-[100%] col-span-1 my-[30px] mx-0 lg:w-[75%] max-w-full md:w-[75%] max-w-full py-0'>
                <div className='das-boargd-questionare'>
                  {this.props.renderBreadcrumb ? (
                    this.props.renderBreadcrumb()
                  ) : (
                    <BreadcrumbNav currentPageName={this.state.sectionTitle} />
                  )}

                  {/* Updated ProgressBar to include local state data */}
                  <ProgressBar
                    localData={this.state.localScrapedData}
                    acceptedFields={this.state.acceptedFields}
                    improvedFields={this.state.improvedFields}
                    key={this.state.progressUpdateTrigger || 'initial'} // Force re-render on update
                  />

                  {/* Add MarkedFieldsMenu right below ProgressBar */}
                  <MarkedFieldsMenu />

                  <h2 className='font-inter font-normal font-semibold text-[30px] leading-[36px] flex items-center mb-5'>
                    {this.state.sectionTitle}
                  </h2>
                  {this.state.sectionDescription && (
                    <h3 className='font-inter italic font-normal text-[25px] leading-[30px] text-[#42BBFF] mb-10'>
                      {this.state.sectionDescription}
                    </h3>
                  )}
                </div>

                {/* Warning banner shown when fields are not addressed */}
                {this.renderWarningBanner()}

                <div className='box-wrapper'>
                  {/* Fields rendered by child classes */}
                  {typeof this.props.renderFields === 'function'
                    ? this.props.renderFields({
                        getFieldValue: this.getFieldValue,
                        getHighlightClass: this.getHighlightClass,
                        renderActionButtons: this.renderActionButtons,
                        renderInlineFollowUpQuestions:
                          this.renderInlineFollowUpQuestions,
                        showFollowUpModal: this.showFollowUpModal,
                      })
                    : this.renderFields()}
                  <div className='flex flex-col items-start'>
                    {this.props.renderCustomButton ? (
                      this.props.renderCustomButton(this)
                    ) : (
                      <Button
                        onClick={this.handleNavigateToNext}
                        variant='default'
                      >
                        {/* Change button text based on section and token type */}
                        {isFinalSection && isArtOrEmtToken
                          ? 'Validate and generate report'
                          : 'Next'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add CSS for the pulse highlight effect */}
        <style>{`
          @keyframes pulse-highlight {
            0% {
              box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
            }
          }

          .pulse-highlight {
            animation: pulse-highlight 1.5s ease-out;
          }
        `}</style>
      </>
    );
  }
}

// Higher-order component to connect BaseSectionComponent with React hooks
const withHooks = Component => {
  const WrappedComponent = props => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const targetFieldId = searchParams.get('fieldId');

    // Effect to scroll to the highlighted field when URL contains fieldId parameter
    useEffect(() => {
      if (targetFieldId) {
        // Small delay to ensure rendering is complete
        setTimeout(() => {
          const targetField = document.getElementById(`field-${targetFieldId}`);
          if (targetField) {
            targetField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetField.focus();
            // Add visual highlighting
            targetField.classList.add('highlight-field');
            // Remove highlighting after animation
            setTimeout(() => {
              targetField.classList.remove('highlight-field');
            }, 2000);
          }
        }, 300);
      }
    }, [targetFieldId, location.pathname]);

    const {
      scrapedData: contextData,
      updateScrapedData,
      acceptedFields: contextAcceptedFields,
      improvedFields: contextImprovedFields,
      updateAcceptedFields,
      updateImprovedFields,
      setFieldData,
      saveUserContextData,
      contextType,
    } = useDataContext();

    return (
      <Component
        {...props}
        state={location.state}
        navigate={navigate}
        contextData={contextData}
        updateScrapedData={updateScrapedData}
        contextAcceptedFields={contextAcceptedFields}
        contextImprovedFields={contextImprovedFields}
        updateAcceptedFields={updateAcceptedFields}
        updateImprovedFields={updateImprovedFields}
        setFieldData={setFieldData}
        saveUserContextData={saveUserContextData}
        contextType={contextType}
        // Make sure tokenType is always passed from props
        tokenType={props.tokenType}
      />
    );
  };

  WrappedComponent.displayName = `withHooks(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
};

export default withHooks(BaseSectionComponent);
