import React from 'react';

const ScrapedDataDisplay = ({ data }) => {
  return (
    <div className='scraped-data mt-6'>
      <h3 className='text-xl font-semibold mb-3'>Scraped Data:</h3>
      {Object.keys(data).length === 0 ? (
        <p>No data returned.</p>
      ) : (
        Object.keys(data).map((fieldKey, index) => {
          const field = data[fieldKey];
          return (
            <div
              key={index}
              className='field-suggestion mb-4 p-3 border rounded'
            >
              <strong>{fieldKey}</strong>
              <p>Value: {field.fillOut}</p>
              <p>Certainty: {Math.round(field.certainty * 100)}%</p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ScrapedDataDisplay;
