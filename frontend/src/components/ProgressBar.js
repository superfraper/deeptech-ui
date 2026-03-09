import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDataContext } from '../context/DataContext';

const ProgressBar = ({
  localData,
  acceptedFields = [],
  improvedFields = [],
  onFieldClick,
}) => {
  const { fieldData } = useDataContext();
  const [showUnansweredList, setShowUnansweredList] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Use either passed localData or context fieldData
  const data = localData || fieldData;

  // Map field prefixes to their corresponding routes
  const routeMapping = {
    A: '/part1',
    B: '/part2',
    C: '/part3',
    D: '/part4',
    E: '/part5',
    F: '/part6',
    G: '/part7',
    H: '/part8',
    'I.00': '/section1',
    'I.01': '/section1',
    'I.02': '/section1',
    'I.03': '/section1',
    'I.04': '/section1',
    'I.05': '/section1',
    'I.06': '/section1',
    'I.07': '/summery',
    'I.08': '/summery',
    'I.09': '/summery',
    'I.10': '/summery',
    'I.1': '/part9',
    'I.2': '/part9',
    'I.3': '/part9',
    'I.4': '/part9',
    'I.5': '/part9',
    'I.6': '/part9',
    J: '/finalpart',
    S: '/finalpart',
  };

  // Get context type to determine correct routing
  const { contextType } = useDataContext();

  // Update route mapping based on context type
  const getRouteForField = fieldPrefix => {
    const baseRoute = routeMapping[fieldPrefix];

    // For OTH tokens, use OTH-specific routes
    if (
      contextType === 'OTH_UTILITY' ||
      contextType === 'OTH_NON_UTILITY' ||
      contextType === 'OTH'
    ) {
      switch (baseRoute) {
        case '/section1':
          return '/oth/section1';
        case '/summery':
          return '/oth/summery';
        case '/part1':
          return '/oth/partA';
        case '/part2':
          return '/oth/partB';
        case '/part3':
          return '/oth/partC';
        case '/part4':
          return '/oth/partD';
        case '/part5':
          return '/oth/partE';
        case '/part6':
          return '/oth/partF';
        case '/part7':
          return '/oth/partG';
        case '/part8':
          return '/oth/partH';
        case '/part9':
          return '/oth/partI';
        case '/finalpart':
          return '/oth/partJ';
        default:
          return baseRoute;
      }
    }

    // For ART tokens, use ART-specific routes
    if (contextType === 'ART') {
      switch (baseRoute) {
        case '/section1':
          return '/art/section1';
        case '/summery':
          return '/art/summery';
        case '/part1':
          return '/art/partA';
        case '/part2':
          return '/art/partB';
        case '/part3':
          return '/art/partC';
        case '/part4':
          return '/art/partD';
        case '/part5':
          return '/art/partE';
        case '/part6':
          return '/art/partF';
        case '/part7':
          return '/art/partG';
        case '/part8':
          return '/art/partH';
        case '/part9':
          return '/art/partH'; // Map to partH as there's no partI in ART
        case '/finalpart':
          return '/art/partH'; // Map to partH as there's no partJ in ART
        default:
          return baseRoute;
      }
    }

    // For EMT tokens, use EMT-specific routes
    if (contextType === 'EMT') {
      switch (baseRoute) {
        case '/section1':
          return '/emt/section1';
        case '/summery':
          return '/emt/summery';
        case '/part1':
          return '/emt/partA';
        case '/part2':
          return '/emt/partB';
        case '/part3':
          return '/emt/partC';
        case '/part4':
          return '/emt/partD';
        case '/part5':
          return '/emt/partE';
        case '/part6':
          return '/emt/partF';
        case '/part7':
          return '/emt/partG';
        case '/part8':
          return '/emt/partG'; // Map to partG as there's no partH in EMT
        case '/part9':
          return '/emt/partG'; // Map to partG as there's no partI in EMT
        case '/finalpart':
          return '/emt/partG'; // Map to partG as there's no partJ in EMT
        default:
          return baseRoute;
      }
    }

    return baseRoute;
  };

  // Calculate progress statistics
  const stats = useMemo(() => {
    if (!data || Object.keys(data).length === 0) {
      return { total: 0, unansweredCount: 0, completionPercentage: 100 };
    }

    // Exclude globally ignored fields; for OTH also exclude H.9 from checks
    const excludedFields = [
      'S.20',
      'S.30',
      ...(contextType === 'OTH' ||
      contextType === 'OTH_UTILITY' ||
      contextType === 'OTH_NON_UTILITY'
        ? ['H.9']
        : []),
    ];
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([fieldId]) => !excludedFields.includes(fieldId)
      )
    );

    const total = Object.keys(filteredData).length;

    // Check if B.1 is "No" for special Part B handling
    const b1Field = filteredData['B.1'];
    const b1Value = b1Field ? b1Field.field_text : 'Yes';
    const isB1No =
      b1Value === 'FALSE' ||
      b1Value === 'False' ||
      b1Value === 'false' ||
      b1Value === 'No' ||
      b1Value === 'no';

    // Count fields with unanswered questions that haven't been accepted or improved
    const fieldsWithUnansweredQuestions = Object.entries(filteredData).filter(
      ([fieldId, field]) => {
        // Special handling for Part B fields when B.1 is "No"
        if (isB1No && fieldId.startsWith('B.') && fieldId !== 'B.1') {
          return false; // Consider Part B fields as resolved when B.1 is "No"
        }

        const hasUnansweredQuestions =
          field.unanswered_questions && field.unanswered_questions.length > 0;
        const isAccepted = acceptedFields.includes(fieldId);
        const isImproved = improvedFields.includes(fieldId);

        return hasUnansweredQuestions && !isAccepted && !isImproved;
      }
    );

    const unansweredCount = fieldsWithUnansweredQuestions.length;
    const completionPercentage =
      total > 0 ? Math.round(((total - unansweredCount) / total) * 100) : 100;

    return { total, unansweredCount, completionPercentage };
  }, [data, acceptedFields, improvedFields]); // Added dependency to recalculate when data changes

  // Get unanswered fields for the dropdown
  const unansweredFields = useMemo(() => {
    if (!data) return [];
    // Exclude globally ignored fields; for OTH also exclude H.9 from checks
    const excludedFields = [
      'S.20',
      'S.30',
      ...(contextType === 'OTH' ||
      contextType === 'OTH_UTILITY' ||
      contextType === 'OTH_NON_UTILITY'
        ? ['H.9']
        : []),
    ];

    // Check if B.1 is "No" for special Part B handling
    const b1Field = data['B.1'];
    const b1Value = b1Field ? b1Field.field_text : 'Yes';
    const isB1No =
      b1Value === 'FALSE' ||
      b1Value === 'False' ||
      b1Value === 'false' ||
      b1Value === 'No' ||
      b1Value === 'no';

    return Object.entries(data)
      .filter(([fieldId, field]) => {
        // Skip excluded fields
        if (excludedFields.includes(fieldId)) return false;

        // Special handling for Part B fields when B.1 is "No"
        if (isB1No && fieldId.startsWith('B.') && fieldId !== 'B.1') {
          return false; // Don't show Part B fields as unanswered when B.1 is "No"
        }

        const hasUnansweredQuestions =
          field.unanswered_questions && field.unanswered_questions.length > 0;
        const isAccepted = acceptedFields.includes(fieldId);
        const isImproved = improvedFields.includes(fieldId);

        return hasUnansweredQuestions && !isAccepted && !isImproved;
      })
      .map(([fieldId, field]) => ({
        id: fieldId,
        title: field.title || field.name || fieldId,
        section: getFieldSection(fieldId),
      }));
  }, [data, acceptedFields, improvedFields]); // Added dependency to recalculate when data changes

  // Function to determine section from field ID
  function getFieldSection(fieldId) {
    // Extract the section prefix from the field ID
    if (fieldId.startsWith('I.0')) {
      return fieldId.substring(0, 4); // For I.00-I.06
    } else if (fieldId.startsWith('I.')) {
      if (/I\.\d\d/.test(fieldId)) {
        return fieldId.substring(0, 4); // For I.07-I.10
      }
      return fieldId.substring(0, 3); // For I.1-I.6
    }
    // For other sections (A-H, J), just take the first character
    return fieldId.charAt(0);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUnansweredList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  const getProgressStyle = () => {
    if (stats.completionPercentage === 100) {
      return { background: '#10b981' };
    }

    return {
      background:
        'linear-gradient(to right, #ef4444, #f97316, #facc15, #10b981)',
      backgroundSize: `${100 * (100 / stats.completionPercentage)}% 100%`,
      backgroundPosition: 'left',
    };
  };

  const getTextColorClass = () => {
    if (stats.completionPercentage === 100) return 'text-green-600 font-bold';
    if (stats.completionPercentage >= 80) return 'text-green-600';
    if (stats.completionPercentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Generate a unique URL for each field to force navigation even when on same route
  const getFieldUrl = (route, fieldId) => {
    const currentPath = location.pathname;
    // If we're already on this route, add or update the query parameter
    if (currentPath === route) {
      return `${route}?field=${fieldId}&t=${new Date().getTime()}`;
    }
    return route;
  };

  return (
    <div className='mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200'>
      <div className='flex flex-col md:flex-row md:items-center justify-between mb-2'>
        <h3 className='font-semibold text-lg mb-2 md:mb-0'>
          Whitepaper Completion Status
        </h3>
        <div className='text-sm font-medium'>
          <span className={getTextColorClass()}>
            {stats.total - stats.unansweredCount}
          </span>
          <span className='text-gray-600'> of </span>
          <span className='text-blue-600'>{stats.total}</span>
          <span className='text-gray-600'> fields complete</span>
        </div>
      </div>

      <div className='w-full bg-gray-200 rounded-full h-5 mb-2 overflow-hidden'>
        <div
          className='h-5 rounded-full transition-all duration-500'
          style={{
            width: `${stats.completionPercentage}%`,
            ...getProgressStyle(),
          }}
        ></div>
      </div>

      <div className='flex justify-between text-xs text-gray-500'>
        <span className={getTextColorClass()}>
          {stats.completionPercentage}% Complete
          {stats.completionPercentage === 100 && ' ✓'}
        </span>
        {stats.unansweredCount > 0 && (
          <div className='relative' ref={dropdownRef}>
            <span
              role='button'
              tabIndex={0}
              className='text-red-600 font-medium cursor-pointer hover:underline flex items-center'
              onClick={() => setShowUnansweredList(!showUnansweredList)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowUnansweredList(!showUnansweredList);
                }
              }}
            >
              {stats.unansweredCount}{' '}
              {stats.unansweredCount === 1 ? 'field' : 'fields'} need attention
            </span>

            {showUnansweredList && (
              <div className='absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-64 max-h-60 overflow-y-auto'>
                <div className='p-2 text-xs font-medium text-gray-700 border-b'>
                  Unanswered Fields:
                </div>
                <ul className='py-1'>
                  {unansweredFields.map(field => {
                    const route = getRouteForField(field.section);
                    const fieldUrl = getFieldUrl(route, field.id);

                    return (
                      <li
                        key={field.id}
                        className='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100'
                      >
                        <Link
                          to={fieldUrl}
                          className='flex items-center w-full'
                          onClick={() => setShowUnansweredList(false)}
                          state={{
                            scrollToField: field.id,
                            highlightField: field.id,
                          }}
                        >
                          <span className='truncate'>{field.id}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
        {stats.completionPercentage === 100 && (
          <span className='text-green-600 font-medium'>
            All fields completed!
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
