import { useState } from 'react';

export const useScraper = () => {
  const [scrapedData, setScrapedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const scrapeLinks = async (whitepaperType, linksArray) => {
    setError(null);
    setLoading(true);

    const payload = {
      whitepaperType,
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

  return { scrapedData, loading, error, scrapeLinks };
};
