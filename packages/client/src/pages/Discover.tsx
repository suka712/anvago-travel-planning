import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '@/stores/onboardingStore';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import {
  DestinationStep,
  DurationStep,
  DatesStep,
  PersonaStep,
  VibeStep,
  InterestsStep,
  ActivityLevelStep,
  BudgetStep,
} from '@/components/onboarding/steps';

const steps = [
  { component: DestinationStep, canSkip: false },
  { component: DurationStep, canSkip: false },
  { component: DatesStep, canSkip: true },
  { component: PersonaStep, canSkip: true },
  { component: VibeStep, canSkip: true },
  { component: InterestsStep, canSkip: true },
  { component: ActivityLevelStep, canSkip: true },
  { component: BudgetStep, canSkip: false },
];

export default function Discover() {
  const navigate = useNavigate();
  const { currentStep, totalSteps, nextStep, prevStep, isSubmitting, setSubmitting } = useOnboardingStore();

  const handleNext = async () => {
    if (currentStep === totalSteps - 1) {
      // Final step - navigate to generating screen
      setSubmitting(true);
      try {
        // Navigate to generating page which shows loading animation then redirects to results
        navigate('/generating');
      } finally {
        setSubmitting(false);
      }
    } else {
      nextStep();
    }
  };

  const handleSkip = () => {
    nextStep();
  };

  const CurrentStepComponent = steps[currentStep]?.component;
  const canSkip = steps[currentStep]?.canSkip ?? true;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={handleNext}
      onBack={prevStep}
      onSkip={canSkip ? handleSkip : undefined}
      canGoBack={currentStep > 0}
      canSkip={canSkip}
      nextLabel={isLastStep ? "Generate" : "Continue"}
      isLoading={isSubmitting}
    >
      {CurrentStepComponent && <CurrentStepComponent />}
    </OnboardingLayout>
  );
}

