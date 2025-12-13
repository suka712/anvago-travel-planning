import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import { Card } from '@/components/ui';
import { useOnboardingStore } from '@/stores/onboardingStore';

const destinations = [
  {
    id: 'danang',
    name: 'Danang',
    country: 'Vietnam',
    available: true,
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400',
    description: 'Beaches, mountains, and culture',
  },
  {
    id: 'hoian',
    name: 'Hoi An',
    country: 'Vietnam',
    available: false,
    image: 'https://images.unsplash.com/photo-1701397955118-79059690ef50?w=400',
    description: 'Ancient town charm, Streets of old',
  },
  {
    id: 'hue',
    name: 'Huế',
    country: 'Vietnam',
    available: false,
    image: 'https://images.unsplash.com/photo-1664333039578-28ad613ee536?w=400',
    description: 'Imperial heritage, Breathtaking landmarks',
  },
];

export default function DestinationStep() {
  const { answers, setAnswer } = useOnboardingStore();
  const selected = answers.destination || 'danang';

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4FC3F7]/20 rounded-full mb-4">
          <MapPin className="w-4 h-4 text-[#2196F3]" />
          <span className="text-sm font-medium text-[#2196F3]">Step 1 of 8</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Where's your adventure taking you?
        </h1>
        <p className="text-gray-600 text-lg">
          We're currently featuring destinations in Vietnam
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4">
        {destinations.map((dest, index) => (
          <motion.div
            key={dest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              hoverable={dest.available}
              padding="none"
              className={`overflow-hidden cursor-pointer transition-all ${
                selected === dest.id
                  ? 'bg-[#4FC3F7]/5'
                  : ''
              } ${!dest.available ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={() => dest.available && setAnswer('destination', dest.id)}
            >
              <div className="relative">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-40 object-cover"
                />
                {!dest.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="px-3 py-1 bg-white rounded-full text-sm font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Coming Soon
                    </span>
                  </div>
                )}
                {selected === dest.id && dest.available && (
                  <div className="absolute top-3 right-3 w-8 h-8 bg-[#4FC3F7] rounded-full border-2 border-black flex items-center justify-center">
                    <span className="text-lg">✓</span>
                  </div>
                )}
              </div>
              <div className="p-4 text-left">
                <h3 className="font-bold text-lg">{dest.name}</h3>
                <p className="text-sm text-gray-500">{dest.country}</p>
                <p className="text-sm text-gray-600 mt-1">{dest.description}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-sm text-gray-500"
      >
        🌏 More destinations coming soon! We're expanding across Vietnam and Southeast Asia.
      </motion.p>
    </div>
  );
}

