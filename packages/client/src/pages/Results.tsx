import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Sparkles, Map, Clock, DollarSign, Cloud, Sun, CloudRain,
  MapPin, Star, Calendar, Heart, Share2, Link2, Twitter, Facebook,
  Lock, User, LayoutGrid, Check, ArrowRight, X, ChevronRight,
  Shuffle, TrendingUp
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import Header from '@/components/layouts/Header';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { itinerariesAPI } from '@/services/api';

// Mock generated itineraries
const mockItineraries = [
  {
    id: '1',
    name: 'Beach & Culture Explorer',
    description: 'Perfect blend of relaxation and discovery',
    matchScore: 95,
    duration: 3,
    estimatedCost: 2500000,
    highlights: ['My Khe Beach', 'Marble Mountains', 'Han Market'],
    tags: ['beach', 'culture', 'food'],
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600',
    days: [
      {
        day: 1,
        title: 'Beach Vibes & Local Flavors',
        activities: [
          { time: '7:00', name: 'Sunrise at My Khe Beach', type: 'beach', duration: '2h' },
          { time: '9:30', name: 'Breakfast at Bánh Mì Bà Lan', type: 'food', duration: '1h' },
          { time: '11:00', name: 'Explore Han Market', type: 'shopping', duration: '2h' },
          { time: '14:00', name: 'Lunch at Madame Lan', type: 'food', duration: '1.5h' },
          { time: '16:00', name: 'Relax at Beach Club', type: 'beach', duration: '3h' },
          { time: '19:30', name: 'Seafood dinner at Bé Mặn', type: 'food', duration: '2h' },
        ],
      },
      {
        day: 2,
        title: 'Mountains & Mysticism',
        activities: [
          { time: '6:00', name: 'Marble Mountains sunrise', type: 'nature', duration: '4h' },
          { time: '11:00', name: 'Brunch at The Fig', type: 'food', duration: '1.5h' },
          { time: '13:00', name: 'Non Nuoc Stone Village', type: 'culture', duration: '2h' },
          { time: '15:30', name: 'Cham Museum', type: 'museum', duration: '2h' },
          { time: '18:00', name: 'Dragon Bridge show', type: 'attraction', duration: '1h' },
          { time: '20:00', name: 'Rooftop bar sunset', type: 'nightlife', duration: '2h' },
        ],
      },
      {
        day: 3,
        title: 'Peninsula Adventure',
        activities: [
          { time: '5:30', name: 'Son Tra Peninsula drive', type: 'nature', duration: '3h' },
          { time: '9:00', name: 'Linh Ung Pagoda', type: 'temple', duration: '1.5h' },
          { time: '11:00', name: 'Brunch at Bảo Ngư', type: 'food', duration: '1.5h' },
          { time: '13:00', name: 'Free time / Shopping', type: 'leisure', duration: '3h' },
          { time: '16:30', name: 'Coffee at 43 Factory', type: 'cafe', duration: '1.5h' },
          { time: '18:30', name: 'Farewell dinner', type: 'food', duration: '2h' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Foodie Paradise Trail',
    description: 'A culinary journey through Danang',
    matchScore: 88,
    duration: 3,
    estimatedCost: 2200000,
    highlights: ['Street Food Tour', 'Cooking Class', 'Night Markets'],
    tags: ['food', 'local', 'culture'],
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
    days: [],
  },
  {
    id: '3',
    name: 'Adventure Seeker\'s Dream',
    description: 'Action-packed exploration',
    matchScore: 82,
    duration: 3,
    estimatedCost: 3500000,
    highlights: ['Ba Na Hills', 'Water Sports', 'Jungle Trek'],
    tags: ['adventure', 'nature', 'photography'],
    image: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=600',
    days: [],
  },
];

type ItineraryDisplay = typeof mockItineraries[0] & { matchScore?: number };
type ViewMode = 'suggested' | 'all';

// Weather icon mapper
const getWeatherIcon = (condition: string) => {
  if (condition.toLowerCase().includes('rain')) return CloudRain;
  if (condition.toLowerCase().includes('sun') || condition.toLowerCase().includes('clear')) return Sun;
  return Cloud;
};

export default function Results() {
  const navigate = useNavigate();
  const { answers, reset } = useOnboardingStore();
  const { isAuthenticated } = useAuthStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItinerary, setSelectedItinerary] = useState<ItineraryDisplay | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [suggestedItineraries, setSuggestedItineraries] = useState<ItineraryDisplay[]>([]);
  const [allItineraries, setAllItineraries] = useState<ItineraryDisplay[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('suggested');
  const [_error, setError] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number>(1);
  const [isRerolling, setIsRerolling] = useState(false);

  // Weather data
  const weather = {
    condition: 'Partly Cloudy',
    temp: 28,
  };
  const WeatherIcon = getWeatherIcon(weather.condition);

  // Map API template to display format
  const mapTemplateToDisplay = (template: any, idx: number): ItineraryDisplay => ({
    id: template.itinerary?.id || template.id || `template-${idx}`,
    name: template.name || template.itinerary?.title || 'Untitled',
    description: template.tagline || template.description || template.itinerary?.description || '',
    matchScore: template.matchScore || 0,
    duration: template.durationDays || template.itinerary?.durationDays || 3,
    estimatedCost: template.itinerary?.estimatedBudget || 2500000,
    highlights: template.highlights || [],
    tags: template.badges || [],
    image: template.coverImage || template.itinerary?.coverImage || mockItineraries[idx % mockItineraries.length].image,
    days: template.itinerary?.items?.reduce((acc: any[], item: any) => {
      const dayIdx = (item.dayNumber || 1) - 1;
      if (!acc[dayIdx]) {
        acc[dayIdx] = {
          day: item.dayNumber || 1,
          title: `Day ${item.dayNumber || 1}`,
          activities: [],
        };
      }
      acc[dayIdx].activities.push({
        time: item.startTime || '09:00',
        name: item.location?.name || 'Activity',
        type: item.location?.category || 'activity',
        duration: item.location?.avgDurationMins ? `${item.location.avgDurationMins}min` : '1h',
      });
      return acc;
    }, []) || [],
  });

  useEffect(() => {
    const fetchItineraries = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const city = answers.destination || 'Danang';
        const [suggestedRes, allRes] = await Promise.all([
          itinerariesAPI.getSuggestedTemplates({
            city,
            personas: answers.personas || [],
            vibes: answers.vibesLiked || [],
            budget: answers.budgetLevel,
            interests: answers.interests || [],
            duration: answers.duration,
          }),
          itinerariesAPI.getTemplates(city),
        ]);

        const suggestedTemplates = suggestedRes.data.data || [];
        const allTemplates = allRes.data.data || [];

        if (suggestedTemplates.length > 0) {
          const mappedSuggested = suggestedTemplates.map(mapTemplateToDisplay);
          setSuggestedItineraries(mappedSuggested);
          setSelectedItinerary(mappedSuggested[0]);
        } else {
          setSuggestedItineraries(mockItineraries);
          setSelectedItinerary(mockItineraries[0]);
        }

        if (allTemplates.length > 0) {
          const mappedAll = allTemplates.map(mapTemplateToDisplay);
          setAllItineraries(mappedAll);
        } else {
          setAllItineraries(mockItineraries);
        }
      } catch (err) {
        console.error('Failed to fetch itineraries:', err);
        setSuggestedItineraries(mockItineraries);
        setAllItineraries(mockItineraries);
        setSelectedItinerary(mockItineraries[0]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItineraries();
  }, [answers]);

  const displayedItineraries = viewMode === 'suggested' ? suggestedItineraries : allItineraries;

  const handleReroll = async () => {
    setIsRerolling(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    reset();
    navigate('/discover');
  };

  const handleAction = (action: 'customize' | 'schedule' | 'go') => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (action === 'customize') {
      navigate(`/plan/${selectedItinerary?.id}`);
    } else if (action === 'schedule') {
      navigate(`/itinerary/${selectedItinerary?.id}?schedule=true`);
    } else {
      navigate(`/trip/${selectedItinerary?.id}`);
    }
  };

  const handleToggleFavorite = () => {
    if (!selectedItinerary) return;

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    const added = toggleFavorite({
      id: selectedItinerary.id,
      name: selectedItinerary.name,
      description: selectedItinerary.description,
      destination: answers.destination || 'Danang',
      duration: selectedItinerary.duration,
      estimatedCost: selectedItinerary.estimatedCost,
      image: selectedItinerary.image,
      highlights: selectedItinerary.highlights,
    });

    if (added) {
      toast.success('Added to favorites!');
    } else {
      toast('Removed from favorites', { icon: '💔' });
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/itinerary/${selectedItinerary?.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
    setShowShareModal(false);
  };

  const handleShareTwitter = () => {
    const text = `Check out this amazing ${selectedItinerary?.name} itinerary on Anvago!`;
    const url = `${window.location.origin}/itinerary/${selectedItinerary?.id}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    setShowShareModal(false);
  };

  const handleShareFacebook = () => {
    const url = `${window.location.origin}/itinerary/${selectedItinerary?.id}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    setShowShareModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <Card className="py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-6"
            >
              <Sparkles className="w-full h-full text-sky-primary" />
            </motion.div>
            <h2 className="text-xl font-bold mb-2">Creating Your Perfect Trip</h2>
            <p className="text-gray-600 text-sm mb-6">Analyzing preferences & local insights</p>

            <div className="space-y-2 text-left">
              {['Finding best locations', 'Checking weather patterns', 'Optimizing routes', 'Adding local gems'].map((text, idx) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.4 }}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <Check className="w-4 h-4 text-green-500" />
                  {text}
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Trip Context Card - Destination, Weather & Reroll */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left: Destination & Trip Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-primary rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{answers.destination || 'Danang'}</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{answers.duration || 3} days</span>
                    <span>•</span>
                    <span className="capitalize">{answers.activityLevel || 'balanced'} pace</span>
                    <span>•</span>
                    <span className="capitalize">{answers.budgetLevel || 'mid-range'}</span>
                  </div>
                </div>
              </div>

              {/* Center: Weather */}
              <div className="flex items-center gap-3 px-4 py-2 bg-sky-primary/10 rounded-lg">
                <WeatherIcon className="w-5 h-5 text-sky-dark" />
                <div className="text-sm">
                  <span className="font-bold">{weather.temp}°C</span>
                  <span className="text-gray-600 ml-2">{weather.condition}</span>
                </div>
                <Badge variant="success" className="text-xs ml-2">
                  Great for outdoors
                </Badge>
              </div>

              {/* Right: Reroll Button */}
              <Button
                variant="secondary"
                onClick={handleReroll}
                disabled={isRerolling}
                leftIcon={
                  <motion.div
                    animate={isRerolling ? { rotate: 360 } : {}}
                    transition={{ duration: 0.5, repeat: isRerolling ? Infinity : 0 }}
                  >
                    <Shuffle className="w-4 h-4" />
                  </motion.div>
                }
              >
                {isRerolling ? 'Rerolling...' : 'Reroll'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-primary" />
            {viewMode === 'suggested' ? 'Recommended for You' : 'All Itineraries'}
          </h2>
          <span className="text-sm text-gray-500">
            {displayedItineraries.length} {displayedItineraries.length === 1 ? 'trip' : 'trips'}
          </span>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Column - Itinerary List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tabs */}
            <Card className="p-1.5">
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setViewMode('suggested');
                    if (suggestedItineraries.length > 0) {
                      setSelectedItinerary(suggestedItineraries[0]);
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'suggested'
                      ? 'bg-sky-primary text-black shadow-[2px_2px_0px_#000] border-2 border-black'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  For You
                </button>
                <button
                  onClick={() => {
                    setViewMode('all');
                    if (allItineraries.length > 0) {
                      setSelectedItinerary(allItineraries[0]);
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'all'
                      ? 'bg-sky-primary text-black shadow-[2px_2px_0px_#000] border-2 border-black'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  All Trips
                </button>
              </div>
            </Card>

            {/* Itinerary Cards */}
            <div className="space-y-3">
              {displayedItineraries.map((itinerary, idx) => (
                <motion.div
                  key={itinerary.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    hoverable
                    padding="none"
                    className={`cursor-pointer overflow-hidden transition-all ${
                      selectedItinerary?.id === itinerary.id
                        ? 'ring-2 ring-sky-primary ring-offset-2'
                        : ''
                    }`}
                    onClick={() => setSelectedItinerary(itinerary)}
                  >
                    <div className="flex">
                      {/* Thumbnail */}
                      <div className="relative w-28 h-28 shrink-0 overflow-hidden">
                        <img
                          src={itinerary.image}
                          alt={itinerary.name}
                          className="w-full h-full object-cover"
                        />
                        {viewMode === 'suggested' && itinerary.matchScore !== undefined && itinerary.matchScore > 0 && (
                          <div className="absolute top-2 left-2">
                            <Badge
                              variant={itinerary.matchScore >= 90 ? 'success' : 'primary'}
                              className="text-[10px] px-1.5 py-0.5"
                            >
                              <TrendingUp className="w-3 h-3 mr-0.5" />
                              {itinerary.matchScore}%
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-3 min-w-0">
                        <h3 className="font-bold text-sm truncate mb-1">{itinerary.name}</h3>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {itinerary.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {itinerary.duration}d
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {(itinerary.estimatedCost / 1000000).toFixed(1)}M
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {itinerary.days.reduce((sum, d) => sum + d.activities.length, 0)} stops
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center pr-2">
                        <ChevronRight className={`w-4 h-4 transition-colors ${
                          selectedItinerary?.id === itinerary.id ? 'text-sky-primary' : 'text-gray-300'
                        }`} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column - Detail View */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <AnimatePresence mode="wait">
                {selectedItinerary && (
                  <motion.div
                    key={selectedItinerary.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="overflow-hidden">
                      {/* Hero Image */}
                      <div className="relative h-44 -m-5 mb-4">
                        <img
                          src={selectedItinerary.image}
                          alt={selectedItinerary.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Actions */}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button
                            onClick={handleToggleFavorite}
                            className={`p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${
                              isFavorite(selectedItinerary.id)
                                ? 'bg-red-500 text-white'
                                : 'bg-white text-gray-700'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isFavorite(selectedItinerary.id) ? 'fill-white' : ''}`} />
                          </button>
                          <button
                            onClick={() => setShowShareModal(true)}
                            className="p-2 bg-white rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          >
                            <Share2 className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>

                        {/* Title */}
                        <div className="absolute bottom-3 left-5 right-5 text-white">
                          <div className="flex items-end justify-between gap-3">
                            <div>
                              <h2 className="text-xl font-bold mb-0.5">{selectedItinerary.name}</h2>
                              <p className="text-sm text-white/80">{selectedItinerary.description}</p>
                            </div>
                            {viewMode === 'suggested' && selectedItinerary.matchScore !== undefined && selectedItinerary.matchScore > 0 && (
                              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full shrink-0">
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                <span className="font-bold text-xs">{selectedItinerary.matchScore}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Clock className="w-4 h-4 text-sky-primary" />
                          <span className="font-medium">{selectedItinerary.duration} days</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <DollarSign className="w-4 h-4 text-sky-primary" />
                          <span className="font-medium">{(selectedItinerary.estimatedCost / 1000000).toFixed(1)}M VND</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MapPin className="w-4 h-4 text-sky-primary" />
                          <span className="font-medium">{selectedItinerary.days.reduce((sum, d) => sum + d.activities.length, 0)} stops</span>
                        </div>
                      </div>

                      {/* Highlights */}
                      {selectedItinerary.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {selectedItinerary.highlights.map(h => (
                            <Badge key={h} variant="secondary" className="text-xs">
                              {h}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Day Tabs & Activities */}
                      {selectedItinerary.days.length > 0 && (
                        <>
                          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                            {selectedItinerary.days.map((day) => (
                              <button
                                key={day.day}
                                onClick={() => setExpandedDay(day.day)}
                                className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                  expandedDay === day.day
                                    ? 'bg-sky-primary text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                                }`}
                              >
                                Day {day.day}
                              </button>
                            ))}
                          </div>

                          <AnimatePresence mode="wait">
                            {selectedItinerary.days.filter(d => d.day === expandedDay).map((day) => (
                              <motion.div
                                key={day.day}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-4"
                              >
                                <p className="text-sm font-medium text-gray-500 mb-2">{day.title}</p>
                                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                  {day.activities.map((activity, idx) => (
                                    <motion.div
                                      key={idx}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.03 }}
                                      className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                      <span className="font-mono text-xs text-gray-500 w-10">{activity.time}</span>
                                      <div className="w-2 h-2 rounded-full bg-sky-primary shrink-0" />
                                      <span className="flex-1 text-sm truncate">{activity.name}</span>
                                      <span className="text-xs text-gray-400">{activity.duration}</span>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </>
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                        <Button
                          variant="secondary"
                          onClick={() => handleAction('customize')}
                          className="flex-col h-auto py-3"
                        >
                          <Map className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">Customize</span>
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleAction('schedule')}
                          className="flex-col h-auto py-3"
                        >
                          <Calendar className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">Schedule</span>
                        </Button>
                        <Button
                          onClick={() => handleAction('go')}
                          className="flex-col h-auto py-3"
                        >
                          <ArrowRight className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">Start Trip</span>
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Login Prompt Modal */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLoginPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <Card className="max-w-sm text-center">
                <div className="w-16 h-16 bg-sky-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-sky-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">Sign in to Continue</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Create a free account to save your itinerary and start your adventure.
                </p>
                <div className="space-y-3">
                  <Button fullWidth onClick={() => navigate('/login', { state: { from: '/results' } })}>
                    Sign In
                  </Button>
                  <Button variant="secondary" fullWidth onClick={() => navigate('/register', { state: { from: '/results' } })}>
                    Create Free Account
                  </Button>
                </div>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                >
                  Continue browsing
                </button>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && selectedItinerary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <Card className="w-full max-w-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Share Itinerary</h2>
                  <button onClick={() => setShowShareModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                  <img src={selectedItinerary.image} alt={selectedItinerary.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{selectedItinerary.name}</p>
                    <p className="text-xs text-gray-500">{selectedItinerary.duration} days • {answers.destination || 'Danang'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-sky-primary hover:bg-sky-primary/5 transition-all"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Link2 className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Copy Link</p>
                      <p className="text-xs text-gray-500">Share via any app</p>
                    </div>
                  </button>

                  <button
                    onClick={handleShareTwitter}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-sky-primary hover:bg-sky-primary/5 transition-all"
                  >
                    <div className="w-10 h-10 bg-[#1DA1F2]/10 rounded-lg flex items-center justify-center">
                      <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Twitter / X</p>
                      <p className="text-xs text-gray-500">Share with followers</p>
                    </div>
                  </button>

                  <button
                    onClick={handleShareFacebook}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-sky-primary hover:bg-sky-primary/5 transition-all"
                  >
                    <div className="w-10 h-10 bg-[#1877F2]/10 rounded-lg flex items-center justify-center">
                      <Facebook className="w-5 h-5 text-[#1877F2]" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Facebook</p>
                      <p className="text-xs text-gray-500">Share with friends</p>
                    </div>
                  </button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
