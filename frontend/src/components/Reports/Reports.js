import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../services/api';
import { useDataContext } from '../../context/DataContext';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { FileText, Download, ChevronDown } from 'lucide-react';
import { generateAndSavePDF, generateAndSaveDOCX } from '../Funtional/pdfGeneration';

const Reports = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const api = useApi();
  const { loadWhitepaperData, loadWhitepaperForm } = useDataContext();
  const [whitepapers, setWhitepapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState({});
  const [showDownloadMenu, setShowDownloadMenu] = useState({});

  useEffect(() => {
    fetchWhitepapers();
  }, []);

  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.download-menu-container')) {
        setShowDownloadMenu({});
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchWhitepapers = async () => {
    try {
      setLoading(true);
      const response = await api.makeRequest('/api/user/whitepapers');
      setWhitepapers(response.whitepapers || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching whitepapers:', err);
      setError(t('whitepapers.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'default',
      in_progress: 'secondary',
      pending: 'secondary',
      failed: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status === 'completed' ? t('whitepapers.status.completed') :
         status === 'in_progress' ? t('whitepapers.status.inProgress') :
         status === 'pending' ? t('whitepapers.status.pending') :
         status === 'failed' ? t('whitepapers.status.failed') : status}
      </Badge>
    );
  };

  const handlePreviewWhitepaper = async (whitepaper) => {
    try {
      console.log('Loading whitepaper for preview:', whitepaper);

      // Fetch the full whitepaper data with results
      const status = await api.makeRequest(`/api/generation/${whitepaper.generation_id}/status`);
      
      // Prepare whitepaper object with results for loadWhitepaperData
      const whitepaperWithResults = {
        generation_id: whitepaper.generation_id,
        results: status.results,
      };

      // Load the whitepaper data to get context type
      const contextType = await loadWhitepaperData(whitepaperWithResults);
      console.log('Loaded context type:', contextType);

      // Load the whitepaper form data
      await loadWhitepaperForm(whitepaper.generation_id);

      // Navigate to the appropriate route based on context type
      const getInitialRoute = () => {
        switch (contextType) {
          case 'OTH':
          case 'OTH_UTILITY':
          case 'OTH_NON_UTILITY':
            return '/oth/section1';
          case 'ART':
            return '/art/section1';
          case 'EMT':
            return '/emt/section1';
          default:
            console.log('No matching route found, using default');
            return '/oth/section1';
        }
      };

      const route = getInitialRoute();
      console.log('Navigating to:', route);
      navigate(route);
    } catch (error) {
      console.error('Error loading whitepaper for preview:', error);
      setError(t('whitepapers.loadError'));
    }
  };

  const getFieldDataFromResults = (results) => {
    // Extract field data from results
    // Results structure: { context_data: { fieldData: {...}, scrapedData: {...} } }
    if (results?.context_data?.fieldData) {
      // fieldData already contains merged results, but we need to extract just the field entries
      // fieldData structure: { questionnaireData: {...}, tokenClassification: ..., A.1: {...}, B.2: {...}, ... }
      const fieldData = { ...results.context_data.fieldData };
      // Remove non-field entries
      delete fieldData.questionnaireData;
      delete fieldData.tokenClassification;
      return fieldData;
    }
    // Fallback: try scrapedData if fieldData is not available
    if (results?.context_data?.scrapedData) {
      return results.context_data.scrapedData;
    }
    // Legacy format: results might be directly field data
    if (results?.fieldData) {
      return results.fieldData;
    }
    // If results is already field data format (legacy)
    if (typeof results === 'object' && !results.context_data && !results.metrics) {
      return results;
    }
    return {};
  };

  const getContextTypeFromResults = (results) => {
    // Extract context type from results
    if (results?.context_data?.contextType) {
      return results.context_data.contextType;
    }
    if (results?.contextType) {
      return results.contextType;
    }
    return 'OTH'; // default
  };

  const getFormDataFromWhitepaper = (whitepaper) => {
    // Extract form data from whitepaper
    const formData = {
      whitepaperType: whitepaper.whitepaper_type || 'MiCA',
      date: whitepaper.created_at ? new Date(whitepaper.created_at).toDateString() : new Date().toDateString(),
    };
    
    // Try to get crypto asset name from form if available
    if (whitepaper.form) {
      try {
        const form = typeof whitepaper.form === 'string' ? JSON.parse(whitepaper.form) : whitepaper.form;
        if (form.cryptoAssetName) {
          formData.cryptoAssetName = form.cryptoAssetName;
        }
      } catch (e) {
        console.error('Error parsing form data:', e);
      }
    }
    
    return formData;
  };

  const handleDownloadJSON = async (whitepaper) => {
    try {
      setDownloading(prev => ({ ...prev, [whitepaper.generation_id]: 'json' }));
      setShowDownloadMenu(prev => ({ ...prev, [whitepaper.generation_id]: false }));

      // Fetch the full whitepaper data with results
      const status = await api.makeRequest(`/api/generation/${whitepaper.generation_id}/status`);

      if (!status.results) {
        throw new Error('No data available for export');
      }

      // Create a formatted JSON with all field data
      const exportData = {
        generation_id: status.generation_id,
        created_at: status.started_at,
        updated_at: status.updated_at,
        status: status.status,
        progress: status.progress,
        total_fields: status.total_fields,
        completed_fields: status.completed_fields,
        context_type: getContextTypeFromResults(status.results),
        fields: status.results,
      };

      // Create and download the JSON file
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `whitepaper_${whitepaper.generation_id.substring(0, 8)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting JSON:', err);
      setError('Failed to export JSON. Please try again.');
    } finally {
      setDownloading(prev => {
        const newState = { ...prev };
        delete newState[whitepaper.generation_id];
        return newState;
      });
    }
  };

  const handleDownloadPDF = async (whitepaper) => {
    try {
      setDownloading(prev => ({ ...prev, [whitepaper.generation_id]: 'pdf' }));
      setShowDownloadMenu(prev => ({ ...prev, [whitepaper.generation_id]: false }));

      // Fetch the full whitepaper data with results
      const status = await api.makeRequest(`/api/generation/${whitepaper.generation_id}/status`);

      if (!status.results) {
        throw new Error('No data available for PDF generation');
      }

      const fieldData = getFieldDataFromResults(status.results);
      if (Object.keys(fieldData).length === 0) {
        throw new Error('No field data available for PDF generation');
      }

      const formData = getFormDataFromWhitepaper(whitepaper);
      const contextType = getContextTypeFromResults(status.results);

      // Map contextType to PDF format
      let pdfContextType = 'OTH';
      if (contextType === 'ART') {
        pdfContextType = 'ART';
      } else if (contextType === 'EMT') {
        pdfContextType = 'EMT';
      } else if (contextType === 'OTH_UTILITY' || contextType === 'OTH_NON_UTILITY') {
        pdfContextType = 'OTH';
      }

      const success = await generateAndSavePDF(formData, fieldData, pdfContextType);
      if (!success) {
        throw new Error('Failed to generate PDF');
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err.message || 'Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(prev => {
        const newState = { ...prev };
        delete newState[whitepaper.generation_id];
        return newState;
      });
    }
  };

  const handleDownloadDOCX = async (whitepaper) => {
    try {
      setDownloading(prev => ({ ...prev, [whitepaper.generation_id]: 'docx' }));
      setShowDownloadMenu(prev => ({ ...prev, [whitepaper.generation_id]: false }));

      // Fetch the full whitepaper data with results
      const status = await api.makeRequest(`/api/generation/${whitepaper.generation_id}/status`);

      if (!status.results) {
        throw new Error('No data available for DOCX generation');
      }

      const fieldData = getFieldDataFromResults(status.results);
      if (Object.keys(fieldData).length === 0) {
        throw new Error('No field data available for DOCX generation');
      }

      const formData = getFormDataFromWhitepaper(whitepaper);
      const contextType = getContextTypeFromResults(status.results);

      // Map contextType to DOCX format
      let docxContextType = 'OTH';
      if (contextType === 'ART') {
        docxContextType = 'ART';
      } else if (contextType === 'EMT') {
        docxContextType = 'EMT';
      } else if (contextType === 'OTH_UTILITY' || contextType === 'OTH_NON_UTILITY') {
        docxContextType = 'OTH';
      }

      const success = await generateAndSaveDOCX(formData, fieldData, docxContextType);
      if (!success) {
        throw new Error('Failed to generate DOCX');
      }
    } catch (err) {
      console.error('Error generating DOCX:', err);
      setError(err.message || 'Failed to generate DOCX. Please try again.');
    } finally {
      setDownloading(prev => {
        const newState = { ...prev };
        delete newState[whitepaper.generation_id];
        return newState;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">{error}</div>
            <Button onClick={fetchWhitepapers} className="mt-4">
              {t('whitepapers.tryAgain')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <Sidebar />
      <main className='flex-1 overflow-auto ml-64' style={{ marginTop: 'var(--header-height)' }}>
        <div className="container mx-auto p-6 space-y-6">
          <div className="mt-8">
            <h1 className="text-3xl font-bold">{t('whitepapers.title')}</h1>
            <p className="text-muted-foreground">{t('whitepapers.description')}</p>
          </div>

          {whitepapers.length === 0 ? (
            <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              {t('whitepapers.noWhitepapers')}
            </div>
          </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
          {whitepapers.map((whitepaper) => (
            <Card key={whitepaper.generation_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">
                        {whitepaper.title || `Whitepaper ${whitepaper.generation_id?.substring(0, 8)}`}
                      </CardTitle>
                      <CardDescription>
                        {t('whitepapers.type')}: {whitepaper.whitepaper_type || 'N/A'} • {t('whitepapers.created')}: {formatDate(whitepaper.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(whitepaper.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    {whitepaper.status === 'in_progress' && whitepaper.progress !== undefined && (
                      <div className="text-sm text-muted-foreground">
                        {t('whitepapers.progress')}: {whitepaper.completed_fields || 0} / {whitepaper.total_fields || 0} {t('whitepapers.fields')}
                      </div>
                    )}
                    {whitepaper.status === 'failed' && whitepaper.error_message && (
                      <div className="text-sm text-destructive">
                        {t('whitepapers.error')}: {whitepaper.error_message}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {whitepaper.status === 'completed' && (
                      <div className="relative download-menu-container">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowDownloadMenu(prev => ({ 
                            ...prev, 
                            [whitepaper.generation_id]: !prev[whitepaper.generation_id] 
                          }))}
                          disabled={!!downloading[whitepaper.generation_id]}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {downloading[whitepaper.generation_id] 
                            ? `${downloading[whitepaper.generation_id].toUpperCase()}...` 
                            : t('whitepapers.download')}
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                        {showDownloadMenu[whitepaper.generation_id] && (
                          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <div className="py-1">
                              <button
                                onClick={() => handleDownloadJSON(whitepaper)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                                disabled={!!downloading[whitepaper.generation_id]}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                {t('whitepapers.downloadJSON')}
                              </button>
                              <button
                                onClick={() => handleDownloadPDF(whitepaper)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                                disabled={!!downloading[whitepaper.generation_id]}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                {t('whitepapers.downloadPDF')}
                              </button>
                              <button
                                onClick={() => handleDownloadDOCX(whitepaper)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                                disabled={!!downloading[whitepaper.generation_id]}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                {t('whitepapers.downloadDOCX')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePreviewWhitepaper(whitepaper)}
                      disabled={whitepaper.status !== 'completed'}
                    >
                      {t('whitepapers.preview')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;

