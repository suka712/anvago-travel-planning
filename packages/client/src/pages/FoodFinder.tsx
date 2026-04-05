import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, MapPin, Star, ChefHat,
  Utensils, Coffee, IceCream, Pizza, Salad, Soup,
  RefreshCw, Navigation, Brain, Zap, Heart,
  ArrowRight, MessageSquare, Send, AlertCircle, CheckCircle,
  X, Bot, User
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import Header from '@/components/layouts/Header';
import { foodAPI } from '@/services/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1715925717150-2a6d181d8846?q=80&w=1286&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

// Food categories with icons
const foodCategories = [
  { id: 'all', name: 'All Food', icon: Utensils, color: 'bg-gray-100' },
  { id: 'local', name: 'Local Eats', icon: ChefHat, color: 'bg-orange-100' },
  { id: 'cafe', name: 'Cafés', icon: Coffee, color: 'bg-amber-100' },
  { id: 'dessert', name: 'Desserts', icon: IceCream, color: 'bg-pink-100' },
  { id: 'street', name: 'Street Food', icon: Pizza, color: 'bg-red-100' },
  { id: 'healthy', name: 'Healthy', icon: Salad, color: 'bg-green-100' },
  { id: 'soup', name: 'Pho & Soups', icon: Soup, color: 'bg-yellow-100' },
];

