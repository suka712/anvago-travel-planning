import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, MapPin, Utensils, Camera, Route, Star, Heart
} from 'lucide-react';
import Header from '@/components/layouts/Header';
import { useOnboardingStore } from '@/stores/onboardingStore';

const loadingMessages = [
  { icon: MapPin, text: 'Analyzing your destination...', color: 'text-sky-500' },
  { icon: Star, text: 'Finding hidden local gems...', color: 'text-amber-500' },
  { icon: Utensils, text: 'Curating food experiences...', color: 'text-red-500' },
  { icon: Camera, text: 'Selecting photo-worthy spots...', color: 'text-purple-500' },
  { icon: Route, text: 'Optimizing your route...', color: 'text-green-500' },
  { icon: Heart, text: 'Adding personal touches...', color: 'text-pink-500' },
  { icon: Sparkles, text: 'Crafting your perfect itinerary...', color: 'text-sky-primary' },
];

const STEP_DURATION = 600; // ms per step
const TOTAL_DURATION = loadingMessages.length * STEP_DURATION + 300; // Total time before redirect

export default function Generating() {
  const navigate = useNavigate();
  const { answers } = useOnboardingStore();
  const [currentStep, setCurrentStep] = useState(0);

  // Cycle through loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= loadingMessages.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, STEP_DURATION);

    return () => clearInterval(interval);
  }, []);

  // Navigate to results after total duration
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/results');
    }, TOTAL_DURATION);

    return () => clearTimeout(timer);
  }, [navigate]);

  const currentMessage = loadingMessages[currentStep];
  const CurrentIcon = currentMessage.icon;
  const progress = ((currentStep + 1) / loadingMessages.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50">
      <Header />

      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center max-w-md px-6">
          {/* Destination badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm mb-8"
          >
            <MapPin className="w-4 h-4 text-sky-primary" />
            <span className="text-sm font-medium">{answers.destination || 'Danang'}</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500">{answers.duration || 3} days</span>
          </motion.div>

          {/* Animated icon container */}
          <motion.div
            key={currentStep}
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-24 h-24 bg-white rounded-3xl border-2 border-black shadow-[6px_6px_0px_#000] mx-auto mb-8 flex items-center justify-center"
          >
            <CurrentIcon className={`w-12 h-12 ${currentMessage.color}`} />
          </motion.div>

          {/* Loading message */}
          <motion.h2
            key={`text-${currentStep}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold text-gray-800 mb-2"
          >
            {currentMessage.text}
          </motion.h2>

          <p className="text-gray-500 mb-8">
            Creating a personalized experience just for you
          </p>

          {/* Progress bar */}
          <div className="w-full max-w-xs mx-auto">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-primary to-sky-light rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {loadingMessages.map((_, idx) => (
              <motion.div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx <= currentStep ? 'bg-sky-primary' : 'bg-gray-200'
                }`}
                animate={{
                  scale: idx === currentStep ? [1, 1.4, 1] : 1,
                }}
                transition={{ duration: 0.4 }}
              />
            ))}
          </div>

          {/* Fun facts while loading */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 p-4 bg-sky-primary/5 rounded-xl border border-sky-primary/10"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Did you know?</p>
            <p className="text-sm text-gray-700">
              {answers.destination === 'Hoi An'
                ? "Hoi An's Ancient Town is a UNESCO World Heritage Site with over 1,000 historic buildings."
                : "Da Nang's Dragon Bridge breathes fire and water every weekend at 9 PM!"}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
