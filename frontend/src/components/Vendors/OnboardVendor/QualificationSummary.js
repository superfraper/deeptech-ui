import React, { useState } from 'react';
import { useApi } from '../../../services/api';
import { Button } from '../../ui/button';

const QualificationSummary = ({ qualification, vendorName }) => {
  const api = useApi();
  const [summary, setSummary] = useState('');
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);

  const handleGenerateReport = async () => {
    if (!qualification) return;

    setGenerating(true);
    try {
      const result = await api.generateQualificationReport(
        qualification.qualification_id || qualification.id
      );
      setSummary(result.summary);
      setReportData(result);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className='p-8'>
      <h2 className='text-xl font-semibold mb-6'>STEP 3: Summary and Report</h2>

      {/* Summary Text Area */}
      <div className='mb-6'>
        <div className='border rounded-lg min-h-[300px] p-4 bg-gray-50'>
          {summary ? (
            <div className='whitespace-pre-wrap'>{summary}</div>
          ) : (
            <p className='text-muted-foreground'>Summary...</p>
          )}
        </div>
      </div>

      {/* Report Info */}
      {reportData && (
        <div className='mb-6 p-4 bg-blue-50 rounded-lg'>
          <h3 className='font-medium mb-2'>Report Details</h3>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-muted-foreground'>Vendor:</span>{' '}
              {reportData.vendor_name || vendorName}
            </div>
            <div>
              <span className='text-muted-foreground'>Status:</span>{' '}
              {reportData.status}
            </div>
            <div>
              <span className='text-muted-foreground'>ICT Provider:</span>{' '}
              {reportData.is_ict_provider ? 'Yes' : reportData.is_ict_provider === false ? 'No' : 'N/A'}
            </div>
            <div>
              <span className='text-muted-foreground'>Services Mapped:</span>{' '}
              {reportData.services_count || 0}
            </div>
            <div>
              <span className='text-muted-foreground'>Generated:</span>{' '}
              {reportData.generated_at ? new Date(reportData.generated_at).toLocaleString() : 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Button */}
      <Button
        className='w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg'
        onClick={handleGenerateReport}
        disabled={generating || !qualification}
      >
        {generating ? 'Generating Report...' : 'Generate Qualification Report'}
      </Button>
    </div>
  );
};

export default QualificationSummary;
