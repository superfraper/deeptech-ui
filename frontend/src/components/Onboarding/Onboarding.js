import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../services/api';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Select } from '../ui/select';

const ROLES = [
  { id: 'board_member', label: 'Board Member', active: true },
  { id: 'auditor', label: 'Auditor', active: true },
  { id: 'vendor_manager', label: 'Vendor Manager', active: true },
  { id: 'risk_manager', label: 'Risk Manager', active: false },
  { id: 'continuous_compliance_manager', label: 'Continuous Compliance Manager', active: false },
  { id: 'implementation_manager', label: 'Implementation Manager', active: false },
  { id: 'documentation_manager', label: 'Documentation Manager', active: false },
  { id: 'contributor', label: 'Contributor', active: false },
  { id: 'it_manager', label: 'IT Manager', active: false },
  { id: 'lawyer', label: 'Lawyer', active: false },
  { id: 'compliance_officer', label: 'Compliance Officer', active: false },
  { id: 'it_support', label: 'IT Support', active: false },
  { id: 'other', label: 'Other', active: false },
];

const USE_CASES = [
  { id: 'vendor_contract_audit', label: 'Vendor contract audit' },
  { id: 'onboard_vendor', label: 'Onboard a Vendor' },
  { id: 'monitor_vendor', label: 'Monitor a Vendor' },
  { id: 'audit_vendor', label: 'Audit a Vendor' },
  { id: 'report_vendor', label: 'Report a Vendor' },
  { id: 'load_search_docs', label: 'Load and search documentation' },
  { id: 'generate_checklist_regulation', label: 'Generate a checklist from a regulation' },
  { id: 'generate_custom_checklist', label: 'Generate a custom checklist' },
  { id: 'documentation_audit', label: 'Documentation audit' },
  { id: 'generate_audit_responses', label: 'Generate an audit responses and gaps' },
  { id: 'create_dora_checklist', label: 'Create a DORA requirements checklist' },
  { id: 'process_dora_audit', label: 'Process a DORA audit' },
  { id: 'create_dora_report', label: 'Create a DORA audit report' },
  { id: 'create_contract_list', label: 'Create a list of contracts and monitoring tasks' },
  { id: 'ask_question', label: 'Ask own question (manually/chatbox)' },
];

const GOALS = [
  { id: 'dora_compliance', label: "Achieving Vendor's high DORA compliance level" },
  { id: 'consistent_documentation', label: 'Achieving consistent supplier documentation' },
  { id: 'vendor_requirements', label: 'Keeping Vendor requirements consistent' },
  { id: 'automate_compliance', label: 'Automating Internal Compliance Processes' },
  { id: 'mitigate_risks', label: 'Mitigating Vendor risks' },
];

const Onboarding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const api = useApi();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    useCases: [],
    goals: [],
  });

  const steps = [
    {
      id: 1,
      title: 'Which best describes your role?',
      description:
        "This helps highlight what's most useful for you, without limiting what you can explore",
    },
    {
      id: 2,
      title: 'How do you want to start using Audomate?',
      description: 'Pick as many as you want. This helps us guide your experience',
    },
    {
      id: 3,
      title: 'Which goals do you want to focus on?',
      description: 'Select the goals that matter most to your organization',
    },
  ];

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await api.saveOnboardingProfile({
        role: formData.role,
        use_cases: formData.useCases,
        goals: formData.goals,
      });

      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem('onboarding_data', JSON.stringify(formData));

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem('onboarding_data', JSON.stringify(formData));
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field, itemId) => {
    setFormData((prev) => {
      const currentArray = prev[field] || [];
      if (currentArray.includes(itemId)) {
        return { ...prev, [field]: currentArray.filter((id) => id !== itemId) };
      } else {
        return { ...prev, [field]: [...currentArray, itemId] };
      }
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.role !== '';
      case 2:
        return formData.useCases.length > 0;
      case 3:
        return formData.goals.length > 0;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <label htmlFor='role' className='text-sm font-medium'>
                Select your role
              </label>
              <Select
                id='role'
                value={formData.role}
                onChange={(e) => updateFormData('role', e.target.value)}
                className='w-full'
              >
                <option value=''>Select a role...</option>
                {ROLES.map((role) => (
                  <option
                    key={role.id}
                    value={role.id}
                    disabled={!role.active}
                  >
                    {role.label}
                    {!role.active ? ' (Coming soon)' : ''}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {USE_CASES.map((useCase) => (
                <label
                  key={useCase.id}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.useCases.includes(useCase.id)
                      ? 'bg-primary/10 border-primary'
                      : 'bg-background hover:bg-muted border-border'
                  }`}
                >
                  <input
                    type='checkbox'
                    checked={formData.useCases.includes(useCase.id)}
                    onChange={() => toggleArrayItem('useCases', useCase.id)}
                    className='mr-3 h-4 w-4 rounded border-gray-300'
                  />
                  <span className='text-sm'>{useCase.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-4'>
            <div className='space-y-3'>
              {GOALS.map((goal) => (
                <label
                  key={goal.id}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                    formData.goals.includes(goal.id)
                      ? 'bg-primary/10 border-primary'
                      : 'bg-background hover:bg-muted border-border'
                  }`}
                >
                  <input
                    type='checkbox'
                    checked={formData.goals.includes(goal.id)}
                    onChange={() => toggleArrayItem('goals', goal.id)}
                    className='mr-3 h-4 w-4 rounded border-gray-300'
                  />
                  <span className='text-sm font-medium'>{goal.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-background p-4'>
      <Card className='w-full max-w-3xl'>
        <CardHeader>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <CardTitle className='text-xl'>
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription className='mt-1'>
                {steps[currentStep - 1].description}
              </CardDescription>
            </div>
            <div className='text-sm text-muted-foreground'>
              Step {currentStep} of {steps.length}
            </div>
          </div>
          <div className='w-full bg-secondary rounded-full h-2'>
            <div
              className='bg-primary h-2 rounded-full transition-all duration-300'
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {renderStepContent()}
          <div className='flex justify-between pt-4'>
            <Button
              variant='outline'
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
            >
              {isSubmitting
                ? 'Saving...'
                : currentStep === steps.length
                  ? 'Get Started'
                  : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
