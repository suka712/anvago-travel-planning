import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Sun, Cloud, CloudRain } from 'lucide-react';
import { Card, Input } from '@/components/ui';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { format, addDays } from 'date-fns';

export default function DatesStep() {
  const { answers, setAnswer } = useOnboardingStore();
  const [flexibility, setFlexibility] = useState<'exact' | 'flexible' | 'unsure'>('flexible');

  const duration = answers.duration || 3;
  const today = new Date();
  const defaultStart = format(addDays(today, 7), 'yyyy-MM-dd');
  const defaultEnd = format(addDays(today, 7 + duration - 1), 'yyyy-MM-dd');

  // Mock weather preview (would come from API)
  const weatherPreview = [
    { day: 'Sat', icon: Sun, temp: '30°', condition: 'Sunny' },
    { day: 'Sun', icon: Cloud, temp: '28°', condition: 'Cloudy' },
    { day: 'Mon', icon: Sun, temp: '31°', condition: 'Sunny' },
    { day: 'Tue', icon: CloudRain, temp: '26°', condition: 'Rainy' },
    { day: 'Wed', icon: Sun, temp: '29°', condition: 'Sunny' },
  ];

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4FC3F7]/20 rounded-full mb-4">
          <CalendarDays className="w-4 h-4 text-[#2196F3]" />
          <span className="text-sm font-medium text-[#2196F3]">Step 3 of 8</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          When are you visiting?
        </h1>
        <p className="text-gray-600 text-lg">
          We'll factor in weather and local events
        </p>
      </motion.div>

      {/* Flexibility Options */}
      <div className="flex justify-center gap-3 mb-8">
        {[
          { id: 'exact', label: 'I have exact dates' },
          { id: 'flexible', label: 'I\'m flexible' },
          { id: 'unsure', label: 'Not sure yet' },
        ].map((option) => (
          <motion.button
            key={option.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFlexibility(option.id as any)}
            className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
              flexibility === option.id
                ? 'border-black bg-[#4FC3F7] shadow-[3px_3px_0px_#000]'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {option.label}
          </motion.button>
        ))}
      </div>

      {/* Date Picker (shown for exact dates) */}
      {flexibility === 'exact' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-8"
        >
          <Card className="inline-block">
            <div className="flex gap-4 items-end">
              <Input
                label="Start Date"
                type="date"
                defaultValue={defaultStart}
                min={format(today, 'yyyy-MM-dd')}
                onChange={(e) => setAnswer('startDate', e.target.value)}
              />
              <span className="text-gray-400 pb-3">→</span>
              <Input
                label="End Date"
                type="date"
                defaultValue={defaultEnd}
                min={defaultStart}
                onChange={(e) => setAnswer('endDate', e.target.value)}
              />
            </div>
          </Card>
        </motion.div>
      )}

      {/* Weather Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-[#4FC3F7]/10 to-[#81D4FA]/10">
          <h3 className="font-bold mb-4 flex items-center justify-center gap-2">
            <Sun className="w-5 h-5 text-yellow-500" />
            Weather Preview for Danang
          </h3>
          
          <div className="flex justify-center gap-4 mb-4">
            {weatherPreview.slice(0, duration > 5 ? 5 : duration).map((day, idx) => {
              const Icon = day.icon;
              return (
                <div key={idx} className="text-center">
                  <p className="text-sm font-medium text-gray-600">{day.day}</p>
                  <Icon className={`w-8 h-8 mx-auto my-2 ${
                    day.icon === Sun ? 'text-yellow-500' :
                    day.icon === CloudRain ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <p className="font-bold">{day.temp}</p>
                </div>
              );
            })}
          </div>

          <p className="text-sm text-gray-600">
            ☀️ Great weather expected! We'll plan outdoor activities during sunny periods.
          </p>
        </Card>
      </motion.div>

      {flexibility === 'unsure' && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-gray-500"
        >
          No problem! We'll create a flexible itinerary you can use anytime.
        </motion.p>
      )}
    </div>
  );
}

