// src/components/Dashboard.js
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDataContext } from '../context/DataContext';
import badgeimg from '../images/badge.png';
import facebook from '../images/Facebook - Negative.svg';
import thankyouimage from '../images/image.png';
import instagram from '../images/Instagram - Negative.svg';
import twitter from '../images/Twitter - Negative.svg';
import {
  generateAndSaveDOCX,
  generateAndSavePDF,
} from './Funtional/pdfGeneration';

const Thankyou = () => {
  const location = useLocation();
  const { fieldData, contextType, currentWhitepaperId } = useDataContext();
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState(null);
  const formData = {
    whitepaperType: 'MiCA',
    date: new Date().toDateString(),
  };

  const generatePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      setError(null);

      if (Object.keys(fieldData).length === 0) {
        throw new Error('No field data available for PDF generation');
      }

      // Map contextType to PDF format
      let pdfContextType = 'OTH'; // default
      if (contextType === 'ART') {
        pdfContextType = 'ART';
      } else if (contextType === 'EMT') {
        pdfContextType = 'EMT';
      } else if (
        contextType === 'OTH_UTILITY' ||
        contextType === 'OTH_NON_UTILITY'
      ) {
        pdfContextType = 'OTH';
      }

      console.log(
        'Generating PDF with contextType:',
        contextType,
        'mapped to:',
        pdfContextType
      );

      // Pass mapped contextType to PDF generation
      const success = await generateAndSavePDF(
        formData,
        fieldData,
        pdfContextType
      );

      if (success) {
        setPdfGenerated(true);
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generateJSON = async () => {
    try {
      setIsGeneratingPDF(true);
      setError(null);

      if (Object.keys(fieldData).length === 0) {
        throw new Error('No field data available for JSON export');
      }

      // Create export data similar to the modal functionality
      const exportData = {
        generation_id: currentWhitepaperId || 'local_generation',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'completed',
        context_type: contextType,
        fields: fieldData,
      };

      // Create and download the JSON file
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `whitepaper_data_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating JSON:', err);
      setError(err.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generateDOCX = async () => {
    try {
      setIsGeneratingPDF(true);
      setError(null);
      if (Object.keys(fieldData).length === 0) {
        throw new Error('No field data available for DOCX generation');
      }
      let docxContextType = 'OTH';
      if (contextType === 'ART') {
        docxContextType = 'ART';
      } else if (contextType === 'EMT') {
        docxContextType = 'EMT';
      } else if (
        contextType === 'OTH_UTILITY' ||
        contextType === 'OTH_NON_UTILITY'
      ) {
        docxContextType = 'OTH';
      }
      const success = await generateAndSaveDOCX(
        formData,
        fieldData,
        docxContextType
      );
      if (!success) {
        throw new Error('Failed to generate DOCX');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className='min-h-screen w-full flex flex-col'>
      <section
        className='main-banner thankyou-banner flex-grow flex items-center justify-center bg-cover bg-center min-h-screen flex items-center'
        style={{ backgroundImage: `url(${thankyouimage})` }}
      >
        <div className='text-center w-[780px] max-w-full my-0 mx-auto p-4'>
          <img
            className='mx-auto w-[110px] h-[110px] object-cover mb-5'
            src={badgeimg}
            alt='badgeimg'
          />
          <h1 className='text-[40px] font-inter font-bold text-center text-white mb-4 md:text-[124px]'>
            Thank You
          </h1>
          <p className='mb-[25px] font-inter font-semibold text-[20px] leading-[29px] text-center text-white mt-0 md:mb-[25px] md:text-[24px]'>
            For Trusting DeepTech
          </p>

          <div className='bg-white/90 rounded-lg p-6 mb-8 shadow-lg'>
            {isGeneratingPDF && (
              <div className='flex items-center justify-center space-x-2 mb-4'>
                <div className='w-4 h-4 rounded-full bg-blue-600 animate-bounce'></div>
                <div
                  className='w-4 h-4 rounded-full bg-blue-600 animate-bounce'
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className='w-4 h-4 rounded-full bg-blue-600 animate-bounce'
                  style={{ animationDelay: '0.4s' }}
                ></div>
                <span className='font-semibold text-blue-600'>
                  Generating report...
                </span>
              </div>
            )}

            {error && (
              <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4'>
                <p className='font-bold'>Error generating PDF</p>
                <p>{error}</p>
                <button
                  onClick={generatePDF}
                  className='mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded'
                >
                  Try Again
                </button>
              </div>
            )}

            <div className='flex flex-col items-center'>
              <p className='text-gray-700 mb-4'>
                Choose the format to download your report:
              </p>
              <div className='flex flex-row gap-4'>
                <button
                  onClick={generatePDF}
                  className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center'
                  disabled={isGeneratingPDF}
                >
                  <svg
                    className='w-5 h-5 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                    ></path>
                  </svg>
                  Download PDF
                </button>
                <button
                  onClick={generateDOCX}
                  className='bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center'
                  disabled={isGeneratingPDF}
                >
                  <svg
                    className='w-5 h-5 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                    ></path>
                  </svg>
                  Download DOCX
                </button>
                <button
                  onClick={generateJSON}
                  className='bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded flex items-center'
                  disabled={isGeneratingPDF}
                >
                  <svg
                    className='w-5 h-5 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    ></path>
                  </svg>
                  Download JSON
                </button>
              </div>
            </div>
          </div>

          <Link
            to='/'
            className='font-inter font-normal text-[18px] leading-[22px] text-center text-white rounded-[48px] hover:underline'
          >
            Back to Home
          </Link>
          <div className='social flex flex-wrap; gap-[32px] mt-[40px] justify-center'>
            <img
              className='w-[32px] h-[32px] object-cover m-0'
              src={facebook}
              alt='facebook'
            />
            <img
              className='w-[32px] h-[32px] object-cover m-0'
              src={twitter}
              alt='twitter'
            />
            <img
              className='w-[32px] h-[32px] object-cover m-0'
              src={instagram}
              alt='instagram'
            />
          </div>
        </div>
      </section>

      <footer className='bg-black text-white text-sm p-4 text-center w-full'>
        <div className='flex flex-wrap justify-center space-x-4 footer-flex'>
          <Link
            to='/thankyou'
            className='hover:underline font-normal text-[16px] leading-[19px] text-[#CACACA] border-r border-[#CACACA] pr-[15px]'
          >
            Privacy Policy
          </Link>
          <Link
            to='/questionare'
            className='hover:underline font-normal text-[16px] leading-[19px] text-[#CACACA] border-r border-[#CACACA] pr-[15px] '
          >
            Cookie Policy
          </Link>
          <Link
            to='/standard-disclaimer'
            className='hover:underline font-normal text-[16px] leading-[19px] text-[#CACACA]'
          >
            Standard Disclaimer
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Thankyou;
