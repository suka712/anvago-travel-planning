import { useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, X, RotateCcw, Sparkles } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useOnboardingStore } from '@/stores/onboardingStore';

const vibeCards = [
  {
    id: 'marble_mountains',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600',
    title: 'Mystical Heights',
    subtitle: 'Marble Mountains',
    tags: ['spiritual', 'nature', 'photography'],
  },
  {
    id: 'my_khe_beach',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600',
    title: 'Golden Shores',
    subtitle: 'My Khe Beach',
    tags: ['beach', 'relaxation', 'sunrise'],
  },
  {
    id: 'han_market',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
    title: 'Local Hustle',
    subtitle: 'Han Market',
    tags: ['local', 'food', 'shopping'],
  },
  {
    id: 'dragon_bridge',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600',
    title: 'Night Magic',
    subtitle: 'Dragon Bridge',
    tags: ['nightlife', 'iconic', 'photography'],
  },
  {
    id: 'street_food',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
    title: 'Flavor Journey',
    subtitle: 'Street Food Tour',
    tags: ['food', 'local', 'adventure'],
  },
  {
    id: 'son_tra',
    image: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=600',
    title: 'Wild Beauty',
    subtitle: 'Son Tra Peninsula',
    tags: ['nature', 'adventure', 'wildlife'],
  },
  {
    id: 'coffee_culture',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
    title: 'Coffee Culture',
    subtitle: 'Vietnamese Cafes',
    tags: ['cafe', 'local', 'relaxation'],
  },
  {
    id: 'ba_na_hills',
    image: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=600',
    title: 'Fantasy World',
    subtitle: 'Ba Na Hills',
    tags: ['adventure', 'photography', 'iconic'],
  },
];

interface SwipeCardProps {
  card: typeof vibeCards[0];
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}

function SwipeCard({ card, onSwipe, isTop }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = useCallback((_: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe(info.offset.x > 0 ? 'right' : 'left');
    }
  }, [onSwipe]);

  return (
    <motion.div
      className="absolute w-full"
      style={{ x, rotate, opacity }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      exit={{ 
        x: x.get() > 0 ? 300 : -300, 
        opacity: 0,
        transition: { duration: 0.3 }
      }}
    >
      <Card padding="none" className="overflow-hidden cursor-grab active:cursor-grabbing">
        <div className="relative">
          <img
            src={card.image}
            alt={card.title}
            className="w-full h-80 object-cover"
            draggable={false}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Like/Nope Indicators */}
          <motion.div 
            className="absolute top-6 right-6 px-4 py-2 bg-green-500 text-white font-bold text-xl rounded-lg border-2 border-white rotate-12"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </motion.div>
          <motion.div 
            className="absolute top-6 left-6 px-4 py-2 bg-red-500 text-white font-bold text-xl rounded-lg border-2 border-white -rotate-12"
            style={{ opacity: nopeOpacity }}
          >
            NOPE
          </motion.div>
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-2xl font-bold mb-1">{card.title}</h2>
            <p className="text-white/80 mb-3">{card.subtitle}</p>
            <div className="flex flex-wrap gap-2">
              {card.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function VibeStep() {
  const { answers, addToArray } = useOnboardingStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedCards, setSwipedCards] = useState<{ id: string; liked: boolean }[]>([]);

  const remainingCards = vibeCards.slice(currentIndex);
  const likedCount = swipedCards.filter(c => c.liked).length;
  const isComplete = currentIndex >= vibeCards.length;

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const card = vibeCards[currentIndex];
    const liked = direction === 'right';
    
    setSwipedCards(prev => [...prev, { id: card.id, liked }]);
    
    if (liked) {
      addToArray('vibesLiked', card.id);
      card.tags.forEach(tag => addToArray('vibesLiked', tag));
    }
    
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex, addToArray]);

  const handleReset = () => {
    setCurrentIndex(0);
    setSwipedCards([]);
  };

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4FC3F7]/20 rounded-full mb-4">
          <Heart className="w-4 h-4 text-[#2196F3]" />
          <span className="text-sm font-medium text-[#2196F3]">Step 5 of 8</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Which vibes speak to you?
        </h1>
        <p className="text-gray-600 text-lg">
          Swipe right to like, left to pass
        </p>
      </motion.div>

      {/* Progress */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <span className="text-sm text-gray-500">
          {currentIndex} / {vibeCards.length} cards
        </span>
        <span className="text-sm font-medium text-green-600">
          ❤️ {likedCount} liked
        </span>
      </div>

      {/* Card Stack */}
      <div className="relative h-[420px] max-w-sm mx-auto mb-6">
        <AnimatePresence>
          {!isComplete && remainingCards.slice(0, 2).reverse().map((card, index) => (
            <SwipeCard
              key={card.id}
              card={card}
              onSwipe={handleSwipe}
              isTop={index === remainingCards.slice(0, 2).length - 1}
            />
          ))}
        </AnimatePresence>

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Card className="text-center p-8">
              <Sparkles className="w-12 h-12 text-[#4FC3F7] mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">All done!</h3>
              <p className="text-gray-600 mb-4">
                You liked {likedCount} vibes. We'll use this to find your perfect spots.
              </p>
              <Button variant="ghost" onClick={handleReset} leftIcon={<RotateCcw className="w-4 h-4" />}>
                Swipe Again
              </Button>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Manual Buttons */}
      {!isComplete && (
        <div className="flex justify-center gap-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => handleSwipe('left')}
            className="rounded-full w-14 h-14 p-0"
          >
            <X className="w-6 h-6 text-red-500" />
          </Button>
          <Button
            size="lg"
            onClick={() => handleSwipe('right')}
            className="rounded-full w-14 h-14 p-0 bg-green-500 hover:bg-green-600"
          >
            <Heart className="w-6 h-6" />
          </Button>
        </div>
      )}
    </div>
  );
}