// Mock food data (will be replaced with API data)
const mockFoodSpots = [
  {
    id: '1',
    name: 'Bánh Mì Bà Lan',
    category: 'street',
    rating: 4.8,
    reviews: 324,
    priceLevel: 1,
    distance: '0.3 km',
    image: 'https://images.unsplash.com/photo-1600454309261-3dc64d79c6a4?w=400',
    tags: ['Authentic', 'Quick Bite', 'Local Favorite'],
    openNow: true,
    aiSummary: '',
  },
  {
    id: '2',
    name: 'Madame Lan Restaurant',
    category: 'local',
    rating: 4.6,
    reviews: 512,
    priceLevel: 2,
    distance: '0.8 km',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    tags: ['Fine Dining', 'Traditional', 'Garden View'],
    openNow: true,
    aiSummary: '',
  },
  {
    id: '3',
    name: '43 Factory Coffee',
    category: 'cafe',
    rating: 4.9,
    reviews: 891,
    priceLevel: 2,
    distance: '1.2 km',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
    tags: ['Specialty Coffee', 'Instagram Worthy', 'Peaceful'],
    openNow: true,
    aiSummary: '',
  },
  {
    id: '4',
    name: 'Phở Bò Sài Gòn',
    category: 'soup',
    rating: 4.7,
    reviews: 267,
    priceLevel: 1,
    distance: '0.5 km',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    tags: ['Breakfast Spot', 'Authentic Pho', 'Family Recipe'],
    openNow: true,
    aiSummary: '',
  },
  {
    id: '5',
    name: 'Bé Mặn Seafood',
    category: 'local',
    rating: 4.5,
    reviews: 445,
    priceLevel: 3,
    distance: '2.1 km',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
    tags: ['Fresh Seafood', 'Ocean View', 'Must Try'],
    openNow: false,
    aiSummary: '',
  },
  {
    id: '6',
    name: 'Chè Xưa',
    category: 'dessert',
    rating: 4.4,
    reviews: 198,
    priceLevel: 1,
    distance: '0.7 km',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    tags: ['Sweet Treats', 'Traditional Dessert', 'Cool Down'],
    openNow: true,
    aiSummary: '',
  },
  {
    id: '7',
    name: 'Mì Quảng Bà Vị',
    category: 'local',
    rating: 4.8,
    reviews: 410,
    priceLevel: 1,
    distance: '0.6 km',
    image: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=400',
    tags: ['Mì Quảng', 'Must Try', 'Local Legend'],
    openNow: true,
    aiSummary: '',
  },
  {
    id: '8',
    name: 'Cơm Gà A Hai',
    category: 'local',
    rating: 4.7,
    reviews: 356,
    priceLevel: 1,
    distance: '0.9 km',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400',
    tags: ['Chicken Rice', 'Comfort Food', 'Packed at Lunch'],
    openNow: true,
    aiSummary: '',
  },
  {
    id: '9',
    name: 'Bánh Tráng Thịt Heo Trần',
    category: 'street',
    rating: 4.6,
    reviews: 289,
    priceLevel: 1,
    distance: '0.4 km',
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
    tags: ['Pork Wraps', 'Da Nang Specialty', 'Authentic'],
    openNow: true,
    aiSummary: '',
  },
  {
    id: '10',
    name: 'Bún Chả Cá 109',
    category: 'soup',
    rating: 4.5,
    reviews: 231,
    priceLevel: 1,
    distance: '0.7 km',
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400',
    tags: ['Fish Cake Noodle', 'Breakfast Fave', 'Local Classic'],
    openNow: true,
    aiSummary: '',
  },
  {
    id: '11',
    name: 'The Fig Lounge & Coffee',
    category: 'cafe',
    rating: 4.7,
    reviews: 502,
    priceLevel: 2,
    distance: '1.5 km',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
    tags: ['Brunch', 'Cozy Vibes', 'Good Pastries'],
    openNow: true,
    aiSummary: '',
  },
  {
    id: '12',
    name: 'Nhà Hàng Trần',
    category: 'local',
    rating: 4.4,
    reviews: 178,
    priceLevel: 3,
    distance: '1.8 km',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    tags: ['Vietnamese Fine Dining', 'Riverside', 'Date Night'],
    openNow: false,
    aiSummary: '',
  },
  {
    id: '13',
    name: 'Ốc Đào',
    category: 'street',
    rating: 4.6,
    reviews: 367,
    priceLevel: 2,
    distance: '1.0 km',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
    tags: ['Snails & Shellfish', 'Night Spot', 'Beer Friendly'],
    openNow: true,
    aiSummary: '',
  },
  {
    id: '14',
    name: 'Yoga Healthy Kitchen',
    category: 'healthy',
    rating: 4.5,
    reviews: 145,
    priceLevel: 2,
    distance: '1.6 km',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    tags: ['Vegan Options', 'Smoothie Bowls', 'Clean Eating'],
    openNow: true,
    aiSummary: '',
  },
  {
    id: '15',
    name: 'Bánh Xèo Bà Dưỡng',
    category: 'street',
    rating: 4.9,
    reviews: 623,
    priceLevel: 1,
    distance: '0.8 km',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    tags: ['Crispy Pancake', 'Anthony Bourdain Approved', 'Iconic'],
    openNow: true,
    aiSummary: '',
  },
  {
    id: '16',
    name: 'Kem Bơ Thanh Trà',
    category: 'dessert',
    rating: 4.3,
    reviews: 214,
    priceLevel: 1,
    distance: '0.5 km',
    image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400',
    tags: ['Avocado Ice Cream', 'Cheap & Good', 'After Dinner Treat'],
    openNow: true,
    aiSummary: '',
  },
];

// AI thinking phrases for the animation
const aiThinkingPhrases = [
  'Analyzing your taste preferences...',
  'Scanning nearby restaurants...',
  'Checking real-time reviews...',
  'Calculating optimal flavor profiles...',
  'Finding hidden culinary gems...',
  'Matching your mood to menus...',
  'Consulting local food experts...',
  'Evaluating freshness scores...',
];

