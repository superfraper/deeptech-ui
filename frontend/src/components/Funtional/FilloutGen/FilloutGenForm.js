import React, { useState } from 'react';
import { useScraper } from './useScraper';
import ScrapedDataDisplay from './ScrapedDataDisplay';

const FilloutGenForm = () => {
  // State for whitepaper type selection and links text area
  const [whitepaperType, setWhitepaperType] = useState('OTH');
  const [linksText, setLinksText] = useState('');

  const { scrapedData, loading, error, scrapeLinks } = useScraper();

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();

    // Convert multi-line text input into an array of links, ignoring empty lines
    const linksArray = linksText
      .split('\n')
      .map(link => link.trim())
      .filter(link => link.length > 0);

    await scrapeLinks(whitepaperType, linksArray);
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

      {scrapedData && <ScrapedDataDisplay data={scrapedData} />}
    </div>
  );
};

export default FilloutGenForm;
