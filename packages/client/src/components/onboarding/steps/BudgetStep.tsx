import { motion } from 'framer-motion';
import { Wallet, Info } from 'lucide-react';
import { Card } from '@/components/ui';
import { useOnboardingStore } from '@/stores/onboardingStore';

const budgetLevels = [
  {
    id: 'budget',
    title: 'Budget Savvy',
    emoji: '💰',
    description: 'Street food, hostels, free attractions',
    dailyRange: 'Under 500,000 VND',
    dailyUSD: '~$20',
    avgDaily: 400000,
    examples: ['Street food meals', 'Local buses', 'Free beaches', 'Budget hostels'],
    color: 'from-green-500 to-green-200',
  },
  {
    id: 'moderate',
    title: 'Comfortable',
    emoji: '💳',
    description: 'Mix of experiences, mid-range dining',
    dailyRange: '500K - 1.5M VND',
    dailyUSD: '~$20-60',
    avgDaily: 1000000,
    recommended: true,
    examples: ['Nice restaurants', 'Grab rides', 'Guided tours', '3-star hotels'],
    color: 'from-blue-600 to-blue-200',
  },
  {
    id: 'luxury',
    title: 'Treat Yourself',
    emoji: '✨',
    description: 'Fine dining, premium experiences',
    dailyRange: 'Beyond 1.5M VND',
    dailyUSD: '~$60+',
    avgDaily: 2500000,
    examples: ['Fine dining', 'Private tours', 'Spa treatments', '5-star resorts'],
    color: 'from-purple-600 to-purple-200',
  },
];

export default function BudgetStep() {
  const { answers, setAnswer } = useOnboardingStore();
  const selected = answers.budgetLevel || 'moderate';
  const duration = answers.duration || 3;

  const selectedBudget = budgetLevels.find(b => b.id === selected);
  const totalEstimate = selectedBudget ? selectedBudget.avgDaily * duration : 0;

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4FC3F7]/20 rounded-full mb-4">
          <Wallet className="w-4 h-4 text-[#2196F3]" />
          <span className="text-sm font-medium text-[#2196F3]">Step 8 of 8 - Final Step!</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          What's your spending style?
        </h1>
        <p className="text-gray-600 text-lg">
          This helps us suggest the right experiences
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {budgetLevels.map((level, index) => {
          const isSelected = selected === level.id;

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
                  isSelected ? 'bg-[#4FC3F7]/5' : ''
                }`}
                onClick={() => setAnswer('budgetLevel', level.id as 'budget' | 'moderate' | 'luxury')}
              >
                {/* Gradient Background */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 transition-opacity ${
                    isSelected ? 'opacity-30' : ''
                  }`}
                />
                
                {level.recommended && (
                  <span className="absolute -top-1 -right-1 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-bl-xl border-2 border-black">
                    ⭐ Most Popular
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
                  <h3 className="font-bold text-xl mb-1">{level.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{level.description}</p>
                  
                  {/* Price Range */}
                  <div className={`p-3 rounded-lg mb-4 transition-colors ${
                    isSelected ? 'bg-[#4FC3F7]/20' : 'bg-gray-100'
                  }`}>
                    <p className="font-bold text-lg">{level.dailyRange}</p>
                    <p className="text-sm text-gray-500">per day ({level.dailyUSD})</p>
                  </div>

                  {/* Examples */}
                  <div className="text-left">
                    <p className="text-xs font-medium text-gray-500 mb-2">Includes:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {level.examples.map((example, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <span className="text-[#4FC3F7]">•</span> {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Budget Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-r from-[#4FC3F7]/10 to-[#81D4FA]/10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Info className="w-4 h-4 text-[#2196F3]" />
            <h4 className="font-medium text-gray-700">Estimated Trip Budget</h4>
          </div>
          <p className="text-3xl font-bold text-[#2196F3] mb-1">
            {(totalEstimate / 1000000).toFixed(1)}M VND
          </p>
          <p className="text-sm text-gray-500">
            ~${Math.round(totalEstimate / 24500)} USD for {duration} days
          </p>
          <p className="text-xs text-gray-400 mt-2">
            *Excludes flights and major accommodations
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

