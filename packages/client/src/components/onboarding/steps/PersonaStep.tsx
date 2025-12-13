import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui';
import { useOnboardingStore } from '@/stores/onboardingStore';

const personas = [
  {
    id: 'adventurer',
    name: 'Adventurer',
    emoji: '🏔️',
    description: 'Thrill-seeker, off-beaten-path explorer',
    color: '#FF6B6B',
    gradient: 'from-red-400 to-orange-400',
  },
  {
    id: 'foodie',
    name: 'The Foodie',
    emoji: '🍜',
    description: 'Street food enthusiast, culinary explorer',
    color: '#FFB347',
    gradient: 'from-orange-400 to-yellow-400',
  },
  {
    id: 'culture_seeker',
    name: 'Culturalist',
    emoji: '🏛️',
    description: 'History buff, temple wanderer',
    color: '#9B59B6',
    gradient: 'from-purple-400 to-pink-400',
  },
  {
    id: 'relaxer',
    name: 'Relaxer',
    emoji: '🏖️',
    description: 'Beach lover, spa enthusiast',
    color: '#3498DB',
    gradient: 'from-blue-400 to-cyan-400',
  },
  {
    id: 'photographer',
    name: 'Photographer',
    emoji: '📸',
    description: 'Golden hour chaser, view hunter',
    color: '#E91E63',
    gradient: 'from-pink-400 to-rose-400',
  },
  {
    id: 'nightowl',
    name: 'Night Owl',
    emoji: '🌙',
    description: 'Bar hopper, nightlife explorer',
    color: '#2C3E50',
    gradient: 'from-slate-600 to-slate-800',
  },
  {
    id: 'wellness',
    name: 'The Seeker',
    emoji: '🧘',
    description: 'Yoga retreats, healthy living',
    color: '#27AE60',
    gradient: 'from-green-400 to-emerald-400',
  },
  {
    id: 'social_butterfly',
    name: 'The Butterfly',
    emoji: '🦋',
    description: 'Hostel vibes, group tours',
    color: '#F39C12',
    gradient: 'from-amber-400 to-yellow-400',
  },
];

export default function PersonaStep() {
  const { answers, toggleInArray } = useOnboardingStore();
  const selected = answers.personas || [];
  const maxSelections = 3;

  const handleSelect = (id: string) => {
    if (selected.includes(id)) {
      toggleInArray('personas', id);
    } else if (selected.length < maxSelections) {
      toggleInArray('personas', id);
    }
  };

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4FC3F7]/20 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-[#2196F3]" />
          <span className="text-sm font-medium text-[#2196F3]">Step 4 of 8</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Who are you as a traveler?
        </h1>
        <p className="text-gray-600 text-lg">
          Pick up to {maxSelections} that resonate with you
        </p>
        {(
          <p className="text-sm text-[#2196F3] mt-2">
            {selected.length} of {maxSelections} selected
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {personas.map((persona, index) => {
          const isSelected = selected.includes(persona.id);
          const isDisabled = !isSelected && selected.length >= maxSelections;
          
          return (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                hoverable={!isDisabled}
                className={`cursor-pointer text-center relative overflow-hidden transition-all ${
                  isSelected
                    ? 'bg-[#4FC3F7]/10'
                    : ''
                } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                onClick={() => !isDisabled && handleSelect(persona.id)}
              >
                {/* Gradient Background */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${persona.gradient} opacity-0 transition-opacity ${
                    isSelected ? 'opacity-20' : ''
                  }`}
                />
                
                {/* Selection Checkmark */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-[#4FC3F7] rounded-full border-2 border-black flex items-center justify-center"
                  >
                    <span className="text-sm">✓</span>
                  </motion.div>
                )}

                <div className="relative z-10">
                  <motion.div
                    animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                    className="text-4xl mb-3"
                  >
                    {persona.emoji}
                  </motion.div>
                  <h3 className="font-bold text-sm md:text-base mb-1">{persona.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{persona.description}</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

