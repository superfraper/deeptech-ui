import React, { useState } from 'react';
import { useMarkedFields } from '../../context/MarkedFieldsContext';

const FlagIcon = ({ fieldId, section, sectionName }) => {
  const { toggleMarkField, isFieldMarked } = useMarkedFields();
  const marked = isFieldMarked(fieldId);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className='relative inline-block'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className={`h-5 w-5 ml-2 inline-block cursor-pointer transition-colors duration-200 ${
          marked
            ? 'text-red-500 hover:text-red-600'
            : 'text-gray-400 hover:text-gray-600'
        }`}
        fill={marked ? 'currentColor' : 'none'}
        viewBox='0 0 24 24'
        stroke='currentColor'
        strokeWidth={marked ? 0 : 2}
        onClick={() => toggleMarkField(fieldId, section, sectionName)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9'
        />
      </svg>

      {showTooltip && (
        <div className='absolute z-10 whitespace-nowrap bg-black text-white text-xs rounded py-1 px-3 text-center bottom-full left-1/2 transform -translate-x-1/2 mb-2 shadow-lg'>
          {marked ? 'Remove flag' : 'Flag for later review'}
          <div className='tooltip-arrow absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black'></div>
        </div>
      )}
    </div>
  );
};

export default FlagIcon;
