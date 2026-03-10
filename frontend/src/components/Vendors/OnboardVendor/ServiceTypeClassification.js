import React, { useEffect, useRef, useState } from 'react';
import { useApi } from '../../../services/api';
import { Button } from '../../ui/button';

const ServiceTypeClassification = ({ qualification, onApprove, stepOneData }) => {
  const api = useApi();
  const fileInputRef = useRef(null);

  const [doraServices, setDoraServices] = useState([]);
  const [servicesMapping, setServicesMapping] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [activeSourceRow, setActiveSourceRow] = useState(null);
  const [documentText, setDocumentText] = useState('');
  const [fileName, setFileName] = useState('');
  const [showDocInput, setShowDocInput] = useState(false);

  const step1Answer =
    stepOneData?.question_1 ||
    stepOneData?.step_1?.question_1 ||
    '';

  useEffect(() => {
    fetchDoraServices();
    if (qualification?.services_mapping?.length) {
      setServicesMapping(qualification.services_mapping);
    }
  }, [qualification]);

  const fetchDoraServices = async () => {
    try {
      const data = await api.getDoraIctServices();
      setDoraServices(data.services || []);
    } catch (error) {
      console.error('Error fetching DORA services:', error);
    }
  };

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

  const handleGenerateMapping = async () => {
    if (!qualification) return;

    setGenerating(true);
    try {
      const contextParts = [];
      if (step1Answer) {
        contextParts.push(`Services identified in Step 1:\n${step1Answer}`);
      }
      if (documentText.trim()) {
        contextParts.push(`Additional source document content:\n${documentText.trim()}`);
      }

      const additionalContext = contextParts.join('\n\n') || undefined;

      const result = await api.generateQualificationAnswer(
        qualification.qualification_id || qualification.id,
        {
          question_id: 'q2_service_types',
          question_text:
            'Map each vendor service to the appropriate DORA ICT service type (S01-S16) and determine if it supports critical or important functions.',
          documents: [],
          additional_context: additionalContext,
        }
      );

      // Parse JSON array from AI response
      try {
        const jsonStr = result.answer.trim();
        const match = jsonStr.match(/\[[\s\S]*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed)) {
            setServicesMapping(
              parsed.map((s) => ({
                name: s.name || '',
                service_type_id: s.service_type_id || '',
                is_critical: typeof s.is_critical === 'boolean' ? s.is_critical : null,
                source_document: fileName || 'Generated',
                source_quote: s.source_quote || '',
              }))
            );
          }
        }
      } catch {
        console.error('Could not parse JSON mapping from response, showing raw');
      }
    } catch (error) {
      console.error('Error generating mapping:', error);
      alert('Failed to generate service mapping');
    } finally {
      setGenerating(false);
    }
  };

  const addService = () => {
    setServicesMapping([
      ...servicesMapping,
      { name: '', service_type_id: '', is_critical: null, source_document: '', source_quote: '' },
    ]);
  };

  const updateService = (index, field, value) => {
    const updated = [...servicesMapping];
    updated[index] = { ...updated[index], [field]: value };
    setServicesMapping(updated);
  };

  const removeService = (index) => {
    setServicesMapping(servicesMapping.filter((_, i) => i !== index));
    if (activeSourceRow === index) setActiveSourceRow(null);
  };

  const handleApprove = async () => {
    if (servicesMapping.length === 0) {
      alert('Please add at least one service mapping');
      return;
    }

    try {
      if (qualification) {
        await api.updateServicesMapping(
          qualification.qualification_id || qualification.id,
          servicesMapping
        );
      }

      onApprove({ services_mapping: servicesMapping });
    } catch (error) {
      console.error('Error approving step:', error);
    }
  };

  return (
    <div className='p-8'>
      <h2 className='text-xl font-semibold mb-2'>
        STEP 2: Map vendor services to DORA ICT service categories
      </h2>
      <p className='text-sm text-muted-foreground mb-6'>
        Classify each service provided by the vendor according to DORA ICT service types (S01–S16) and assess whether it supports critical or important functions.
      </p>

      {/* Step 1 Context */}
      {step1Answer && (
        <div className='mb-6'>
          <details className='border rounded-lg' open>
            <summary className='cursor-pointer px-4 py-3 font-medium text-sm bg-muted rounded-lg'>
              Context from Step 1 — Services identified
            </summary>
            <div className='px-4 py-3 text-sm whitespace-pre-wrap text-muted-foreground'>
              {step1Answer}
            </div>
          </details>
        </div>
      )}

      {/* Source document input */}
      <div className='mb-6 border rounded-lg p-4'>
        <p className='font-medium text-sm mb-3'>
          Additional source document (optional — supports mapping generation)
        </p>
        <div className='flex gap-3 mb-3'>
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
            onClick={handleGenerateMapping}
            disabled={generating || !qualification}
          >
            {generating ? 'Generating mapping...' : 'Generate DORA mapping'}
          </Button>
        </div>
        {showDocInput && (
          <textarea
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            placeholder='Paste or type document content here...'
            className='w-full border rounded-lg px-4 py-3 min-h-[80px] resize-none text-sm'
          />
        )}
      </div>

      {/* Services Mapping Table */}
      <div className='mb-6'>
        <div className='flex justify-between items-center mb-3'>
          <h3 className='font-medium'>Services Mapping</h3>
          <Button variant='outline' size='sm' onClick={addService}>
            + Add Service
          </Button>
        </div>

        {servicesMapping.length > 0 ? (
          <div className='border rounded-lg overflow-hidden'>
            <table className='w-full'>
              <thead className='bg-muted'>
                <tr>
                  <th className='text-left p-3 border-r text-sm font-medium'>
                    Service Name
                  </th>
                  <th className='text-left p-3 border-r text-sm font-medium'>
                    DORA Type (S01–S16)
                  </th>
                  <th className='text-left p-3 border-r text-sm font-medium'>
                    Critical / Important?
                  </th>
                  <th className='text-left p-3 text-sm font-medium'>Source</th>
                  <th className='p-3 w-10'></th>
                </tr>
              </thead>
              <tbody>
                {servicesMapping.map((service, index) => (
                  <React.Fragment key={index}>
                    <tr className='border-t'>
                      <td className='p-3 border-r'>
                        <input
                          type='text'
                          value={service.name}
                          onChange={(e) => updateService(index, 'name', e.target.value)}
                          className='w-full border rounded px-2 py-1 text-sm'
                          placeholder='Service name'
                        />
                      </td>
                      <td className='p-3 border-r'>
                        <select
                          value={service.service_type_id || ''}
                          onChange={(e) => updateService(index, 'service_type_id', e.target.value)}
                          className='w-full border rounded px-2 py-1 text-sm'
                        >
                          <option value=''>Select type...</option>
                          {doraServices.map((ds) => (
                            <option key={ds.id} value={ds.id}>
                              {ds.id} — {ds.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className='p-3 border-r'>
                        <select
                          value={
                            service.is_critical === null || service.is_critical === undefined
                              ? ''
                              : service.is_critical
                              ? 'yes'
                              : 'no'
                          }
                          onChange={(e) =>
                            updateService(
                              index,
                              'is_critical',
                              e.target.value === '' ? null : e.target.value === 'yes'
                            )
                          }
                          className='w-full border rounded px-2 py-1 text-sm'
                        >
                          <option value=''>Not determined</option>
                          <option value='yes'>Yes — critical/important</option>
                          <option value='no'>No</option>
                        </select>
                      </td>
                      <td className='p-3'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-xs text-primary underline'
                          onClick={() =>
                            setActiveSourceRow(activeSourceRow === index ? null : index)
                          }
                          disabled={!service.source_quote && !service.source_document}
                        >
                          {activeSourceRow === index ? 'Hide source' : 'View source'}
                        </Button>
                      </td>
                      <td className='p-3'>
                        <button
                          onClick={() => removeService(index)}
                          className='text-red-500 hover:text-red-700 text-lg leading-none'
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                    {activeSourceRow === index && (service.source_quote || service.source_document) && (
                      <tr className='border-t bg-blue-50'>
                        <td colSpan={5} className='p-3 text-sm text-blue-800'>
                          {service.source_document && (
                            <span className='font-medium mr-2'>
                              Source: {service.source_document}
                            </span>
                          )}
                          {service.source_quote && (
                            <span className='italic'>
                              &quot;{service.source_quote}&quot;
                            </span>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='border rounded-lg p-8 text-center text-muted-foreground text-sm'>
            No services mapped yet. Click &quot;Generate DORA mapping&quot; or add services manually using the button above.
          </div>
        )}
      </div>

      {/* DORA Services Reference */}
      <details className='mb-6'>
        <summary className='cursor-pointer font-medium text-sm text-primary'>
          View DORA ICT Service Types Reference (S01–S16)
        </summary>
        <div className='mt-3 border rounded-lg overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='bg-muted'>
              <tr>
                <th className='text-left p-2 border-r font-medium'>ID</th>
                <th className='text-left p-2 border-r font-medium'>Type</th>
                <th className='text-left p-2 font-medium'>Description</th>
              </tr>
            </thead>
            <tbody>
              {doraServices.map((service) => (
                <tr key={service.id} className='border-t'>
                  <td className='p-2 border-r font-medium'>{service.id}</td>
                  <td className='p-2 border-r'>{service.name}</td>
                  <td className='p-2 text-muted-foreground'>{service.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {/* Approve Button */}
      <Button className='w-full py-6 text-lg' size='lg' onClick={handleApprove}>
        Approve &amp; Continue to Summary
      </Button>
    </div>
  );
};

export default ServiceTypeClassification;
