import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDataContext } from '../../../context/DataContext';
import Loader from '../../Common/Loader';
import { useFormValidation } from './useFormValidation';
import { Button } from '../../ui/button';

const MyForm = () => {
  const [formData, setFormData] = useState({
    tokenName: '',
    email: '',
    links: [], // Changed from string to array
    whitepaperType: 'OTH',
    context: '',
  });
  const [currentLink, setCurrentLink] = useState(''); // State for the current link being entered
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const navigate = useNavigate();
  const { errors, isFormValid } = useFormValidation(formData);
  const { saveUserContextData, setFieldData } = useDataContext();

  const tooltipText = `
    Please provide any web links that offer additional context or supporting information about the crypto-asset. These may include:
    • Technical whitepaper(s)
    • Official company or project website
    • Tokenomics documentation or dashboards
    • Product or platform landing pages
    • Links to GitHub repositories (if applicable)
    • Regulatory disclosures or audits
    • Articles, FAQs, or explanatory blog posts
    
    You may submit multiple links. These help reviewers better understand the project scope, structure, and credibility.
  `;

  // Update state when input fields change
  const handleInputChange = e => {
    const { id, value } = e.target;
    setFormData(prev => {
      const updatedData = { ...prev, [id]: value };

      // Save form data to context immediately like PartA
      setFieldData(prevFieldData => ({
        ...prevFieldData,
        myFormData: {
          tokenName: updatedData.tokenName,
          email: updatedData.email,
          links: updatedData.links,
          whitepaperType: updatedData.whitepaperType,
          context: updatedData.context,
        },
      }));

      // Save context data after updating
      saveUserContextData();

      return updatedData;
    });
  };

  const handleLinkInputChange = e => {
    setCurrentLink(e.target.value);
  };

  const addLink = () => {
    if (currentLink.trim()) {
      setFormData(prev => {
        const updatedData = {
          ...prev,
          links: [...prev.links, currentLink.trim()],
        };

        // Save form data to context immediately like PartA
        setFieldData(prevFieldData => ({
          ...prevFieldData,
          myFormData: {
            tokenName: updatedData.tokenName,
            email: updatedData.email,
            links: updatedData.links,
            whitepaperType: updatedData.whitepaperType,
            context: updatedData.context,
          },
        }));

        // Save context data after updating
        saveUserContextData();

        return updatedData;
      });
      setCurrentLink('');
    }
  };

  const handleLinkKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLink();
    }
  };

  // Remove a link from the array
  const removeLink = indexToRemove => {
    setFormData(prev => {
      const updatedData = {
        ...prev,
        links: prev.links.filter((_, index) => index !== indexToRemove),
      };

      // Save form data to context immediately like PartA
      setFieldData(prevFieldData => ({
        ...prevFieldData,
        myFormData: {
          tokenName: updatedData.tokenName,
          email: updatedData.email,
          links: updatedData.links,
          whitepaperType: updatedData.whitepaperType,
          context: updatedData.context,
        },
      }));

      // Save context data after updating
      saveUserContextData();

      return updatedData;
    });
  };

  // Toggle tooltip visibility
  const toggleTooltip = () => {
    setShowTooltip(prev => !prev);
  };

  // Close tooltip when clicking outside
  const closeTooltip = e => {
    if (!e.target.closest('.tooltip-container')) {
      setShowTooltip(false);
    }
  };

  // Add event listener for clicking outside
  React.useEffect(() => {
    if (showTooltip) {
      document.addEventListener('mousedown', closeTooltip);
    } else {
      document.removeEventListener('mousedown', closeTooltip);
    }
    return () => {
      document.removeEventListener('mousedown', closeTooltip);
    };
  }, [showTooltip]);

  // Handle form submission
  const handleLinkClick = async e => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!isFormValid) {
      return;
    }

    // Final save - this is already done on each change now
    // Save additional form data to localStorage
    localStorage.setItem('tokenName', formData.tokenName);
    localStorage.setItem('email', formData.email);

    try {
      setIsLoading(true);
      setError(null);

      // Navigate to questionnaire page with current form data
      navigate('/questionnaire', { state: { formData } });
    } catch (err) {
      console.error('Error processing form:', err);
      setError('There was an error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full dashboard-form'>
      <style>{`
        ::placeholder {
          color: #9ca3af !important;
          opacity: 1;
        }
        input:focus::placeholder {
          opacity: 0.7;
        }
      `}</style>

      <form>
        <h1 className='text-2xl font-bold mb-4'>Contact Information</h1>
        <p className='mb-6'>
          Please provide contact information to help us process your request
          more effectively.
        </p>
        <div className='mb-4'>
          <label
            htmlFor='tokenName'
            className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
          >
            Your Name
          </label>
          <input
            type='text'
            id='tokenName'
            value={formData.tokenName}
            onChange={handleInputChange}
            className={`mt-1 p-2 w-full border rounded-lg ${
              errors.tokenName && isSubmitted
                ? 'border-red-500'
                : 'border-gray-300'
            } ${formData.tokenName === '' ? 'text-gray-500 placeholder-gray-400' : 'text-gray-900'}`}
            placeholder='Your Name'
          />
          {errors.tokenName && isSubmitted && (
            <p className='text-red-500'>{errors.tokenName}</p>
          )}
        </div>

        <div className='mb-4'>
          <label
            htmlFor='email'
            className='block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]'
          >
            Email Address
          </label>
          <input
            type='email'
            id='email'
            value={formData.email}
            onChange={handleInputChange}
            className={`mt-1 p-2 w-full border rounded-lg ${
              errors.email && isSubmitted ? 'border-red-500' : 'border-gray-300'
            } ${formData.email === '' ? 'text-gray-500 placeholder-gray-400' : 'text-gray-900'}`}
            placeholder='Email...'
          />
          {errors.email && isSubmitted && (
            <p className='text-red-500'>{errors.email}</p>
          )}
        </div>

        <div className='mb-4'>
          <div className='flex items-center mb-[10px] relative tooltip-container'>
            <label
              htmlFor='relevantLinks'
              className='block text-gray-700 font-semibold text-[16px] leading-[19px]'
            >
              Relevant Links
            </label>
            <span
              className='ml-2 text-gray-500 text-sm cursor-help bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center p-0 m-0 leading-none'
              onClick={toggleTooltip}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleTooltip();
                }
              }}
              role='button'
              tabIndex={0}
              aria-label='Show help information'
              style={{ padding: 0 }}
            >
              ?
            </span>
            {showTooltip && (
              <div className='absolute bg-gray-300 text-gray-600 p-1 rounded-md text-sm w-80 top-full whitespace-pre-wrap'>
                <div>{tooltipText}</div>
              </div>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <input
              id='relevantLinks'
              type='text'
              value={currentLink}
              onChange={handleLinkInputChange}
              onKeyPress={handleLinkKeyPress}
              className={`mt-1 p-2 border rounded-lg border-gray-300 w-full ${
                currentLink === ''
                  ? 'text-gray-500 placeholder-gray-400'
                  : 'text-gray-900'
              }`}
              placeholder='Enter a link and press Enter or Add'
            />
            <button
              type='button'
              onClick={addLink}
              className='mt-1 p-2 bg-[#42BBFF] text-white rounded-lg hover:bg-blue-700 h-10 w-10 flex items-center justify-center flex-shrink-0'
            >
              +
            </button>
          </div>
          {formData.links.length > 0 && (
            <div className='mt-2'>
              {formData.links.map((link, index) => (
                <div
                  key={index}
                  className='flex items-center mt-1 gap-2 w-full'
                >
                  <div
                    className='p-2 border border-gray-200 rounded-lg w-full overflow-hidden'
                    title={link}
                  >
                    <a
                      href={link.startsWith('http') ? link : `https://${link}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm truncate block w-full text-blue-500 hover:text-blue-700'
                    >
                      {link}
                    </a>
                  </div>
                  <button
                    type='button'
                    onClick={() => removeLink(index)}
                    className='p-2 text-red-500 hover:text-red-700 flex items-center justify-center flex-shrink-0 h-10 w-10'
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/*
        <div className="mb-4">
          <label htmlFor="links" className="block text-gray-700 font-semibold text-[16px] leading-[19px] mb-[10px]">
            Additional Context
          </label>
          <textarea
            id="context"
            value={formData.context}
            onChange={handleInputChange}
            className="mt-1 p-2 w-full border rounded-lg border-gray-300 resize-y"
            placeholder="Provide additional context or information..."
            rows={4}
          />
        </div>
        */}

        <Link to='#' onClick={handleLinkClick}>
          <Button
            className='w-full'
            variant='default'
            size='lg'
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <div className='flex items-center justify-center'>
                <Loader />
                <span className='ml-2'>Processing...</span>
              </div>
            ) : (
              'Continue to Questionnaire'
            )}
          </Button>
        </Link>
      </form>

      {error && <p className='text-red-500 mt-4'>{error}</p>}
    </div>
  );
};

export default MyForm;
