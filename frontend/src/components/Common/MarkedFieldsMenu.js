import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarkedFields } from '../../context/MarkedFieldsContext';
import { useDataContext } from '../../context/DataContext';

const MarkedFieldsMenu = () => {
  const { markedFields } = useMarkedFields();
  const { contextType } = useDataContext();
  const [isExpanded, setIsExpanded] = useState(false);

  // Map section to route based on context type
  const getSectionRoute = section => {
    const isOTH =
      contextType === 'OTH_UTILITY' || contextType === 'OTH_NON_UTILITY';
    const isART = contextType === 'ART';
    const isEMT = contextType === 'EMT';

    if (isOTH) {
      const othRouteMap = {
        partA: '/oth/partA',
        partB: '/oth/partB',
        partC: '/oth/partC',
        partD: '/oth/partD',
        partE: '/oth/partE',
        partF: '/oth/partF',
        partG: '/oth/partG',
        partH: '/oth/partH',
        partI: '/oth/partI',
        partJ: '/oth/partJ',
        section1: '/oth/section1',
        summery: '/oth/summery',
      };
      return othRouteMap[section] || '/';
    }

    if (isART) {
      const artRouteMap = {
        partA: '/art/partA',
        partAA: '/art/partAA',
        partB: '/art/partB',
        partC: '/art/partC',
        partD: '/art/partD',
        partE: '/art/partE',
        partF: '/art/partF',
        partG: '/art/partG',
        partH: '/art/partH',
        section1: '/art/section1',
        summery: '/art/summery',
      };
      return artRouteMap[section] || '/';
    }

    if (isEMT) {
      const emtRouteMap = {
        partA: '/emt/partA',
        partB: '/emt/partB',
        partC: '/emt/partC',
        partD: '/emt/partD',
        partE: '/emt/partE',
        partF: '/emt/partF',
        partG: '/emt/partG',
        section1: '/emt/section1',
        summery: '/emt/summery',
      };
      return emtRouteMap[section] || '/';
    }

    const routeMap = {
      partA: '/part1',
      partB: '/part2',
      partC: '/part3',
      partD: '/part4',
      partE: '/part5',
      partF: '/part6',
      partG: '/part7',
      partH: '/part8',
      partI: '/part9',
      partJ: '/finalpart',
      section1: '/section1',
      summery: '/summery',
    };
    return routeMap[section] || '/';
  };

  // Group fields by section
  const fieldsBySection = markedFields.reduce((acc, field) => {
    if (!acc[field.sectionName]) {
      acc[field.sectionName] = [];
    }
    acc[field.sectionName].push(field);
    return acc;
  }, {});

  if (markedFields.length === 0) {
    return null; // Don't show anything if no fields are marked
  }

  return (
    <div className='mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
      <button
        className='w-full p-4 text-left font-semibold text-lg flex justify-between items-center focus:outline-none bg-white border-b border-gray-100'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 inline-block mr-2 text-red-500'
            fill='currentColor'
            viewBox='0 0 24 24'
          >
            <path d='M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z' />
          </svg>
          Marked Fields ({markedFields.length})
        </span>
        <svg
          className={`h-5 w-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden bg-white ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className='p-4 pt-2 border-t border-gray-50'>
          {Object.entries(fieldsBySection).map(([sectionName, fields]) => (
            <div key={sectionName} className='mb-3 last:mb-0'>
              <h4 className='font-medium text-sm text-gray-700 mb-1'>
                {sectionName}
              </h4>
              <ul className='space-y-1'>
                {fields.map(field => (
                  <li key={field.fieldId} className='flex items-center'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 text-red-500 mr-2'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z' />
                    </svg>
                    <Link
                      to={`${getSectionRoute(field.section)}?fieldId=${field.fieldId}`}
                      className='text-blue-600 hover:text-blue-800 text-sm'
                    >
                      {field.fieldId}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarkedFieldsMenu;
