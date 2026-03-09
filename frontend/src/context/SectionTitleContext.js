import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDataContext } from './DataContext';

const SectionTitleContext = createContext();

// Hardcoded section titles to avoid 404 errors
const DEFAULT_SECTION_TITLES = {
  '/section1': 'Compliance with duties of information',
  '/summery': 'Summary',
  '/partA':
    'Information about the offeror or the person seeking admission to trading',
  '/part2':
    'Information about the issuer, if different from the offeror or person seeking admission to trading',
  '/part3':
    'Information about the operator of the trading platform in cases where it draws up the crypto-asset white paper',
  '/part4': 'Information about the crypto-asset project',
  '/part5':
    'Information about the offer to the public of crypto-assets or their admission to trading',
  '/part6': 'Information about the crypto-assets',
  '/part7':
    'Information on the rights and obligations attached to the crypto-assets',
  '/part8': 'Information on the underlying technology',
  '/part9': 'Information on the risks',
  '/finalpart':
    'Information on the sustainability indicators in relation to adverse impact on the climate and other environment-related adverse impacts',
};
const DEFAULT_SECTION_TITLES_ART = {
  '/art/section1': 'Compliance with duties of information',
  '/art/summery': 'Summary',
  '/art/partA': 'Information about the issuer of the asset-referenced token',
  '/art/partAA':
    'Information on other persons offering to the public or seeking admission to trading of asset-referenced tokens',
  '/art/partB': 'Information about the asset-referenced token',
  '/art/partC':
    'Information about the offer to the public of the asset-referenced token or its admission to trading',
  '/art/partD':
    'Information on the rights and obligations attached to the asset-referenced token',
  '/art/partE': 'Information on the underlying technology',
  '/art/partF': 'Information on the risks',
  '/art/partG': 'Information on the reserve of assets',
  '/art/partH':
    'Information on the sustainability indicators in relation to adverse impact on the climate and other environment-related adverse impacts',
};
const DEFAULT_SECTION_TITLES_EMT = {
  '/emt/section1': 'Compliance with duties of information',
  '/emt/summery': 'Summary',
  '/emt/partA': 'Information about the issuer of the e-money token',
  '/emt/partB': 'Information about the e-money token',
  '/emt/partC':
    'Information about the offer to the public of the e-money token or its admission to trading',
  '/emt/partD':
    'Information on the rights and obligations attached to e-money tokens',
  '/emt/partE': 'Information on the underlying technology',
  '/emt/partF': 'Information on the risks',
  '/emt/partG':
    'Information on the sustainability indicators in relation to adverse impact on the climate and other environment-related adverse impacts',
};
const DEFAULT_SECTION_TITLES_OTH = {
  '/oth/section1': 'Compliance with duties of information',
  '/oth/summery': 'Summary',
  '/oth/partA':
    'Information about the offeror or the person seeking admission to trading',
  '/oth/partB':
    'Information about the issuer, if different from the offeror or person seeking admission to trading',
  '/oth/partC':
    'Information about the operator of the trading platform in cases where it draws up the crypto-asset white paper',
  '/oth/partD': 'Information about the crypto-asset project',
  '/oth/partE':
    'Information about the offer to the public of crypto-assets or their admission to trading',
  '/oth/partF': 'Information about the crypto-assets',
  '/oth/partG':
    'Information on the rights and obligations attached to the crypto-assets',
  '/oth/partH': 'Information on the underlying technology',
  '/oth/partI': 'Information on the risks',
  '/oth/partJ':
    'Information on the sustainability indicators in relation to adverse impact on the climate and other environment-related adverse impacts',
};

export const SectionTitleProvider = ({ children }) => {
  const { contextType, contextLoaded } = useDataContext();
  const [sectionTitles, setSectionTitles] = useState(DEFAULT_SECTION_TITLES);
  const [isLoading, setIsLoading] = useState(false); // Set to false since we're using hardcoded values

  // Update section titles when context type changes
  useEffect(() => {
    if (contextLoaded) {
      switch (contextType) {
        case 'ART':
          setSectionTitles(DEFAULT_SECTION_TITLES_ART);
          break;
        case 'EMT':
          setSectionTitles(DEFAULT_SECTION_TITLES_EMT);
          break;
        case 'OTH':
        case 'OTH_UTILITY':
        case 'OTH_NON_UTILITY':
          setSectionTitles(DEFAULT_SECTION_TITLES_OTH);
          break;
        case null:
        default:
          // Use default OTH titles when no selection has been made
          setSectionTitles(DEFAULT_SECTION_TITLES);
          break;
      }
    }
  }, [contextType, contextLoaded]);

  // Function to register or update a section title
  const registerSectionTitle = (route, title) => {
    if (title && route) {
      setSectionTitles(prev => ({
        ...prev,
        [route]: title,
      }));
    }
  };

  return (
    <SectionTitleContext.Provider
      value={{ sectionTitles, registerSectionTitle, isLoading }}
    >
      {children}
    </SectionTitleContext.Provider>
  );
};

export const useSectionTitleContext = () => useContext(SectionTitleContext);
