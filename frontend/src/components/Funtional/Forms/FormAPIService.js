// API service to generate fillouts
export const generateFillouts = async (formData, apiService = null) => {
  // Always require apiService for authenticated requests
  if (!apiService) {
    throw new Error('API service is required for authenticated requests');
  }

  console.log(
    `Sending payload to FastAPI endpoint via authenticated API service:`,
    JSON.stringify(formData, null, 2)
  );

  try {
    return await apiService.generateFillouts(formData);
  } catch (error) {
    console.log('Error response:', error);
    throw new Error('Error generating fillouts: ' + error.message);
  }
};

// Utility to clean data (optional)
export const cleanData = rawData => {
  return rawData
    .replace(/\\n/g, ' ')
    .replace(/\\"/g, '"')
    .replace(/【\d+:\d+†source】/g, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\*\*/g, '')
    .trim();
};

export const cleanAllLocalStorage = () => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const rawData = localStorage.getItem(key);
    if (rawData) {
      const cleanedData = cleanData(rawData);
      localStorage.setItem(key, cleanedData);
    }
  }
};
