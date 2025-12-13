import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Minus, Plus } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useOnboardingStore } from '@/stores/onboardingStore';

const presetDurations = [
  { value: 1, label: 'Day trip', icon: '☀️', description: 'Quick highlights' },
  { value: 2, label: 'Weekend', icon: '🌴', description: '2 days of fun' },
  { value: 3, label: '3 days', icon: '🎒', description: 'Perfect intro', recommended: true },
  { value: 5, label: '5 days', icon: '🧳', description: 'Deep dive' },
  { value: 7, label: 'Week+', icon: '🌏', description: 'Full experience' },
];

export default function DurationStep() {
  const { answers, setAnswer } = useOnboardingStore();
  const [showCustom, setShowCustom] = useState(false);
  const selected = answers.duration || 3;

  const handleCustomChange = (delta: number) => {
    const newValue = Math.max(1, Math.min(30, selected + delta));
    setAnswer('duration', newValue);
  };

  const isPreset = presetDurations.some(d => d.value === selected);

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4FC3F7]/20 rounded-full mb-4">
          <Calendar className="w-4 h-4 text-[#2196F3]" />
          <span className="text-sm font-medium text-[#2196F3]">Step 2 of 8</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          How long is your adventure?
        </h1>
        <p className="text-gray-600 text-lg">
          We'll craft the perfect pace for your trip
        </p>
      </motion.div>

      {/* Preset Options */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {presetDurations.map((duration, index) => (
          <motion.div
            key={duration.value}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              hoverable
              className={`cursor-pointer text-center relative ${
                selected === duration.value && isPreset
                  ? 'bg-sky-300'
                  : ''
              }`}
              onClick={() => {
                setAnswer('duration', duration.value);
                setShowCustom(false);
              }}
            >
              {duration.recommended && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-teal-400 text-white text-xs font-bold rounded-full border-2 border-black">
                  ⭐ Best
                </span>
              )}
              <div className="text-3xl mb-2">{duration.icon}</div>
              <p className="font-bold">{duration.label}</p>
              <p className="text-xs text-gray-500">{duration.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Custom Duration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            className="text-[#2196F3] font-medium hover:underline"
          >
            Need a different duration?
          </button>
        ) : (
          <Card className="inline-flex items-center gap-4 bg-gray-50">
            <span className="font-medium text-gray-600">Custom:</span>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCustomChange(-1)}
                disabled={selected <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-2xl font-bold w-12 text-center">{selected}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCustomChange(1)}
                disabled={selected >= 30}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <span className="text-gray-600">days</span>
          </Card>
        )}
      </motion.div>

      {/* Duration Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-4 bg-white rounded-xl border-2 border-gray-200"
      >
        <p className="text-gray-600">
          In <span className="font-bold text-black">{selected} {selected === 1 ? 'day' : 'days'}</span>, we'll plan approximately{' '}
          <span className="font-bold text-[#2196F3]">
            {selected <= 1 ? '3-4' : selected <= 3 ? '10-15' : selected <= 5 ? '20-25' : '30+'} activities
          </span>{' '}
          for you to explore Danang.
        </p>
      </motion.div>
    </div>
  );
}

