import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, RefreshCw, Map, Clock, DollarSign, Cloud,
  ChevronRight, MapPin, Star, Calendar, Bike, Car, Footprints,
  Lock, Grid, User
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
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

const weatherForecast = {
  condition: 'Partly Cloudy',
  temp: 28,
  icon: Cloud,
  advisory: 'Great weather for outdoor activities! Pack light layers for evening.',
};

const transportOptions = [
  { id: 'grab_bike', name: 'Grab Bike', icon: Bike, avgCost: '15k-50k VND', recommended: true },
  { id: 'grab_car', name: 'Grab Car', icon: Car, avgCost: '50k-150k VND' },
  { id: 'walk', name: 'Walking', icon: Footprints, avgCost: 'Free' },
];

type ItineraryDisplay = typeof mockItineraries[0] & { matchScore?: number };
type ViewMode = 'suggested' | 'all';

export default function Results() {
  const navigate = useNavigate();
  const { answers, reset } = useOnboardingStore();
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItinerary, setSelectedItinerary] = useState<ItineraryDisplay | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [suggestedItineraries, setSuggestedItineraries] = useState<ItineraryDisplay[]>([]);
  const [allItineraries, setAllItineraries] = useState<ItineraryDisplay[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('suggested');
  const [_error, setError] = useState<string | null>(null);

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
        // Fetch both suggested and all templates in parallel
        const city = answers.destination || 'Danang';
        console.log('Fetching itineraries for city:', city, 'with preferences:', {
          personas: answers.personas,
          vibes: answers.vibesLiked,
          budget: answers.budgetLevel,
        });

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

        console.log('Fetched templates:', {
          suggested: suggestedTemplates.length,
          all: allTemplates.length,
        });

        if (suggestedTemplates.length > 0) {
          const mappedSuggested = suggestedTemplates.map(mapTemplateToDisplay);
          setSuggestedItineraries(mappedSuggested);
          setSelectedItinerary(mappedSuggested[0]);
        } else {
          console.log('No suggested templates, using mock data');
          setSuggestedItineraries(mockItineraries);
          setSelectedItinerary(mockItineraries[0]);
        }

        if (allTemplates.length > 0) {
          const mappedAll = allTemplates.map(mapTemplateToDisplay);
          setAllItineraries(mappedAll);
        } else {
          console.log('No templates, using mock data');
          setAllItineraries(mockItineraries);
        }
      } catch (err) {
        console.error('Failed to fetch itineraries:', err);
        // Fallback to mock data on error
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

  const handleReroll = () => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 mx-auto mb-6"
          >
            <Sparkles className="w-full h-full text-[#4FC3F7]" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Creating Your Perfect Trip...</h2>
          <p className="text-gray-600">Analyzing your preferences and local insights</p>
          
          <motion.div className="mt-8 space-y-2">
            {['Finding best locations...', 'Checking weather patterns...', 'Optimizing routes...', 'Adding local gems...'].map((text, idx) => (
              <motion.p
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.5 }}
                className="text-sm text-gray-500"
              >
                ✓ {text}
              </motion.p>
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Your Trip to {answers.destination || 'Danang'}</h1>
            <p className="text-sm text-gray-600">{answers.duration || 3} days • {answers.activityLevel || 'balanced'} pace</p>
          </div>
          <Button variant="ghost" onClick={handleReroll} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Reroll
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Weather & Context Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <weatherForecast.icon className="w-8 h-8 text-[#4FC3F7]" />
                <div>
                  <p className="font-bold">{weatherForecast.temp}°C</p>
                  <p className="text-sm text-gray-600">{weatherForecast.condition}</p>
                </div>
              </div>
              <div className="text-sm text-gray-600 border-l pl-4">
                <p>{weatherForecast.advisory}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Recommended transport:</span>
              {transportOptions.filter(t => t.recommended).map(t => (
                <Badge key={t.id} variant="success">
                  <t.icon className="w-3 h-3 mr-1" />
                  {t.name}
                </Badge>
              ))}
            </div>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Itinerary Options */}
          <div className="lg:col-span-1 space-y-4">
            {/* View Mode Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => {
                  setViewMode('suggested');
                  if (suggestedItineraries.length > 0) {
                    setSelectedItinerary(suggestedItineraries[0]);
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'suggested'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
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
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4" />
                All Trips
              </button>
            </div>

            <h2 className="font-bold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#4FC3F7]" />
              {viewMode === 'suggested' ? 'Recommended for You' : 'All Available Trips'}
              <span className="text-sm font-normal text-gray-500">
                ({displayedItineraries.length})
              </span>
            </h2>

            {displayedItineraries.map((itinerary, idx) => (
              <motion.div
                key={itinerary.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  hoverable
                  padding="none"
                  className={`cursor-pointer overflow-hidden ${
                    selectedItinerary?.id === itinerary.id ? 'bg-[#4FC3F7]/5' : ''
                  }`}
                  onClick={() => setSelectedItinerary(itinerary)}
                >
                  <div className="relative h-32">
                    <img src={itinerary.image} alt={itinerary.name} className="w-full h-full object-cover" />
                    {viewMode === 'suggested' && itinerary.matchScore !== undefined && itinerary.matchScore > 0 && (
                      <div className="absolute top-2 right-2">
                        <Badge variant={itinerary.matchScore >= 90 ? 'success' : 'primary'}>
                          {itinerary.matchScore}% match
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold">{itinerary.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{itinerary.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {itinerary.duration} days
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {(itinerary.estimatedCost / 1000000).toFixed(1)}M VND
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Selected Itinerary Detail */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedItinerary && (
                <motion.div
                  key={selectedItinerary.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">{selectedItinerary.name}</h2>
                        <p className="text-gray-600">{selectedItinerary.description}</p>
                      </div>
                      {viewMode === 'suggested' && selectedItinerary.matchScore !== undefined && selectedItinerary.matchScore > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold">{selectedItinerary.matchScore}% match</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedItinerary.highlights.map(h => (
                        <Badge key={h} variant="secondary">{h}</Badge>
                      ))}
                    </div>

                    {/* Day by Day */}
                    <div className="space-y-6">
                      {selectedItinerary.days.map((day) => (
                        <div key={day.day} className="border-l-4 border-[#4FC3F7] pl-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-8 h-8 bg-[#4FC3F7] text-white rounded-full flex items-center justify-center font-bold">
                              {day.day}
                            </span>
                            <h3 className="font-bold text-lg">{day.title}</h3>
                          </div>
                          
                          <div className="space-y-2">
                            {day.activities.map((activity, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <span className="text-sm font-mono text-gray-500 w-12">{activity.time}</span>
                                <MapPin className="w-4 h-4 text-[#4FC3F7]" />
                                <span className="flex-1">{activity.name}</span>
                                <Badge variant="ghost" className="text-xs">{activity.duration}</Badge>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => handleAction('customize')}
                      className="flex-col h-auto py-4"
                    >
                      <Map className="w-6 h-6 mb-1" />
                      <span>Customize</span>
                      <span className="text-xs text-gray-500">Edit locations</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => handleAction('schedule')}
                      className="flex-col h-auto py-4"
                    >
                      <Calendar className="w-6 h-6 mb-1" />
                      <span>Schedule</span>
                      <span className="text-xs text-gray-500">Pick dates</span>
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => handleAction('go')}
                      className="flex-col h-auto py-4"
                    >
                      <ChevronRight className="w-6 h-6 mb-1" />
                      <span>Go Now</span>
                      <span className="text-xs opacity-80">Start adventure</span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <Card className="max-w-md text-center bg-white">
                <Lock className="w-16 h-16 text-[#4FC3F7] mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Sign in to Continue</h2>
                <p className="text-gray-600 mb-6">
                  Create a free account to save your itinerary, customize your trip, and access more features.
                </p>
                <div className="space-y-3">
                  <Button 
                    fullWidth 
                    onClick={() => navigate('/login', { state: { from: '/results' } })}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="secondary" 
                    fullWidth
                    onClick={() => navigate('/register', { state: { from: '/results' } })}
                  >
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
    </div>
  );
}

