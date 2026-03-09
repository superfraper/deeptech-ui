import React from 'react';

const DoraQuestionnaire = ({ formData, setFormData }) => {
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const textFieldClass =
    'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-2';
  const questionClass = 'mb-6';

  return (
    <div className='bg-white rounded-lg border border-gray-200 p-6'>
      <h2
        className='font-sans font-bold text-lg leading-6 tracking-tight mb-4'
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        Kwestionariusz DORA
      </h2>
      <p
        className='font-sans font-normal text-sm leading-5 text-gray-500 mb-6'
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        Proszę odpowiedzieć na poniższe pytania. Informacje te zostaną
        wykorzystane do przygotowania raportu audytu DORA.
      </p>

      <div className='space-y-6'>
        {/* Company Name */}
        <div className={questionClass}>
          <label className={labelClass} style={{ fontFamily: 'Manrope, sans-serif' }} htmlFor="companyName">
            Nazwa audytowanej spółki *
          </label>
          <input
            type="text"
            id="companyName"
            className={textFieldClass}
            style={{ fontFamily: 'Manrope, sans-serif' }}
            value={formData.companyName || ''}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder='np. ABC Sp. z o.o.'
            required
          />
        </div>

        {/* Question 1 */}
        <div className={questionClass}>
          <label className={labelClass} style={{ fontFamily: 'Manrope, sans-serif' }} htmlFor="isMicroenterprise">
            1. Czy podmiot finansowy jest mikroprzedsiębiorcą?
          </label>
          <div className='flex gap-4'>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='isMicroenterprise'
                value='Tak'
                checked={formData.isMicroenterprise === 'Tak'}
                onChange={(e) => handleChange('isMicroenterprise', e.target.value)}
                className='mr-2'
              />
              <span style={{ fontFamily: 'Manrope, sans-serif' }}>Tak</span>
            </label>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='isMicroenterprise'
                value='Nie'
                checked={formData.isMicroenterprise === 'Nie'}
                onChange={(e) => handleChange('isMicroenterprise', e.target.value)}
                className='mr-2'
              />
              <span style={{ fontFamily: 'Manrope, sans-serif' }}>Nie</span>
            </label>
          </div>
        </div>

        {/* Question 2 */}
        <div className={questionClass}>
          <label className={labelClass} style={{ fontFamily: 'Manrope, sans-serif' }} htmlFor="belongsToGroup">
            2. Czy podmiot należy do grupy?
          </label>
          <div className='flex gap-4'>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='belongsToGroup'
                value='Tak'
                checked={formData.belongsToGroup === 'Tak'}
                onChange={(e) => handleChange('belongsToGroup', e.target.value)}
                className='mr-2'
              />
              <span style={{ fontFamily: 'Manrope, sans-serif' }}>Tak</span>
            </label>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='belongsToGroup'
                value='Nie'
                checked={formData.belongsToGroup === 'Nie'}
                onChange={(e) => handleChange('belongsToGroup', e.target.value)}
                className='mr-2'
              />
              <span style={{ fontFamily: 'Manrope, sans-serif' }}>Nie</span>
            </label>
          </div>
        </div>

        {/* Question 3 */}
        <div className={questionClass}>
          <label className={labelClass} style={{ fontFamily: 'Manrope, sans-serif' }} htmlFor="isCreditInstitution">
            3. Czy podmiot finansowy jest instytucją kredytową sklasyfikowaną
            jako istotna zgodnie z art. 6 ust. 4 rozporządzenia (UE) nr 1024/2013?
          </label>
          <div className='flex gap-4'>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='isCreditInstitution'
                value='Tak'
                checked={formData.isCreditInstitution === 'Tak'}
                onChange={(e) => handleChange('isCreditInstitution', e.target.value)}
                className='mr-2'
              />
              <span style={{ fontFamily: 'Manrope, sans-serif' }}>Tak</span>
            </label>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='isCreditInstitution'
                value='Nie'
                checked={formData.isCreditInstitution === 'Nie'}
                onChange={(e) => handleChange('isCreditInstitution', e.target.value)}
                className='mr-2'
              />
              <span style={{ fontFamily: 'Manrope, sans-serif' }}>Nie</span>
            </label>
          </div>
        </div>

        {/* Question 4 */}
        <div className={questionClass}>
          <label className={labelClass} style={{ fontFamily: 'Manrope, sans-serif' }} htmlFor="isCentralCounterparty">
            4. Czy podmiot jest kontrahentem centralnym (CCP)?
          </label>
          <div className='flex gap-4'>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='isCentralCounterparty'
                value='Tak'
                checked={formData.isCentralCounterparty === 'Tak'}
                onChange={(e) =>
                  handleChange('isCentralCounterparty', e.target.value)
                }
                className='mr-2'
              />
              <span style={{ fontFamily: 'Manrope, sans-serif' }}>Tak</span>
            </label>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='isCentralCounterparty'
                value='Nie'
                checked={formData.isCentralCounterparty === 'Nie'}
                onChange={(e) =>
                  handleChange('isCentralCounterparty', e.target.value)
                }
                className='mr-2'
              />
              <span style={{ fontFamily: 'Manrope, sans-serif' }}>Nie</span>
            </label>
          </div>
        </div>

        {/* Question 5 */}
        <div className={questionClass}>
          <label className={labelClass} style={{ fontFamily: 'Manrope, sans-serif' }} htmlFor="canUseSimplifiedFramework">
            5. Czy podmiot jest uprawniony do stosowania uproszczonych ram
            zarządzania ryzykiem?
          </label>
          <div className='flex gap-4'>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='canUseSimplifiedFramework'
                value='Tak'
                checked={formData.canUseSimplifiedFramework === 'Tak'}
                onChange={(e) =>
                  handleChange('canUseSimplifiedFramework', e.target.value)
                }
                className='mr-2'
              />
              <span style={{ fontFamily: 'Manrope, sans-serif' }}>Tak</span>
            </label>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='canUseSimplifiedFramework'
                value='Nie'
                checked={formData.canUseSimplifiedFramework === 'Nie'}
                onChange={(e) =>
                  handleChange('canUseSimplifiedFramework', e.target.value)
                }
                className='mr-2'
              />
              <span style={{ fontFamily: 'Manrope, sans-serif' }}>Nie</span>
            </label>
          </div>
        </div>

        {/* Question 6 */}
        <div className={questionClass}>
          <label className={labelClass} style={{ fontFamily: 'Manrope, sans-serif' }} htmlFor="hasInformationSecuritySystem">
            6. Czy podmiot finansowy posiada system zarządzania bezpieczeństwem
            informacji?
          </label>
          <div className='flex gap-4'>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='hasInformationSecuritySystem'
                value='Tak'
                checked={formData.hasInformationSecuritySystem === 'Tak'}
                onChange={(e) =>
                  handleChange('hasInformationSecuritySystem', e.target.value)
                }
                className='mr-2'
              />
              <span style={{ fontFamily: 'Manrope, sans-serif' }}>Tak</span>
            </label>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='hasInformationSecuritySystem'
                value='Nie'
                checked={formData.hasInformationSecuritySystem === 'Nie'}
                onChange={(e) =>
                  handleChange('hasInformationSecuritySystem', e.target.value)
                }
                className='mr-2'
              />
              <span style={{ fontFamily: 'Manrope, sans-serif' }}>Nie</span>
            </label>
          </div>
        </div>

        {/* Question 7 */}
        <div className={questionClass}>
          <label className={labelClass} style={{ fontFamily: 'Manrope, sans-serif' }} htmlFor="keyFunctionsDescription">
            7. Jakie są kluczowe i ważne funkcje podmiotu finansowego? Czy
            podmiot posiada ich listę?
          </label>
          <textarea
            id="keyFunctionsDescription"
            className={textFieldClass}
            style={{ fontFamily: 'Manrope, sans-serif' }}
            rows='4'
            value={formData.keyFunctionsDescription || ''}
            onChange={(e) =>
              handleChange('keyFunctionsDescription', e.target.value)
            }
            placeholder='Opisz kluczowe funkcje podmiotu...'
          />
        </div>

        {/* Question 8 */}
        <div className={questionClass}>
          <label className={labelClass} style={{ fontFamily: 'Manrope, sans-serif' }} htmlFor="criticalProcessesDescription">
            8. Jakie są istotne bazowe procesy, systemy i technologie ICT
            wspierające kluczowe funkcje i usługi (w tym funkcje i usługi zlecone
            zewnętrznym dostawcom usług ICT lub będące przedmiotem umowy z takimi
            dostawcami)? Czy podmiot posiada ich listę?
          </label>
          <textarea
            id="criticalProcessesDescription"
            className={textFieldClass}
            style={{ fontFamily: 'Manrope, sans-serif' }}
            rows='4'
            value={formData.criticalProcessesDescription || ''}
            onChange={(e) =>
              handleChange('criticalProcessesDescription', e.target.value)
            }
            placeholder='Opisz istotne procesy, systemy i technologie ICT...'
          />
        </div>

        {/* Question 9 */}
        <div className={questionClass}>
          <label className={labelClass} style={{ fontFamily: 'Manrope, sans-serif' }} htmlFor="externalICTProvidersList">
            9. Lista zewnętrznych dostawców usług ICT
          </label>
          <textarea
            id="externalICTProvidersList"
            className={textFieldClass}
            style={{ fontFamily: 'Manrope, sans-serif' }}
            rows='4'
            value={formData.externalICTProvidersList || ''}
            onChange={(e) =>
              handleChange('externalICTProvidersList', e.target.value)
            }
            placeholder='Wymień zewnętrznych dostawców usług ICT...'
          />
        </div>

        {/* Question 10 */}
        <div className={questionClass}>
          <label className={labelClass} style={{ fontFamily: 'Manrope, sans-serif' }} htmlFor="providesInformationSharingServices">
            10. Czy podmiot świadczy usługi w zakresie udostępniania informacji?
          </label>
          <div className='flex gap-4'>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='providesInformationSharingServices'
                value='Tak'
                checked={
                  formData.providesInformationSharingServices === 'Tak'
                }
                onChange={(e) =>
                  handleChange('providesInformationSharingServices', e.target.value)
                }
                className='mr-2'
              />
              <span style={{ fontFamily: 'Manrope, sans-serif' }}>Tak</span>
            </label>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='providesInformationSharingServices'
                value='Nie'
                checked={
                  formData.providesInformationSharingServices === 'Nie'
                }
                onChange={(e) =>
                  handleChange('providesInformationSharingServices', e.target.value)
                }
                className='mr-2'
              />
              <span style={{ fontFamily: 'Manrope, sans-serif' }}>Nie</span>
            </label>
          </div>
        </div>

        {/* Question 11 */}
        <div className={questionClass}>
          <label className={labelClass} style={{ fontFamily: 'Manrope, sans-serif' }} htmlFor="organizationalStructureDescription">
            11. Opis struktury organizacyjnej podmiotu
          </label>
          <textarea
            id="organizationalStructureDescription"
            className={textFieldClass}
            style={{ fontFamily: 'Manrope, sans-serif' }}
            rows='4'
            value={formData.organizationalStructureDescription || ''}
            onChange={(e) =>
              handleChange('organizationalStructureDescription', e.target.value)
            }
            placeholder='Opisz strukturę organizacyjną podmiotu...'
          />
        </div>
      </div>
    </div>
  );
};

export default DoraQuestionnaire;

