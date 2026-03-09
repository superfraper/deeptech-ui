import React, { useState } from 'react';
import { useApi } from '../../../services/api';
import { Button } from '../../ui/button';

const ServiceClassification = ({ qualification, onApprove, vendorName }) => {
  const api = useApi();
  const [response, setResponse] = useState('');
  const [isIctProvider, setIsIctProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sourceInfo, setSourceInfo] = useState(null);

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
        }
      );
      setResponse(result.answer);
      if (result.source_document || result.source_quote) {
        setSourceInfo({
          document: result.source_document,
          quote: result.source_quote,
        });
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
      });
    } catch (error) {
      console.error('Error approving step:', error);
    }
  };

  return (
    <div className='p-8'>
      <h2 className='text-xl font-semibold mb-6'>
        STEP 1: Verify if Vendor classifies as ICT Third Party Provider according to DORA
      </h2>

      {/* Question 1 */}
      <div className='mb-6'>
        <div className='flex items-start gap-4 mb-4'>
          <span className='font-medium whitespace-nowrap'>Question 1</span>
          <p>What services the Vendor intends to provide to your organisation?</p>
        </div>

        <div className='mb-4'>
          <div className='flex items-start gap-4 mb-2'>
            <span className='font-medium whitespace-nowrap'>Response</span>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder='Enter manually OR load a press generate answer, correct manually, approve'
              className='flex-1 border rounded-lg px-4 py-3 min-h-[100px] resize-none'
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-4 mb-6'>
          <Button variant='outline' className='flex-1'>
            Load or select source documents
          </Button>
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
            disabled={!sourceInfo}
          >
            Review source
          </Button>
        </div>

        {/* Source Info */}
        {sourceInfo && (
          <div className='bg-gray-50 p-4 rounded-lg mb-6 text-sm'>
            <p className='font-medium mb-1'>Source: {sourceInfo.document}</p>
            {sourceInfo.quote && (
              <p className='text-muted-foreground italic'>&quot;{sourceInfo.quote.substring(0, 200)}...&quot;</p>
            )}
          </div>
        )}
      </div>

      {/* ICT Provider Question */}
      <div className='mb-6'>
        <div className='flex items-center gap-4 mb-4'>
          <span className='font-medium whitespace-nowrap'>
            Vendor is a ICT Service Provider acc. to DORA:
          </span>
          <div className='flex gap-4'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='radio'
                name='isIctProvider'
                checked={isIctProvider === true}
                onChange={() => setIsIctProvider(true)}
                className='w-4 h-4'
              />
              <span>YES</span>
            </label>
            <span>/</span>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='radio'
                name='isIctProvider'
                checked={isIctProvider === false}
                onChange={() => setIsIctProvider(false)}
                className='w-4 h-4'
              />
              <span>NO</span>
            </label>
          </div>
        </div>
      </div>

      {/* Approve Button */}
      <Button
        className='w-full py-6 text-lg'
        size='lg'
        onClick={handleApprove}
      >
        Approve
      </Button>
    </div>
  );
};

export default ServiceClassification;
