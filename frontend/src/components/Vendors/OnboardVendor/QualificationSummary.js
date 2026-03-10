import React, { useRef, useState } from 'react';
import { useApi } from '../../../services/api';
import { Button } from '../../ui/button';

const renderMarkdown = (text) => {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-1">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-5 mb-2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-2">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Unordered lists
  html = html.replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/(<li[\s\S]*?<\/li>)/g, '<ul class="my-2">$1</ul>');

  // Numbered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="my-4 border-gray-300" />');

  // Paragraphs (double newline)
  html = html.replace(/\n\n/g, '</p><p class="mb-3">');
  html = '<p class="mb-3">' + html + '</p>';

  // Single newlines
  html = html.replace(/\n/g, '<br />');

  return html;
};

const QualificationSummary = ({ qualification, vendorName }) => {
  const api = useApi();
  const summaryRef = useRef(null);

  const [summary, setSummary] = useState('');
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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

  const handleDownloadPdf = async () => {
    if (!summaryRef.current) return;
    setDownloadingPdf(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const filename = `${vendorName || 'vendor'}_qualification_report.pdf`
        .replace(/\s+/g, '_')
        .toLowerCase();

      await html2pdf()
        .set({
          margin: 10,
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(summaryRef.current)
        .save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className='p-8'>
      <h2 className='text-xl font-semibold mb-2'>STEP 3: Summary and Qualification Report</h2>
      <p className='text-sm text-muted-foreground mb-6'>
        Generate a comprehensive qualification report based on the completed steps.
      </p>

      {/* Report meta */}
      {reportData && (
        <div className='mb-4 p-4 bg-muted rounded-lg grid grid-cols-2 gap-3 text-sm'>
          <div>
            <span className='text-muted-foreground'>Vendor:</span>{' '}
            <span className='font-medium'>{reportData.vendor_name || vendorName}</span>
          </div>
          <div>
            <span className='text-muted-foreground'>Status:</span>{' '}
            <span className='font-medium capitalize'>{reportData.status}</span>
          </div>
          <div>
            <span className='text-muted-foreground'>ICT Provider:</span>{' '}
            <span className='font-medium'>
              {reportData.is_ict_provider === true
                ? 'Yes'
                : reportData.is_ict_provider === false
                ? 'No'
                : 'Not determined'}
            </span>
          </div>
          <div>
            <span className='text-muted-foreground'>Services mapped:</span>{' '}
            <span className='font-medium'>{reportData.services_count || 0}</span>
          </div>
          {reportData.generated_at && (
            <div className='col-span-2'>
              <span className='text-muted-foreground'>Generated:</span>{' '}
              <span className='font-medium'>
                {new Date(reportData.generated_at).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Summary content */}
      <div className='mb-6 border rounded-lg min-h-[300px] p-6 bg-white'>
        {summary ? (
          <div
            ref={summaryRef}
            className='prose prose-sm max-w-none text-sm leading-relaxed'
            dangerouslySetInnerHTML={{ __html: renderMarkdown(summary) }}
          />
        ) : (
          <div className='flex flex-col items-center justify-center h-64 text-center'>
            <div className='text-4xl mb-4'>📋</div>
            <p className='text-muted-foreground font-medium mb-1'>No report generated yet</p>
            <p className='text-muted-foreground text-sm'>
              Click &quot;Generate Qualification Report&quot; below to create a comprehensive summary
              based on your completed qualification steps.
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className='flex gap-4'>
        <Button
          className='flex-1 py-6 text-lg'
          onClick={handleGenerateReport}
          disabled={generating || !qualification}
        >
          {generating ? 'Generating report...' : 'Generate Qualification Report'}
        </Button>

        {summary && (
          <Button
            variant='outline'
            className='py-6 px-8 text-lg'
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
          >
            {downloadingPdf ? 'Preparing PDF...' : '⬇ Download PDF'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QualificationSummary;
