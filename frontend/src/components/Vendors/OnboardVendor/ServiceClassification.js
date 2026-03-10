import React, { useRef, useState } from 'react';
import { useApi } from '../../../services/api';
import { Button } from '../../ui/button';

const DORA_ICT_DEFINITION =
  'ICT services means digital and data services provided through ICT systems to one or more internal or external users on an ongoing basis, including hardware as a service and hardware services which includes the provision of technical support via software or firmware updates by the hardware provider, excluding traditional analogue telephone services.';

const ServiceClassification = ({ qualification, onApprove, vendorName }) => {
  const api = useApi();
  const fileInputRef = useRef(null);

  const [response, setResponse] = useState('');
  const [isIctProvider, setIsIctProvider] = useState(null);
  const [ictSuggestion, setIctSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sourceInfo, setSourceInfo] = useState(null);
  const [showSource, setShowSource] = useState(false);
  const [documentText, setDocumentText] = useState('');
  const [fileName, setFileName] = useState('');
  const [showDocInput, setShowDocInput] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setShowDocInput(true);

    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (ev) => setDocumentText(ev.target.result);
      reader.readAsText(file);
    } else {
      setDocumentText('');
    }
  };

  const handleGenerateAnswer = async () => {
    if (!qualification) return;

    setLoading(true);
    try {
      const result = await api.generateQualificationAnswer(
        qualification.qualification_id || qualification.id,
        {
          question_id: 'q1_services',
          question_text: 'What services the Vendor intends to provide to your organisation?',
          documents: [],
          additional_context: documentText.trim() || undefined,
        }
      );
      setResponse(result.answer);

      if (result.source_document || result.source_quote) {
        setSourceInfo({
          document: result.source_document,
          quote: result.source_quote,
        });
      }

      if (result.is_ict_provider_suggestion !== null && result.is_ict_provider_suggestion !== undefined) {
        setIctSuggestion(result.is_ict_provider_suggestion);
        setIsIctProvider(result.is_ict_provider_suggestion);
      }
    } catch (error) {
      console.error('Error generating answer:', error);
      alert('Failed to generate answer');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (isIctProvider === null) {
      alert('Please select whether the vendor is an ICT Service Provider');
      return;
    }

    try {
      if (qualification) {
        await api.updateIctProviderStatus(
          qualification.qualification_id || qualification.id,
          isIctProvider
        );
      }

      onApprove({
        question_1: response,
        is_ict_provider: isIctProvider,
        source_info: sourceInfo,
        document_text: documentText,
      });
    } catch (error) {
      console.error('Error approving step:', error);
    }
  };

  return (
    <div className='p-8'>
      <h2 className='text-xl font-semibold mb-2'>
        STEP 1: Verify if Vendor classifies as ICT Third Party Provider according to DORA
      </h2>
      <p className='text-sm text-muted-foreground mb-6'>
        Determine whether the vendor provides ICT services as defined by DORA and therefore qualifies as an ICT Third Party Service Provider.
      </p>

      {/* DORA Definition */}
      <details className='mb-6 border rounded-lg'>
        <summary className='cursor-pointer px-4 py-3 font-medium text-sm bg-muted rounded-lg'>
          DORA ICT Services Definition (click to expand)
        </summary>
        <div className='px-4 py-3 text-sm text-muted-foreground italic'>
          &quot;{DORA_ICT_DEFINITION}&quot;
        </div>
      </details>

      {/* Question 1 */}
      <div className='mb-6'>
        <p className='font-medium mb-3'>
          Question 1: What services does the Vendor intend to provide to your organisation?
        </p>

        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder='Enter manually OR load a document and press Generate Answer'
          className='w-full border rounded-lg px-4 py-3 min-h-[120px] resize-none mb-4'
        />

        {/* Action Buttons */}
        <div className='flex gap-3 mb-4'>
          <Button
            variant='outline'
            className='flex-1'
            onClick={() => {
              setShowDocInput(true);
              fileInputRef.current && fileInputRef.current.click();
            }}
          >
            {fileName ? `📄 ${fileName}` : 'Load or select source document'}
          </Button>
          <input
            ref={fileInputRef}
            type='file'
            accept='.txt,.pdf,.docx,.doc'
            className='hidden'
            onChange={handleFileSelect}
          />
          <Button
            className='flex-1'
            onClick={handleGenerateAnswer}
            disabled={loading || !qualification}
          >
            {loading ? 'Generating...' : 'Generate answer'}
          </Button>
          <Button
            variant='outline'
            className='flex-1'
            onClick={() => setShowSource((v) => !v)}
            disabled={!sourceInfo}
          >
            {showSource ? 'Hide source' : 'Review source'}
          </Button>
        </div>

        {/* Document text input */}
        {showDocInput && (
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-1'>
              Document text (paste content here or it will be auto-filled for .txt files):
            </label>
            <textarea
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder='Paste or type document content here...'
              className='w-full border rounded-lg px-4 py-3 min-h-[100px] resize-none text-sm'
            />
          </div>
        )}

        {/* Source Panel */}
        {showSource && sourceInfo && (
          <div className='bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4 text-sm'>
            <p className='font-medium mb-1 text-blue-800'>
              Source: {sourceInfo.document}
            </p>
            {sourceInfo.quote && (
              <p className='text-blue-700 italic'>
                &quot;{sourceInfo.quote.substring(0, 300)}{sourceInfo.quote.length > 300 ? '...' : ''}&quot;
              </p>
            )}
          </div>
        )}
      </div>

      {/* ICT Provider Classification */}
      <div className='mb-6 border rounded-lg p-4 bg-gray-50'>
        <p className='font-medium mb-3'>
          Is this Vendor an ICT Service Provider according to DORA?
        </p>

        {ictSuggestion !== null && (
          <div className={`mb-3 px-3 py-2 rounded text-sm font-medium ${ictSuggestion ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            AI suggestion: <strong>{ictSuggestion ? 'YES' : 'NO'}</strong> — based on DORA definition analysis. Confirm or override below.
          </div>
        )}

        <div className='flex gap-6'>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='radio'
              name='isIctProvider'
              checked={isIctProvider === true}
              onChange={() => setIsIctProvider(true)}
              className='w-4 h-4'
            />
            <span className='font-medium'>YES — qualifies as ICT Service Provider</span>
          </label>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='radio'
              name='isIctProvider'
              checked={isIctProvider === false}
              onChange={() => setIsIctProvider(false)}
              className='w-4 h-4'
            />
            <span className='font-medium'>NO — does not qualify</span>
          </label>
        </div>
      </div>

      {/* Approve Button */}
      <Button
        className='w-full py-6 text-lg'
        size='lg'
        onClick={handleApprove}
        disabled={!response.trim()}
      >
        Approve &amp; Continue to Step 2
      </Button>
    </div>
  );
};

export default ServiceClassification;
