import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import { useApi } from '../../services/api';
import { generateDoraPDF } from './doraPdfGenerator';

const DoraReports = () => {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const api = useApi();

  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingAuditId, setDeletingAuditId] = useState(null);
  const [downloadingAuditId, setDownloadingAuditId] = useState(null);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [selectedAuditDetails, setSelectedAuditDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    try {
      setLoading(true);
      const response = await api.listDoraAudits();
      setAudits(response.audits || []);
      setError(null);
    } catch (err) {
      console.error('Error loading audits:', err);
      setError('Nie udało się załadować raportów DORA');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (auditId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten raport?')) {
      return;
    }

    try {
      setDeletingAuditId(auditId);
      await api.deleteDoraAudit(auditId);
      setAudits((prev) => prev.filter((audit) => audit.audit_id !== auditId));
    } catch (err) {
      console.error('Error deleting audit:', err);
      setError('Nie udało się usunąć raportu');
    } finally {
      setDeletingAuditId(null);
    }
  };

  const handleDownloadPDF = async (audit) => {
    try {
      setDownloadingAuditId(audit.audit_id);

      // Fetch full audit status with results
      const fullAudit = await api.getDoraAuditStatus(audit.audit_id);

      if (fullAudit.status !== 'completed') {
        alert('Raport nie został jeszcze ukończony');
        return;
      }

      if (!fullAudit.results || fullAudit.results.length === 0) {
        alert('Brak danych do wygenerowania raportu PDF');
        return;
      }

      // Generate PDF
      await generateDoraPDF(fullAudit);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Nie udało się wygenerować raportu PDF');
    } finally {
      setDownloadingAuditId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: 'Ukończony', class: 'bg-green-100 text-green-800' },
      in_progress: {
        label: 'W trakcie',
        class: 'bg-blue-100 text-blue-800',
      },
      pending: { label: 'Oczekujący', class: 'bg-yellow-100 text-yellow-800' },
      failed: { label: 'Błąd', class: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || {
      label: status,
      class: 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.class}`}
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        {config.label}
      </span>
    );
  };

  const getComplianceBadge = (compliant) => {
    const config = {
      true: { label: 'Zgodny', class: 'bg-green-100 text-green-800' },
      false: { label: 'Niezgodny', class: 'bg-red-100 text-red-800' },
      partial: { label: 'Częściowo', class: 'bg-yellow-100 text-yellow-800' },
    };

    const key = compliant === true ? 'true' : compliant === false ? 'false' : 'partial';
    const badgeConfig = config[key] || config.partial;

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${badgeConfig.class}`}
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        {badgeConfig.label}
      </span>
    );
  };

  const handleViewDetails = async (audit) => {
    if (selectedAudit?.id === audit.id) {
      setSelectedAudit(null);
      setSelectedAuditDetails(null);
      return;
    }

    try {
      setLoadingDetails(true);
      setSelectedAudit(audit);
      const details = await api.getDoraAuditStatus(audit.id);
      setSelectedAuditDetails(details);
    } catch (err) {
      console.error('Error loading audit details:', err);
      setError('Nie udało się załadować szczegółów audytu');
    } finally {
      setLoadingDetails(false);
    }
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
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
          <div className='max-w-6xl mx-auto'>
            {/* Page Header */}
            <div className='mb-8 flex justify-between items-center'>
              <div>
                <h1
                  className='text-3xl font-bold text-gray-900 mb-2'
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  Raporty DORA
                </h1>
                <p
                  className='text-gray-600'
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  Historia wygenerowanych raportów audytu DORA
                </p>
              </div>
              <button
                onClick={() => navigate('/frameworks/dora')}
                className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Nowy audyt
              </button>
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

            {/* Loading State */}
            {loading && (
              <div
                className='flex justify-center items-center py-12'
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
                <span className='ml-4 text-gray-600'>
                  Ładowanie raportów...
                </span>
              </div>
            )}

            {/* Audits Table */}
            {!loading && audits.length === 0 && (
              <div
                className='bg-gray-50 border border-gray-200 rounded-lg p-12 text-center'
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                <p className='text-gray-600 mb-4'>
                  Nie masz jeszcze żadnych raportów DORA
                </p>
                <button
                  onClick={() => navigate('/frameworks/dora')}
                  className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
                >
                  Stwórz pierwszy raport
                </button>
              </div>
            )}

            {!loading && audits.length > 0 && (
              <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                <table className='w-full'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        style={{ fontFamily: 'Manrope, sans-serif' }}
                      >
                        Firma
                      </th>
                      <th
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        style={{ fontFamily: 'Manrope, sans-serif' }}
                      >
                        Data utworzenia
                      </th>
                      <th
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        style={{ fontFamily: 'Manrope, sans-serif' }}
                      >
                        Status
                      </th>
                      <th
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        style={{ fontFamily: 'Manrope, sans-serif' }}
                      >
                        Postęp
                      </th>
                      <th
                        className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                        style={{ fontFamily: 'Manrope, sans-serif' }}
                      >
                        Akcje
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {audits.map((audit) => (
                      <React.Fragment key={audit.id}>
                        <tr 
                          className='hover:bg-gray-50 cursor-pointer'
                          onClick={() => handleViewDetails(audit)}
                        >
                          <td
                            className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium'
                            style={{ fontFamily: 'Manrope, sans-serif' }}
                          >
                            {audit.company_name || 'Brak nazwy'}
                          </td>
                          <td
                            className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'
                            style={{ fontFamily: 'Manrope, sans-serif' }}
                          >
                            {formatDate(audit.created_at)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            {getStatusBadge(audit.status)}
                          </td>
                          <td
                            className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'
                            style={{ fontFamily: 'Manrope, sans-serif' }}
                          >
                            {audit.progress}%
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                            <div className='flex justify-end gap-2' role="presentation" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                              {audit.status === 'completed' && (
                                <button
                                  onClick={() => handleDownloadPDF(audit)}
                                  disabled={downloadingAuditId === audit.id}
                                  className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400'
                                  style={{ fontFamily: 'Manrope, sans-serif' }}
                                >
                                  {downloadingAuditId === audit.id
                                    ? 'Generowanie...'
                                    : 'Pobierz PDF'}
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(audit.id)}
                                disabled={deletingAuditId === audit.id}
                                className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:bg-gray-400'
                                style={{ fontFamily: 'Manrope, sans-serif' }}
                              >
                                {deletingAuditId === audit.id
                                  ? 'Usuwanie...'
                                  : 'Usuń'}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {selectedAudit?.id === audit.id && (
                          <tr>
                            <td colSpan={5} className='px-6 py-4 bg-gray-50'>
                              {loadingDetails ? (
                                <div className='flex items-center justify-center py-8'>
                                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                                  <span className='ml-4 text-gray-600'>Ładowanie wyników...</span>
                                </div>
                              ) : selectedAuditDetails?.results?.length > 0 ? (
                                <div className='space-y-4'>
                                  <h3 className='text-lg font-semibold text-gray-900 mb-4' style={{ fontFamily: 'Manrope, sans-serif' }}>
                                    Wyniki audytu DORA
                                  </h3>
                                  {selectedAuditDetails.results.map((result, index) => (
                                    <div 
                                      key={result.question_id || index} 
                                      className='bg-white rounded-lg border border-gray-200 overflow-hidden'
                                    >
                                      <div 
                                        role="button"
                                        tabIndex={0}
                                        className='flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50'
                                        onClick={() => toggleQuestion(result.question_id)}
                                        onKeyDown={(e) => e.key === 'Enter' && toggleQuestion(result.question_id)}
                                      >
                                        <div className='flex-1'>
                                          <p className='font-medium text-gray-900' style={{ fontFamily: 'Manrope, sans-serif' }}>
                                            {result.question}
                                          </p>
                                        </div>
                                        <div className='flex items-center gap-3'>
                                          {getComplianceBadge(result.compliant)}
                                          <span className='text-gray-400'>
                                            {expandedQuestions[result.question_id] ? '▲' : '▼'}
                                          </span>
                                        </div>
                                      </div>
                                      {expandedQuestions[result.question_id] && (
                                        <div className='px-4 pb-4 space-y-3 border-t border-gray-100'>
                                          <div className='pt-3'>
                                            <p className='text-sm font-medium text-gray-500 mb-1'>Odpowiedź:</p>
                                            <p className='text-sm text-gray-800' style={{ fontFamily: 'Manrope, sans-serif' }}>
                                              {result.answer}
                                            </p>
                                          </div>
                                          {result.source_quote && (
                                            <div className='bg-blue-50 border-l-4 border-blue-500 p-3 rounded'>
                                              <p className='text-sm font-medium text-blue-800 mb-1'>Cytat źródłowy:</p>
                                              <p className='text-sm text-blue-700 italic' style={{ fontFamily: 'Manrope, sans-serif' }}>
                                                &quot;{result.source_quote}&quot;
                                              </p>
                                            </div>
                                          )}
                                          {result.source_document && (
                                            <div className='text-xs text-gray-500'>
                                              <span className='font-medium'>Dokument źródłowy:</span> {result.source_document}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className='text-center text-gray-500 py-8' style={{ fontFamily: 'Manrope, sans-serif' }}>
                                  Brak wyników dla tego audytu
                                </p>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoraReports;

