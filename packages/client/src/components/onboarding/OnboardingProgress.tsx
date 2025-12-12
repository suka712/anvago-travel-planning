import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  sections?: { name: string; steps: number }[];
}

export default function OnboardingProgress({ 
  currentStep, 
  totalSteps,
  sections = [
    { name: 'Essentials', steps: 3 },
    { name: 'Your Style', steps: 5 },
  ]
}: OnboardingProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  // Determine which section we're in
  let currentSection = 0;
  let stepsAccumulated = 0;
  for (let i = 0; i < sections.length; i++) {
    if (currentStep < stepsAccumulated + sections[i].steps) {
      currentSection = i;
      break;
    }
    stepsAccumulated += sections[i].steps;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Section Labels */}
      <div className="flex justify-between mb-2">
        {sections.map((section, idx) => {
          const sectionStart = sections.slice(0, idx).reduce((acc, s) => acc + s.steps, 0);
          const sectionEnd = sectionStart + section.steps - 1;
          const isActive = currentStep >= sectionStart && currentStep <= sectionEnd;
          const isComplete = currentStep > sectionEnd;
          
          return (
            <div 
              key={section.name}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive ? 'text-[#2196F3]' : isComplete ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              {isComplete && <Check className="w-4 h-4" />}
              <span>{section.name}</span>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-[#4FC3F7]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
        
        {/* Section Markers */}
        {sections.slice(0, -1).map((section, idx) => {
          const markerPosition = (sections.slice(0, idx + 1).reduce((acc, s) => acc + s.steps, 0) / totalSteps) * 100;
          return (
            <div
              key={idx}
              className="absolute top-0 bottom-0 w-0.5 bg-black"
              style={{ left: `${markerPosition}%` }}
            />
          );
        })}
      </div>

      {/* Step Counter */}
      <div className="flex justify-between mt-2 text-sm text-gray-500">
        <span>Step {currentStep + 1} of {totalSteps}</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
    </div>
  );
}