// AI-generated summaries for food spots
const generateAISummary = (spot: typeof mockFoodSpots[0]) => {
  const summaries: Record<string, string[]> = {
    street: [
      "🔥 This spot is absolutely LEGENDARY among locals. The secret sauce recipe has been passed down for 3 generations. Pro tip: arrive before 11am to avoid the queue!",
      "💯 AI Analysis: 94% of visitors describe this as 'life-changing'. The crispy baguette-to-filling ratio is mathematically perfect.",
    ],
    local: [
      "🌟 Our AI detected exceptionally high satisfaction scores here. The ambiance + food quality combo puts this in the top 5% of Danang restaurants.",
      "🎯 Perfect match for your profile! This restaurant's flavor complexity aligns with adventurous eaters who appreciate authentic Vietnamese cuisine.",
    ],
    cafe: [
      "☕ Coffee connoisseur alert! This cafe sources single-origin beans from the Central Highlands. The pour-over technique here is world-class.",
      "📸 Instagram data shows this is the most photographed cafe in Danang. The aesthetic-to-quality ratio is off the charts!",
    ],
    dessert: [
      "🍨 Sweet tooth activated! AI analysis shows this spot has mastered the art of traditional Vietnamese desserts with a modern twist.",
      "✨ Locals rate this as the BEST place to cool down. The chè here uses recipes dating back to the 1960s.",
    ],
    soup: [
      "🍜 Pho perfection detected! The broth here is simmered for 12+ hours. Our AI rates the flavor depth at 9.7/10.",
      "🌅 Pro tip from AI: Visit at sunrise for the most authentic experience. The morning batch is always the freshest!",
    ],
    healthy: [
      "🥗 Health-conscious choice! This spot uses 100% locally-sourced organic ingredients. Your body will thank you.",
      "💪 AI nutritional analysis: High protein, low sodium, maximum flavor. Perfect fuel for your adventures!",
    ],
  };

  const category = spot.category || 'local';
  const options = summaries[category] || summaries.local;
  return options[Math.floor(Math.random() * options.length)];
};

