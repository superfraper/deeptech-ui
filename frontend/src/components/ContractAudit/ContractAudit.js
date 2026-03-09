import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../services/api';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Select } from '../ui/select';
import { Input } from '../ui/input';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import FileUploader from '../Funtional/FileUploader/FileUploader';

const STEPS = [
  { id: 1, title: 'Upload Contract', description: 'Upload contract documents for audit' },
  { id: 2, title: 'Select Checklist', description: 'Choose a predefined audit checklist' },
  { id: 3, title: 'Custom Checklist', description: 'Or upload your own checklist (optional)' },
  { id: 4, title: 'Run Audit', description: 'Start the contract audit process' },
  { id: 5, title: 'Review Results', description: 'Review audit findings and compliance status' },
  { id: 6, title: 'Download Report', description: 'Export audit report' },
];

const ContractAudit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const api = useApi();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [checklists, setChecklists] = useState([]);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [customChecklist, setCustomChecklist] = useState(null);
  const [auditId, setAuditId] = useState(null);
  const [auditStatus, setAuditStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    fetchChecklists();
  }, []);

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const fetchChecklists = async () => {
    try {
      const response = await api.listChecklists();
      setChecklists(response.checklists || []);
    } catch (error) {
      console.error('Error fetching checklists:', error);
    }
  };

  const getSelectedFileNames = () => {
    return Object.entries(selectedFiles)
      .filter(([_, isSelected]) => isSelected)
      .map(([fileName]) => fileName);
  };

  const handleStartAudit = async () => {
    const selectedFileNames = getSelectedFileNames();
    if (selectedFileNames.length === 0) {
      alert('Please upload and select at least one contract document');
      return;
    }

    if (!selectedChecklist && !customChecklist) {
      alert('Please select a checklist or upload a custom one');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.startContractAudit({
        checklist_type: selectedChecklist?.id || 'custom',
        checklist_name: selectedChecklist?.name || 'Custom Checklist',
        documents: selectedFileNames,
        contract_id: searchParams.get('vendor_id') || null,
      });

      setAuditId(response.audit_id);
      setCurrentStep(4);

      const interval = setInterval(async () => {
        try {
          const status = await api.getContractAuditStatus(response.audit_id);
          setAuditStatus(status);

          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(interval);
            setPollingInterval(null);
            setCurrentStep(5);
          }
        } catch (error) {
          console.error('Error polling audit status:', error);
        }
      }, 2000);

      setPollingInterval(interval);
    } catch (error) {
      console.error('Error starting audit:', error);
      alert('Error starting audit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return getSelectedFileNames().length > 0;
      case 2:
        return selectedChecklist !== null;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const getComplianceBadge = (compliant) => {
    if (compliant === true) {
      return <Badge variant='success'>Compliant</Badge>;
    } else if (compliant === false) {
      return <Badge variant='destructive'>Non-Compliant</Badge>;
    } else {
      return <Badge variant='secondary'>Partial</Badge>;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-medium mb-2'>Upload Contract Documents</h3>
              <p className='text-muted-foreground mb-4'>
                Upload one or more contract documents (PDF, DOCX) to audit. Select the files you want to include in the audit.
              </p>
              <FileUploader 
                selectedFiles={selectedFiles} 
                setSelectedFiles={setSelectedFiles} 
              />
            </div>
            {getSelectedFileNames().length > 0 && (
              <div className='bg-muted p-4 rounded-lg'>
                <h4 className='font-medium mb-2'>Selected for Audit:</h4>
                <ul className='list-disc list-inside'>
                  {getSelectedFileNames().map((fileName, index) => (
                    <li key={index}>{fileName}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-medium mb-2'>Select Audit Checklist</h3>
              <p className='text-muted-foreground mb-4'>
                Choose a predefined checklist to audit against
              </p>
              <div className='space-y-3'>
                {checklists.map((checklist) => (
                  <div
                    key={checklist.id}
                    role="button"
                    tabIndex={0}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedChecklist?.id === checklist.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedChecklist(checklist)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedChecklist(checklist)}
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <h4 className='font-medium'>{checklist.name}</h4>
                        <p className='text-sm text-muted-foreground'>
                          {checklist.description}
                        </p>
                        <p className='text-xs text-muted-foreground mt-1'>
                          {checklist.questions?.length || 0} questions
                        </p>
                      </div>
                      {selectedChecklist?.id === checklist.id && (
                        <Badge variant='success'>Selected</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-medium mb-2'>
                Custom Checklist (Optional)
              </h3>
              <p className='text-muted-foreground mb-4'>
                If you have your own checklist, you can upload it here.
                Otherwise, skip this step to use the predefined checklist.
              </p>
              <div className='border-2 border-dashed rounded-lg p-8 text-center'>
                <p className='text-muted-foreground'>
                  Custom checklist upload coming soon
                </p>
              </div>
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleStartAudit} disabled={isLoading}>
                {isLoading ? 'Starting Audit...' : 'Skip & Start Audit'}
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className='space-y-6'>
            <div className='text-center py-8'>
              <h3 className='text-lg font-medium mb-4'>Audit in Progress</h3>
              <div className='w-full max-w-md mx-auto'>
                <div className='bg-secondary rounded-full h-4 mb-2'>
                  <div
                    className='bg-primary h-4 rounded-full transition-all duration-500'
                    style={{ width: `${auditStatus?.progress || 0}%` }}
                  />
                </div>
                <p className='text-muted-foreground'>
                  {auditStatus?.progress || 0}% complete
                </p>
              </div>
              <p className='text-sm text-muted-foreground mt-4'>
                Analyzing contract documents against checklist requirements...
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-medium mb-2'>Audit Results</h3>
              <p className='text-muted-foreground mb-4'>
                Review the compliance findings below
              </p>
            </div>

            {auditStatus?.checklist_items?.length > 0 ? (
              <div className='space-y-4'>
                {auditStatus.checklist_items.map((item, index) => (
                  <Card key={index}>
                    <CardHeader className='pb-2'>
                      <div className='flex items-start justify-between'>
                        <CardTitle className='text-base'>
                          {item.question}
                        </CardTitle>
                        {getComplianceBadge(item.compliant)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-2'>
                        <p className='text-sm'>{item.answer}</p>
                        {item.source_quote && (
                          <div className='bg-muted p-3 rounded-md'>
                            <p className='text-xs font-medium text-muted-foreground mb-1'>
                              Source Quote:
                            </p>
                            <p className='text-sm italic'>&quot;{item.source_quote}&quot;</p>
                          </div>
                        )}
                        {item.source_document && (
                          <p className='text-xs text-muted-foreground'>
                            Source: {item.source_document}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <p className='text-muted-foreground'>No audit results available</p>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className='space-y-6'>
            <div className='text-center py-8'>
              <h3 className='text-lg font-medium mb-4'>Download Report</h3>
              <p className='text-muted-foreground mb-6'>
                Export the audit report in your preferred format
              </p>
              <div className='flex gap-4 justify-center'>
                <Button variant='outline' disabled>
                  Download PDF (Coming Soon)
                </Button>
                <Button variant='outline' disabled>
                  Download CSV (Coming Soon)
                </Button>
              </div>
            </div>
            <div className='flex justify-center gap-2'>
              <Button variant='outline' onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
              <Button onClick={() => setCurrentStep(1)}>Start New Audit</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <Sidebar />
      <main 
        className='flex-1 overflow-auto ml-64 p-6' 
        style={{ marginTop: 'var(--header-height)' }}
      >
        <div className='max-w-4xl mx-auto'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between mb-4'>
                  <div>
                    <CardTitle className='text-xl'>
                      {STEPS[currentStep - 1].title}
                    </CardTitle>
                    <CardDescription className='mt-1'>
                      {STEPS[currentStep - 1].description}
                    </CardDescription>
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Step {currentStep} of {STEPS.length}
                  </div>
                </div>

                {/* Progress indicator */}
                <div className='flex gap-2'>
                  {STEPS.map((step) => (
                    <div
                      key={step.id}
                      className={`flex-1 h-2 rounded-full ${
                        step.id <= currentStep ? 'bg-primary' : 'bg-secondary'
                      }`}
                    />
                  ))}
                </div>
              </CardHeader>
              <CardContent className='space-y-6'>
                {renderStepContent()}

                {currentStep < 3 && (
                  <div className='flex justify-between pt-4'>
                    <Button
                      variant='outline'
                      onClick={handleBack}
                      disabled={currentStep === 1}
                    >
                      Back
                    </Button>
                    <Button onClick={handleNext} disabled={!canProceed()}>
                      Next
                    </Button>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className='flex justify-between pt-4'>
                    <Button variant='outline' onClick={() => setCurrentStep(1)}>
                      Start New Audit
                    </Button>
                    <Button onClick={handleNext}>Download Report</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
    </div>
  );
};

export default ContractAudit;
