import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Card } from '@/components/ui';
import { useOnboardingStore } from '@/stores/onboardingStore';

const activityLevels = [
  {
    id: 'chill',
    title: 'Easy Going',
    emoji: '🐢',
    description: '2-3 activities per day, plenty of downtime',
    detail: 'Perfect for relaxed travelers who want to savor each moment',
    avgLocations: 3,
    color: 'from-green-400 to-emerald-400',
  },
  {
    id: 'balanced',
    title: 'Balanced',
    emoji: '⚖️',
    description: '4-5 activities, mix of adventure and rest',
    detail: 'The sweet spot for most travelers',
    avgLocations: 5,
    recommended: true,
    color: 'from-blue-400 to-cyan-400',
  },
  {
    id: 'packed',
    title: 'Adventure Packed',
    emoji: '⚡',
    description: '6+ activities, maximize every moment',
    detail: 'For those who want to see it all',
    avgLocations: 7,
    color: 'from-orange-400 to-red-400',
  },
];

export default function ActivityLevelStep() {
  const { answers, setAnswer } = useOnboardingStore();
  const selected = answers.activityLevel || 'balanced';
  const duration = answers.duration || 3;

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4FC3F7]/20 rounded-full mb-4">
          <Zap className="w-4 h-4 text-[#2196F3]" />
          <span className="text-sm font-medium text-[#2196F3]">Step 7 of 8</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          What's your adventure pace?
        </h1>
        <p className="text-gray-600 text-lg">
          We'll match activities to your energy
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {activityLevels.map((level, index) => {
          const isSelected = selected === level.id;
          const totalActivities = level.avgLocations * duration;
          
          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                hoverable
                className={`cursor-pointer text-center relative overflow-hidden h-full ${
                  isSelected ? 'ring-4 ring-[#4FC3F7] ring-offset-2' : ''
                }`}
                onClick={() => setAnswer('activityLevel', level.id)}
              >
                {/* Gradient Background */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 transition-opacity ${
                    isSelected ? 'opacity-10' : ''
                  }`}
                />
                
                {level.recommended && (
                  <span className="absolute -top-1 -right-1 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-bl-xl border-2 border-black">
                    ⭐ Recommended
                  </span>
                )}

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 left-3 w-6 h-6 bg-[#4FC3F7] rounded-full border-2 border-black flex items-center justify-center"
                  >
                    <span className="text-sm">✓</span>
                  </motion.div>
                )}

                <div className="relative z-10">
                  <motion.div
                    animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                    className="text-5xl mb-4"
                  >
                    {level.emoji}
                  </motion.div>
                  <h3 className="font-bold text-xl mb-2">{level.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{level.description}</p>
                  <p className="text-xs text-gray-500 mb-4">{level.detail}</p>
                  
                  {/* Activity Preview */}
                  <div className={`p-3 rounded-lg transition-colors ${
                    isSelected ? 'bg-[#4FC3F7]/20' : 'bg-gray-100'
                  }`}>
                    <p className="text-sm">
                      <span className="font-bold text-lg">{totalActivities}</span>
                      <span className="text-gray-600"> activities in {duration} days</span>
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Visual Timeline Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gray-50">
          <h4 className="font-medium text-gray-700 mb-3">Sample Day Timeline</h4>
          <div className="flex items-center justify-center gap-2 text-sm">
            {selected === 'chill' && (
              <>
                <span className="px-2 py-1 bg-white rounded border">🌅 Morning</span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-white rounded border">☕ Relax</span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-white rounded border">🍽️ Lunch</span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-white rounded border">🏖️ Afternoon</span>
              </>
            )}
            {selected === 'balanced' && (
              <>
                <span className="px-2 py-1 bg-white rounded border">🌅 Early</span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-white rounded border">📍 Visit</span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-white rounded border">🍽️ Lunch</span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-white rounded border">📍 Explore</span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-white rounded border">🌙 Evening</span>
              </>
            )}
            {selected === 'packed' && (
              <>
                <span className="px-2 py-1 bg-white rounded border text-xs">🌅</span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-white rounded border text-xs">📍</span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-white rounded border text-xs">📍</span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-white rounded border text-xs">🍽️</span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-white rounded border text-xs">📍</span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-white rounded border text-xs">📍</span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-white rounded border text-xs">🌙</span>
              </>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