export default function FoodFinder() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [currentThinkingPhrase, setCurrentThinkingPhrase] = useState(0);
  const [foodSpots, setFoodSpots] = useState<typeof mockFoodSpots>([]);
  const [selectedSpot, setSelectedSpot] = useState<typeof mockFoodSpots[0] | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Comments state
  interface Comment { id: string; text: string; author: string; createdAt: string; }
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Chat state
  interface ChatMessage { role: 'user' | 'assistant'; content: string }
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initial load with AI animation
  useEffect(() => {
    const loadFoodSpots = async () => {
      setIsAiThinking(true);

      // Cycle through AI thinking phrases
      const phraseInterval = setInterval(() => {
        setCurrentThinkingPhrase(prev => (prev + 1) % aiThinkingPhrases.length);
      }, 800);

      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2500));

      clearInterval(phraseInterval);

      // Add AI summaries to food spots
      const spotsWithSummaries = mockFoodSpots.map(spot => ({
        ...spot,
        aiSummary: generateAISummary(spot),
      }));

      setFoodSpots(spotsWithSummaries);
      setIsLoading(false);
      setIsAiThinking(false);

      // Generate overall AI recommendation
      setAiRecommendation(
        "Based on current time, weather, and trending spots: I recommend trying **Bánh Mì Bà Lan** for a quick authentic bite, or **43 Factory Coffee** if you're in the mood for a chill vibe. Both are nearby and highly rated! 🎯"
      );
    };

    loadFoodSpots();
  }, []);

  // Filter spots by category
  const filteredSpots = selectedCategory === 'all'
    ? foodSpots
    : foodSpots.filter(spot => spot.category === selectedCategory);

  // Refresh recommendations
  const refreshRecommendations = async () => {
    setIsAiThinking(true);
    setCurrentThinkingPhrase(0);

    const phraseInterval = setInterval(() => {
      setCurrentThinkingPhrase(prev => (prev + 1) % aiThinkingPhrases.length);
    }, 600);

    await new Promise(resolve => setTimeout(resolve, 2000));

    clearInterval(phraseInterval);

    // Shuffle and regenerate summaries
    const shuffled = [...foodSpots]
      .sort(() => Math.random() - 0.5)
      .map(spot => ({
        ...spot,
        aiSummary: generateAISummary(spot),
      }));

    setFoodSpots(shuffled);
    setIsAiThinking(false);
  };

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Open spot modal and load its comments
  const openSpot = async (spot: typeof mockFoodSpots[0]) => {
    setSelectedSpot(spot);
    setCommentText('');
    setCommentAuthor('');
    setCommentError('');
    setCommentSuccess(false);
    try {
      const res = await foodAPI.getComments(spot.id);
      setComments(res.data.data || []);
    } catch {
      setComments([]);
    }
  };

  // Submit a comment
  const submitComment = async () => {
    if (!selectedSpot || !commentText.trim()) return;
    setCommentSubmitting(true);
    setCommentError('');
    setCommentSuccess(false);
    try {
      const res = await foodAPI.submitComment({
        spotId: selectedSpot.id,
        text: commentText,
        author: commentAuthor.trim() || undefined,
      });
      setComments(prev => [res.data.data, ...prev]);
      setCommentText('');
      setCommentAuthor('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to submit comment.';
      setCommentError(msg);
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Send chat message
  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await foodAPI.chat(updated);
      const reply = res.data.data.reply;
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I couldn\'t connect right now. Please try again!' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 py-12 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10 text-6xl"
              initial={{ y: '100%', x: `${i * 20}%` }}
              animate={{
                y: '-100%',
                rotate: [0, 360],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 1.5,
              }}
            >
              {['🍜', '🍣', '🥢', '🍲', '🥟', '☕'][i]}
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6">
              <Brain className="w-5 h-5" />
              <span className="font-medium">AI-Powered Food Discovery</span>
              <Sparkles className="w-4 h-4" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Next
              <span className="block mt-2">
                <motion.span
                  key={isAiThinking ? 'thinking' : 'ready'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-block"
                >
                  {isAiThinking ? '🤔 Delicious Discovery' : '😋 Perfect Meal'}
                </motion.span>
              </span>
            </h1>

            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Our AI analyzes thousands of reviews, local favorites, and real-time data
              to find the perfect food spots just for you.
            </p>

            {/* Location indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
              <Navigation className="w-4 h-4" />
              <span>Searching near: <strong>Da Nang, Vietnam</strong></span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Thinking Overlay */}
      <AnimatePresence>
        {isAiThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl"
            >
              {/* AI Brain Animation */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-4 border-dashed border-orange-300"
                />
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center"
                >
                  <Brain className="w-10 h-10 text-white" />
                </motion.div>
                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-orange-400 rounded-full"
                    initial={{
                      x: 48,
                      y: 48,
                      scale: 0
                    }}
                    animate={{
                      x: 48 + Math.cos(i * 60 * Math.PI / 180) * 50,
                      y: 48 + Math.sin(i * 60 * Math.PI / 180) * 50,
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>

              <h3 className="text-xl font-bold mb-2">AI is thinking...</h3>
              <motion.p
                key={currentThinkingPhrase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-gray-600"
              >
                {aiThinkingPhrases[currentThinkingPhrase]}
              </motion.p>

              {/* Progress dots */}
              <div className="flex justify-center gap-1 mt-4">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-orange-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Recommendation Banner */}
        {aiRecommendation && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-900">AI Recommendation</h3>
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Personalized
                    </Badge>
                  </div>
                  <p className="text-gray-700" dangerouslySetInnerHTML={{
                    __html: aiRecommendation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }} />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshRecommendations}
                  className="flex-shrink-0"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">What are you craving?</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {foodCategories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap ${
                    isSelected
                      ? 'border-black bg-black text-white shadow-[2px_2px_0px_#000]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{category.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Food Spots Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredSpots.map((spot, index) => (
              <motion.div
                key={spot.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-[6px_6px_0px_#000] transition-shadow cursor-pointer group">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={spot.image}
                      alt={spot.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                    />
                    {/* Overlay badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {spot.openNow ? (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                          Open Now
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">
                          Closed
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(spot.id);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favorites.has(spot.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{spot.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{spot.distance}</span>
                          <span>•</span>
                          <span>{'$'.repeat(spot.priceLevel)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold">{spot.rating}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {spot.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* AI Summary */}
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-3 border border-orange-100">
                      <div className="flex items-center gap-1 text-xs text-orange-600 font-medium mb-1">
                        <Sparkles className="w-3 h-3" />
                        AI Insight
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {spot.aiSummary}
                      </p>
                    </div>

                    {/* Action Button */}
                    <Button
                      className="w-full mt-4"
                      onClick={() => openSpot(spot)}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredSpots.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">No spots found</h3>
            <p className="text-gray-500 mb-4">Try selecting a different category</p>
            <Button variant="secondary" onClick={() => setSelectedCategory('all')}>
              Show All
            </Button>
          </div>
        )}

        {/* Spot Detail Modal */}
        <AnimatePresence>
          {selectedSpot && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedSpot(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Image */}
                <div className="relative h-56">
                  <img
                    src={selectedSpot.image}
                    alt={selectedSpot.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                  />
                  <button
                    onClick={() => setSelectedSpot(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    ×
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedSpot.name}</h2>
                      <div className="flex items-center gap-3 text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {selectedSpot.distance}
                        </span>
                        <span>{'$'.repeat(selectedSpot.priceLevel)}</span>
                        <span className={selectedSpot.openNow ? 'text-green-500' : 'text-red-500'}>
                          {selectedSpot.openNow ? 'Open' : 'Closed'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-2 bg-yellow-100 rounded-xl">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-lg">{selectedSpot.rating}</span>
                      <span className="text-sm text-gray-500">({selectedSpot.reviews})</span>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-4 border-2 border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-bold">AI Analysis</h3>
                    </div>
                    <p className="text-gray-700">{selectedSpot.aiSummary}</p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedSpot.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mb-6">
                    <Button className="flex-1">
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => toggleFavorite(selectedSpot.id)}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favorites.has(selectedSpot.id) ? 'fill-red-500 text-red-500' : ''
                        }`}
                      />
                    </Button>
                  </div>

                  {/* Comments Section */}
                  <div className="border-t-2 border-gray-100 pt-5">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-orange-500" />
                      <h3 className="font-bold text-gray-900">Leave a Comment</h3>
                      <span className="text-xs text-gray-400 ml-auto">{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Submit form */}
                    <div className="space-y-3 mb-5">
                      <input
                        type="text"
                        placeholder="Your name (optional)"
                        value={commentAuthor}
                        onChange={e => setCommentAuthor(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                      />
                      <textarea
                        placeholder="Share your experience... (write naturally, not like a robot)"
                        value={commentText}
                        onChange={e => { setCommentText(e.target.value); setCommentError(''); }}
                        rows={3}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-orange-400 transition-colors"
                      />

                      {/* Error message */}
                      {commentError && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-2 px-3 py-2 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-700"
                        >
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{commentError}</span>
                        </motion.div>
                      )}

                      {/* Success message */}
                      {commentSuccess && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 px-3 py-2 bg-green-50 border-2 border-green-200 rounded-xl text-sm text-green-700"
                        >
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Comment posted!</span>
                        </motion.div>
                      )}

                      <Button
                        className="w-full"
                        onClick={submitComment}
                        disabled={commentSubmitting || !commentText.trim()}
                      >
                        {commentSubmitting ? (
                          <span className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                            Posting...
                          </span>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Post Comment
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Existing comments */}
                    {comments.length > 0 && (
                      <div className="space-y-3">
                        {comments.map(comment => (
                          <div key={comment.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-sm text-gray-800">{comment.author}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="mb-3 w-[360px] max-h-[500px] bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] flex flex-col overflow-hidden"
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  <span className="font-bold text-sm">Food AI Assistant</span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">NVIDIA NIM</span>
                </div>
                <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[350px]">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-8">
                    <Bot className="w-8 h-8 mx-auto mb-2 text-orange-300" />
                    <p className="font-medium text-gray-500">Ask me anything about food in Da Nang!</p>
                    <p className="text-xs mt-1">Try: "What's the best pho spot?" or "I want something sweet"</p>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-black text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-xl rounded-bl-sm">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t-2 border-gray-100 p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Ask about food in Da Nang..."
                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={chatLoading || !chatInput.trim()}
                    className="px-3 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChatOpen(prev => !prev)}
          className="w-14 h-14 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full border-2 border-black shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center"
        >
          {chatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-black mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Powered by AI • Updated in real-time</span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Anvago Food Finder • Part of the Anvago Travel Experience
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
