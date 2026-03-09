import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import FileUploader from '../Funtional/FileUploader/FileUploader';
import DoraQuestionnaire from './DoraQuestionnaire';
import { useApi } from '../../services/api';

const DoraAudit = () => {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const api = useApi();
  const fileUploaderRef = useRef(null);

  const [selectedFiles, setSelectedFiles] = useState({});
  const [formData, setFormData] = useState({
    companyName: '',
    isMicroenterprise: '',
    belongsToGroup: '',
    isCreditInstitution: '',
    isCentralCounterparty: '',
    canUseSimplifiedFramework: '',
    hasInformationSecuritySystem: '',
    keyFunctionsDescription: '',
    criticalProcessesDescription: '',
    externalICTProvidersList: '',
    providesInformationSharingServices: '',
    organizationalStructureDescription: '',
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentAuditId, setCurrentAuditId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Poll for generation status
  useEffect(() => {
    if (!currentAuditId || !isGenerating) return;

    const pollInterval = setInterval(async () => {
      try {
        const status = await api.getDoraAuditStatus(currentAuditId);
        
        setGenerationProgress(status.progress);
        
        if (status.status === 'completed') {
          setIsGenerating(false);
          setSuccess('Raport DORA został wygenerowany pomyślnie!');
          clearInterval(pollInterval);
          
          // Redirect to reports page after 2 seconds
          setTimeout(() => {
            navigate('/frameworks/dora/reports');
          }, 2000);
        } else if (status.status === 'failed') {
          setIsGenerating(false);
          setError(
            `Generowanie raportu nie powiodło się: ${status.error_message || 'Nieznany błąd'}`
          );
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Error polling audit status:', err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [currentAuditId, isGenerating, api, navigate]);

  const handleGenerateReport = async () => {
    setError(null);
    setSuccess(null);

    // Validation
    const selectedFileNames = Object.keys(selectedFiles).filter(
      (key) => selectedFiles[key]
    );

    if (selectedFileNames.length === 0) {
      setError('Proszę wybrać przynajmniej jeden dokument do analizy.');
      return;
    }

    // Check if company name is provided
    if (!formData.companyName || formData.companyName.trim() === '') {
      setError('Proszę podać nazwę audytowanej spółki.');
      return;
    }

    // Check if all required fields are filled
    const requiredFields = [
      'isMicroenterprise',
      'belongsToGroup',
      'isCreditInstitution',
      'isCentralCounterparty',
      'canUseSimplifiedFramework',
      'hasInformationSecuritySystem',
      'providesInformationSharingServices',
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      setError('Proszę odpowiedzieć na wszystkie wymagane pytania (1-6, 10).');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationProgress(0);

      const auditRequest = {
        ...formData,
        documents: selectedFileNames,
      };

      const response = await api.generateDoraAudit(auditRequest);
      
      setCurrentAuditId(response.audit_id);
      setSuccess('Rozpoczęto generowanie raportu DORA...');
    } catch (err) {
      console.error('Error starting DORA audit:', err);
      setError(
        `Nie udało się rozpocząć generowania raportu: ${err.message || 'Nieznany błąd'}`
      );
      setIsGenerating(false);
    }
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <div className='flex flex-1'>
        <Sidebar />
        <main
          className='flex-1 overflow-auto ml-64 p-8'
          style={{ marginTop: 'var(--header-height)' }}
        >
          <div className='max-w-5xl mx-auto'>
            {/* Page Header */}
            <div className='mb-8'>
              <h1
                className='text-3xl font-bold text-gray-900 mb-2'
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Audyt DORA
              </h1>
              <p
                className='text-gray-600'
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Wygeneruj raport zgodności z Digital Operational Resilience Act
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className='mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded'
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div
                className='mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded'
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {success}
              </div>
            )}

            {/* File Uploader Section */}
            <div className='mb-8'>
              <FileUploader
                ref={fileUploaderRef}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
              />
            </div>

            {/* Questionnaire Section */}
            <div className='mb-8'>
              <DoraQuestionnaire formData={formData} setFormData={setFormData} />
            </div>

            {/* Generation Progress */}
            {isGenerating && (
              <div
                className='mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg'
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center space-x-3'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                    <div>
                      <p className='text-blue-800 font-medium'>
                        Generowanie raportu DORA...
                      </p>
                      <p className='text-blue-600 text-sm'>
                        Postęp: {generationProgress}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className='w-full bg-blue-200 rounded-full h-2'>
                  <div
                    className='bg-blue-600 h-2 rounded-full transition-all duration-500'
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Generate Report Button */}
            <div className='flex justify-end gap-4'>
              <button
                onClick={() => navigate('/frameworks/dora/reports')}
                className='px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium'
                style={{ fontFamily: 'Manrope, sans-serif' }}
                disabled={isGenerating}
              >
                Zobacz raporty
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {isGenerating ? 'Generowanie...' : 'Generuj raport DORA'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoraAudit;

