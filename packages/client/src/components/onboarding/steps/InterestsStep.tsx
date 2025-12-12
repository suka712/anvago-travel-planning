import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { Card } from '@/components/ui';
import { useOnboardingStore } from '@/stores/onboardingStore';

const interestCategories = [
  {
    name: 'Experiences',
    items: [
      { id: 'sunrise', icon: '🌅', label: 'Catch a sunrise' },
      { id: 'cooking_class', icon: '👨‍🍳', label: 'Cooking class' },
      { id: 'spa', icon: '💆', label: 'Spa day' },
      { id: 'scuba', icon: '🤿', label: 'Diving/Snorkeling' },
      { id: 'hiking', icon: '🥾', label: 'Hiking' },
      { id: 'cycling', icon: '🚴', label: 'Cycling tour' },
    ],
  },
  {
    name: 'Food & Drink',
    items: [
      { id: 'street_food', icon: '🍢', label: 'Street food tour' },
      { id: 'seafood', icon: '🦞', label: 'Fresh seafood' },
      { id: 'coffee', icon: '☕', label: 'Vietnamese coffee' },
      { id: 'craft_beer', icon: '🍺', label: 'Craft beer scene' },
      { id: 'fine_dining', icon: '🍽️', label: 'Fine dining' },
      { id: 'rooftop', icon: '🌃', label: 'Rooftop bars' },
    ],
  },
  {
    name: 'Culture & History',
    items: [
      { id: 'temples', icon: '🛕', label: 'Temples & pagodas' },
      { id: 'museums', icon: '🏛️', label: 'Museums' },
      { id: 'art', icon: '🎨', label: 'Art galleries' },
      { id: 'local_life', icon: '🏘️', label: 'Local neighborhoods' },
      { id: 'markets', icon: '🛒', label: 'Local markets' },
      { id: 'festivals', icon: '🎊', label: 'Local festivals' },
    ],
  },
];

export default function InterestsStep() {
  const { answers, toggleInArray } = useOnboardingStore();
  const selected = answers.interests || [];

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4FC3F7]/20 rounded-full mb-4">
          <Target className="w-4 h-4 text-[#2196F3]" />
          <span className="text-sm font-medium text-[#2196F3]">Step 6 of 8</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          What's on your must-do list?
        </h1>
        <p className="text-gray-600 text-lg">
          Select as many as you'd like
        </p>
        {selected.length > 0 && (
          <p className="text-sm text-[#2196F3] mt-2">
            {selected.length} selected
          </p>
        )}
      </motion.div>

      <div className="space-y-6 text-left">
        {interestCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
          >
            <h3 className="font-bold text-lg mb-3 text-gray-700">{category.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {category.items.map((item, itemIndex) => {
                const isSelected = selected.includes(item.id);
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: categoryIndex * 0.1 + itemIndex * 0.03 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleInArray('interests', item.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-[#4FC3F7] bg-[#4FC3F7]/15'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className={`font-medium text-sm ${isSelected ? 'text-[#2196F3]' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto text-[#4FC3F7]"
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {selected.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-sm text-gray-500"
        >
          💡 Select interests for better recommendations, or skip to continue
        </motion.p>
      )}
    </div>
  );
}

