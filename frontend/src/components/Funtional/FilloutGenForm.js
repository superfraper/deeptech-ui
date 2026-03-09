// src/components/FilloutGenForm.js
import React, { useState } from 'react';

const FilloutGenForm = () => {
  // State for whitepaper type selection, links text area and scraped data response
  const [whitepaperType, setWhitepaperType] = useState('OTH');
  const [linksText, setLinksText] = useState('');
  const [scrapedData, setScrapedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle form submission to call FastAPI endpoint
  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Convert multi-line text input into an array of links, ignoring empty lines
    const linksArray = linksText
      .split('\n')
      .map(link => link.trim())
      .filter(link => link.length > 0);

    const payload = {
      whitepaperType, // "OTH", "ART", or "EMT"
      links: linksArray,
    };

    try {
      const response = await fetch('http://your-fastapi-endpoint/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setScrapedData(data);
    } catch (err) {
      console.error('Error fetching scraped data:', err);
      setError('There was an error fetching data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fillout-gen-form mb-6 bg-white shadow-[0px_0px_10px_rgba(0,_0,_0,_0.08)] border border-[rgba(0,_0,_0,_0.2)] rounded-[8px] p-[29px] mb-[24px]'>
      <h2 className='text-2xl font-semibold mb-4'>Fillout Generation Form</h2>
      <form onSubmit={handleSubmit}>
        <div className='form-group mb-4'>
          <label htmlFor='whitepaperType' className='block mb-1 font-medium'>
            Whitepaper Type:
          </label>
          <select
            id='whitepaperType'
            value={whitepaperType}
            onChange={e => setWhitepaperType(e.target.value)}
            className='w-full p-2 border rounded'
          >
            <option value='OTH'>OTH</option>
            <option value='ART'>ART</option>
            <option value='EMT'>EMT</option>
          </select>
        </div>
        <div className='form-group mb-4'>
          <label htmlFor='links' className='block mb-1 font-medium'>
            Links to Scrape (one per line):
          </label>
          <textarea
            id='links'
            value={linksText}
            onChange={e => setLinksText(e.target.value)}
            placeholder='Enter each URL on a new line'
            rows={5}
            className='w-full p-2 border rounded'
          ></textarea>
        </div>
        <button
          type='submit'
          className='w-full py-2 px-4 text-white font-semibold rounded-lg text-[18px] bg-[#42BBFF] hover:bg-blue-700'
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Fillouts'}
        </button>
      </form>

      {error && <div className='mt-4 text-red-600'>{error}</div>}

      {scrapedData && (
        <div className='scraped-data mt-6'>
          <h3 className='text-xl font-semibold mb-3'>Scraped Data:</h3>
          {Object.keys(scrapedData).length === 0 ? (
            <p>No data returned.</p>
          ) : (
            Object.keys(scrapedData).map((fieldKey, index) => {
              const field = scrapedData[fieldKey];
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
      )}
    </div>
  );
};

export default FilloutGenForm;
