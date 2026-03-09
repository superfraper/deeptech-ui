import React, { useEffect, useState } from 'react';
import { useApi } from '../../../services/api';
import { Button } from '../../ui/button';

const ServiceTypeClassification = ({ qualification, onApprove }) => {
  const api = useApi();
  const [doraServices, setDoraServices] = useState([]);
  const [servicesMapping, setServicesMapping] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchDoraServices();
    if (qualification?.services_mapping) {
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

  const handleGenerateAnswer = async () => {
    if (!qualification) return;

    setGenerating(true);
    try {
      const result = await api.generateQualificationAnswer(
        qualification.qualification_id || qualification.id,
        {
          question_id: 'q2_service_types',
          question_text: 'What type of services the Vendor intends to provide according to DORA classification? Map each service to DORA service types S01-S16.',
          documents: [],
        }
      );

      const mockMapping = [
        { name: 'usługa 1', service_type_id: 'S02', is_critical: true, source_document: 'Contract.pdf' },
        { name: 'usługa 2', service_type_id: 'S08', is_critical: false, source_document: 'Contract.pdf' },
      ];
      setServicesMapping(mockMapping);
    } catch (error) {
      console.error('Error generating answer:', error);
    } finally {
      setGenerating(false);
    }
  };

  const addService = () => {
    setServicesMapping([
      ...servicesMapping,
      { name: '', service_type_id: '', is_critical: null, source_document: '' },
    ]);
  };

  const updateService = (index, field, value) => {
    const updated = [...servicesMapping];
    updated[index] = { ...updated[index], [field]: value };
    setServicesMapping(updated);
  };

  const removeService = (index) => {
    setServicesMapping(servicesMapping.filter((_, i) => i !== index));
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

      onApprove({
        services_mapping: servicesMapping,
      });
    } catch (error) {
      console.error('Error approving step:', error);
    }
  };

  return (
    <div className='p-8'>
      <h2 className='text-xl font-semibold mb-6'>
        STEP 2: Classify type and criticality of services according to DORA
      </h2>

      {/* Questions */}
      <div className='mb-6 space-y-4'>
        <div className='flex items-start gap-4'>
          <span className='font-medium whitespace-nowrap'>Question 2</span>
          <p>What type of services the Vendor intends to provide to your organisation according to DORA classification?</p>
        </div>
        <div className='flex items-start gap-4'>
          <span className='font-medium whitespace-nowrap'>Question 3</span>
          <p>Does these services support critical or important functions?</p>
        </div>
      </div>

      {/* Response Area */}
      <div className='mb-6'>
        <div className='flex items-start gap-4 mb-2'>
          <span className='font-medium whitespace-nowrap'>Response</span>
          <div className='flex-1 border rounded-lg p-4 min-h-[100px] bg-gray-50'>
            <p className='text-muted-foreground'>
              Generated response proposal - table<br />
              Correct manually, approve
            </p>
          </div>
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
          disabled={generating || !qualification}
        >
          {generating ? 'Generating...' : 'Generate answer'}
        </Button>
      </div>

      {/* Services Mapping Table */}
      <div className='mb-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='font-medium'>Services Mapping</h3>
          <Button variant='outline' size='sm' onClick={addService}>
            + Add Service
          </Button>
        </div>

        {servicesMapping.length > 0 ? (
          <table className='w-full border rounded-lg overflow-hidden'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='text-left p-3 border-r'>
                  Name<br />
                  <span className='text-xs text-muted-foreground'>(Nazwa usługi z dokumentacji / STEP1)</span>
                </th>
                <th className='text-left p-3 border-r'>
                  Type<br />
                  <span className='text-xs text-muted-foreground'>(Kod usługi z DORA)</span>
                </th>
                <th className='text-left p-3 border-r'>Is critical or important?</th>
                <th className='text-left p-3'>Source</th>
                <th className='p-3 w-10'></th>
              </tr>
            </thead>
            <tbody>
              {servicesMapping.map((service, index) => (
                <tr key={index} className='border-t'>
                  <td className='p-3 border-r'>
                    <input
                      type='text'
                      value={service.name}
                      onChange={(e) => updateService(index, 'name', e.target.value)}
                      className='w-full border rounded px-2 py-1'
                      placeholder='Service name'
                    />
                  </td>
                  <td className='p-3 border-r'>
                    <select
                      value={service.service_type_id || ''}
                      onChange={(e) => updateService(index, 'service_type_id', e.target.value)}
                      className='w-full border rounded px-2 py-1'
                    >
                      <option value=''>Select...</option>
                      {doraServices.map((ds) => (
                        <option key={ds.id} value={ds.id}>
                          {ds.id} - {ds.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className='p-3 border-r'>
                    <select
                      value={service.is_critical === null ? '' : service.is_critical ? 'yes' : 'no'}
                      onChange={(e) => updateService(index, 'is_critical', e.target.value === 'yes')}
                      className='w-full border rounded px-2 py-1'
                    >
                      <option value=''>Select...</option>
                      <option value='yes'>TAK</option>
                      <option value='no'>NIE</option>
                    </select>
                  </td>
                  <td className='p-3'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-xs'
                    >
                      (press to display source doc / quote)
                    </Button>
                  </td>
                  <td className='p-3'>
                    <button
                      onClick={() => removeService(index)}
                      className='text-red-500 hover:text-red-700'
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className='border rounded-lg p-8 text-center text-muted-foreground'>
            No services mapped yet. Click &quot;Generate answer&quot; or add services manually.
          </div>
        )}
      </div>

      {/* DORA Services Reference */}
      <details className='mb-6'>
        <summary className='cursor-pointer font-medium text-primary'>
          View DORA ICT Services Types Reference (S01-S16)
        </summary>
        <div className='mt-4 border rounded-lg overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='text-left p-2 border-r'>Identifier</th>
                <th className='text-left p-2 border-r'>Type of ICT services</th>
                <th className='text-left p-2'>Description</th>
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

export default ServiceTypeClassification;
