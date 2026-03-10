import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../services/api';
import { Button } from '../../ui/button';
import Header from '../../layout/Header';
import Sidebar from '../../layout/Sidebar';
import ServiceClassification from './ServiceClassification';
import ServiceTypeClassification from './ServiceTypeClassification';
import QualificationSummary from './QualificationSummary';

const TABS = [
  { id: 1, name: 'Service Classification', key: 'service_classification' },
  { id: 2, name: 'Security standard definition', key: 'security_standard' },
  { id: 3, name: 'Risk assessment', key: 'risk_assessment' },
  { id: 4, name: 'Contract Qualification', key: 'contract_qualification' },
];

const OnboardVendorWizard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const [searchParams] = useSearchParams();
  const api = useApi();

  const [activeTab, setActiveTab] = useState(1);
  const [qualification, setQualification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vendorName, setVendorName] = useState(searchParams.get('name') || '');

  useEffect(() => {
    if (vendorId) {
      loadQualification(vendorId);
    } else {
      setLoading(false);
    }
  }, [vendorId]);

  const loadQualification = async (qualId) => {
    try {
      const data = await api.getVendorQualification(qualId);
      setQualification(data);
      setActiveTab(data.current_step || 1);
      setVendorName(data.vendor_name || '');
    } catch (error) {
      console.error('Error loading qualification:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewQualification = async () => {
    if (!vendorName.trim()) {
      alert('Please enter a vendor name');
      return;
    }

    try {
      setLoading(true);
      const result = await api.startVendorQualification({
        vendor_id: vendorId || `vendor_${Date.now()}`,
        vendor_name: vendorName,
      });
      setQualification(result);
      navigate(`/vendors/onboard/${result.qualification_id}?name=${encodeURIComponent(vendorName)}`);
    } catch (error) {
      console.error('Error starting qualification:', error);
      alert('Failed to start qualification');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    if (qualification || tabId === 1) {
      setActiveTab(tabId);
    }
  };

  const handleStepApprove = async (stepData) => {
    if (!qualification) return;

    try {
      await api.saveQualificationStep(qualification.qualification_id || qualification.id, activeTab, {
        question_responses: stepData,
        approved: true,
      });

      const updatedStepData = {
        ...(qualification.step_data || {}),
        [`step_${activeTab}`]: stepData,
        ...stepData,
      };

      if (activeTab < 4) {
        setActiveTab(activeTab + 1);
        setQualification({
          ...qualification,
          current_step: activeTab + 1,
          step_data: updatedStepData,
        });
      }
    } catch (error) {
      console.error('Error saving step:', error);
    }
  };

  const handlePrevious = () => {
    if (activeTab > 1) {
      setActiveTab(activeTab - 1);
    }
  };

  const handleNext = () => {
    if (activeTab < 4) {
      setActiveTab(activeTab + 1);
    }
  };

  const renderStepContent = () => {
    if (!qualification && !vendorId) {
      return (
        <div className='p-8'>
          <h2 className='text-xl font-semibold mb-4'>Start New Vendor Qualification</h2>
          <div className='mb-4'>
            <label htmlFor='vendorName' className='block text-sm font-medium mb-2'>
              Vendor Name
            </label>
            <input
              id='vendorName'
              type='text'
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder='Enter vendor name'
              className='w-full border rounded-lg px-4 py-2'
            />
          </div>
          <Button onClick={startNewQualification} disabled={loading}>
            {loading ? 'Starting...' : 'Start Qualification Process'}
          </Button>
        </div>
      );
    }

    switch (activeTab) {
      case 1:
        return (
          <ServiceClassification
            qualification={qualification}
            onApprove={handleStepApprove}
            vendorName={vendorName}
          />
        );
      case 2:
        return (
          <ServiceTypeClassification
            qualification={qualification}
            onApprove={handleStepApprove}
            stepOneData={qualification?.step_data}
          />
        );
      case 3:
        return (
          <div className='p-8 text-center'>
            <h3 className='text-lg font-medium mb-4'>Risk Assessment</h3>
            <p className='text-muted-foreground'>Coming soon...</p>
          </div>
        );
      case 4:
        return (
          <QualificationSummary
            qualification={qualification}
            vendorName={vendorName}
          />
        );
      default:
        return null;
    }
  };

  if (loading && vendorId) {
    return (
      <div className='min-h-screen bg-background'>
        <Header />
        <Sidebar />
        <main
          className='flex-1 overflow-auto ml-64 p-6'
          style={{ marginTop: 'var(--header-height)' }}
        >
          <div className='flex items-center justify-center h-64'>
            <p className='text-muted-foreground'>Loading qualification...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <Sidebar />
      <main
        className='flex-1 overflow-auto ml-64 p-6'
        style={{ marginTop: 'var(--header-height)' }}
      >
        <div className='max-w-6xl mx-auto'>
          {/* Tab Navigation */}
          <div className='flex gap-2 mb-6'>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className='bg-white rounded-lg border'>
            {renderStepContent()}
          </div>

          {/* Navigation */}
          {qualification && (
            <div className='flex justify-center gap-4 mt-6'>
              <Button
                variant='outline'
                onClick={handlePrevious}
                disabled={activeTab === 1}
              >
                PREVIOUS
              </Button>
              <Button
                variant='outline'
                onClick={handleNext}
                disabled={activeTab === 4}
              >
                NEXT
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OnboardVendorWizard;
