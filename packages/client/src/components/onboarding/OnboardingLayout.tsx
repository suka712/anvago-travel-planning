import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui';
import OnboardingProgress from './OnboardingProgress';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  canGoBack?: boolean;
  canSkip?: boolean;
  nextLabel?: string;
  isNextDisabled?: boolean;
  isLoading?: boolean;
}

export default function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  canGoBack = true,
  canSkip = true,
  nextLabel = 'Continue',
  isNextDisabled = false,
  isLoading = false,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10 flex flex-col">
      {/* Header with Progress */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-4">
        <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer with Navigation */}
      <footer className="sticky bottom-0 bg-white border-t-2 border-black px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Back Button */}
          <div className="w-32">
            {canGoBack && currentStep > 0 && (
              <Button
                variant="ghost"
                onClick={onBack}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            )}
          </div>

          {/* Skip Button (centered) */}
          <div className="flex-1 flex justify-center">
            {canSkip && onSkip && (
              <button
                onClick={onSkip}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-1 transition-colors"
              >
                Skip this step
                <SkipForward className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Next Button */}
          <div className="w-32 flex justify-end">
            <Button
              onClick={onNext}
              disabled={isNextDisabled}
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {nextLabel}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

