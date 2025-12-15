import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus, Map, Calendar, ChevronRight, Settings,
  Crown, Heart, Sparkles, MapPin, Clock, Play,
  Compass, TrendingUp, Star, Users,
  CheckCircle2, CalendarDays, FileEdit,
  ArrowRight, Zap, Globe, Sun, Camera,
  Utensils, Music
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { PremiumModal } from '@/components/modals';
import { itinerariesAPI } from '@/services/api';

// Trip status types
type TripStatus = 'active' | 'upcoming' | 'planning' | 'completed';

interface Trip {
  id: string;
  name: string;
  destination: string;
  date: string;
  status: TripStatus;
  image: string;
  duration: number;
  stops: number;
  progress?: number;
}

interface ItineraryTemplate {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  city: string;
  durationDays: number;
  highlights: string[];
  targetVibes: string[];
  matchScore?: number;
  rating?: number;
  bookings?: number;
}

// Mock data for demo - will be replaced with API calls
const mockTrips: Trip[] = [
  {
    id: '1',
    name: 'Beach & Culture Explorer',
    destination: 'Danang',
    date: '2024-12-20',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400',
    duration: 3,
    stops: 12,
    progress: 35,
  },
  {
    id: '2',
    name: 'Foodie Paradise Trail',
    destination: 'Danang',
    date: '2024-12-25',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    duration: 2,
    stops: 8,
  },
  {
    id: '3',
    name: 'Hidden Gems Adventure',
    destination: 'Hoi An',
    date: '2025-01-05',
    status: 'planning',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400',
    duration: 4,
    stops: 15,
  },
  {
    id: '4',
    name: 'Sunset Photography Tour',
    destination: 'Danang',
    date: '2024-11-15',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    duration: 2,
    stops: 6,
  },
];

const mockItineraries: ItineraryTemplate[] = [
  {
    id: 'it1',
    name: 'Ultimate Danang Explorer',
    description: 'Experience the best of Danang in 3 action-packed days',
    coverImage: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600',
    city: 'Danang',
    durationDays: 3,
    highlights: ['My Khe Beach', 'Marble Mountains', 'Dragon Bridge', 'Ba Na Hills'],
    targetVibes: ['adventure', 'culture'],
    matchScore: 95,
    rating: 4.9,
    bookings: 2847,
  },
  {
    id: 'it2',
    name: 'Foodie\'s Paradise',
    description: 'A culinary journey through the best local eateries',
    coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
    city: 'Danang',
    durationDays: 2,
    highlights: ['Han Market', 'Mi Quang', 'Banh Xeo', 'Seafood Street'],
    targetVibes: ['foodie', 'local'],
    matchScore: 92,
    rating: 4.8,
    bookings: 1923,
  },
  {
    id: 'it3',
    name: 'Beach & Chill Getaway',
    description: 'Relax and unwind with stunning ocean views',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    city: 'Danang',
    durationDays: 3,
    highlights: ['My Khe Beach', 'Son Tra Peninsula', 'Beachfront Cafes', 'Sunset Spots'],
    targetVibes: ['relaxation', 'beach'],
    matchScore: 88,
    rating: 4.7,
    bookings: 1456,
  },
  {
    id: 'it4',
    name: 'Cultural Heritage Trail',
    description: 'Discover ancient temples and historical landmarks',
    coverImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600',
    city: 'Hoi An',
    durationDays: 4,
    highlights: ['Ancient Town', 'Japanese Bridge', 'Lantern Making', 'Tra Que Village'],
    targetVibes: ['culture', 'history'],
    matchScore: 85,
    rating: 4.9,
    bookings: 3201,
  },
  {
    id: 'it5',
    name: 'Instagram-Worthy Spots',
    description: 'Capture the most photogenic locations',
    coverImage: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600',
    city: 'Danang',
    durationDays: 2,
    highlights: ['Golden Bridge', 'Dragon Bridge', 'Pink Church', 'Lady Buddha'],
    targetVibes: ['photography', 'adventure'],
    matchScore: 90,
    rating: 4.6,
    bookings: 1789,
  },
  {
    id: 'it6',
    name: 'Nightlife & Entertainment',
    description: 'Experience the vibrant night scene',
    coverImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600',
    city: 'Danang',
    durationDays: 2,
    highlights: ['Sky Bars', 'Night Markets', 'Beach Clubs', 'Live Music'],
    targetVibes: ['nightlife', 'social'],
    matchScore: 82,
    rating: 4.5,
    bookings: 987,
  },
];

const tripTabs = [
  { key: 'all' as const, label: 'All Trips', icon: Map },
  { key: 'active' as const, label: 'Active', icon: Play },
  { key: 'upcoming' as const, label: 'Upcoming', icon: CalendarDays },
  { key: 'planning' as const, label: 'Planning', icon: FileEdit },
  { key: 'completed' as const, label: 'Completed', icon: CheckCircle2 },
];

const vibeFilters = [
  { key: 'all', label: 'All', icon: Globe },
  { key: 'adventure', label: 'Adventure', icon: Compass },
  { key: 'foodie', label: 'Foodie', icon: Utensils },
  { key: 'relaxation', label: 'Relaxation', icon: Sun },
  { key: 'culture', label: 'Culture', icon: Music },
  { key: 'photography', label: 'Photography', icon: Camera },
];

const getStatusIcon = (status: TripStatus) => {
  switch (status) {
    case 'active': return Play;
    case 'upcoming': return CalendarDays;
    case 'planning': return FileEdit;
    case 'completed': return CheckCircle2;
  }
};

const getStatusColor = (status: TripStatus) => {
  switch (status) {
    case 'active': return 'bg-sky-primary';
    case 'upcoming': return 'bg-cyan-400';
    case 'planning': return 'bg-blue-400';
    case 'completed': return 'bg-teal-300';
  }
};

const getStatusBadge = (status: TripStatus) => {
  switch (status) {
    case 'active': return 'success';
    case 'upcoming': return 'primary';
    case 'planning': return 'warning';
    case 'completed': return 'secondary';
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { favorites, toggleFavorite, isFavorite } = useFavoritesStore();
  const [activeTab, setActiveTab] = useState<'all' | TripStatus>('all');
  const [vibeFilter, setVibeFilter] = useState('all');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [trips] = useState<Trip[]>(mockTrips);
  const [itineraries, setItineraries] = useState<ItineraryTemplate[]>(mockItineraries);

  // Fetch itineraries on mount
  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const response = await itinerariesAPI.getTemplates('Danang');
        if (response.data?.data?.length > 0) {
          setItineraries(response.data.data);
        }
      } catch {
        // Fall back to mock data
      }
    };
    fetchItineraries();
  }, []);

  const filteredTrips = trips.filter(trip =>
    activeTab === 'all' || trip.status === activeTab
  );

  const filteredItineraries = itineraries.filter(it =>
    vibeFilter === 'all' || it.targetVibes.includes(vibeFilter)
  );

  const handleToggleFavorite = (itinerary: ItineraryTemplate) => {
    const wasFavorite = isFavorite(itinerary.id);
    toggleFavorite({
      id: itinerary.id,
      name: itinerary.name,
      description: itinerary.description,
      destination: itinerary.city,
      duration: itinerary.durationDays,
      estimatedCost: 0,
      image: itinerary.coverImage,
      highlights: itinerary.highlights,
    });
    toast(wasFavorite ? 'Removed from favorites' : 'Added to favorites!', {
      icon: wasFavorite ? '💔' : '❤️',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-14 h-14 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center text-white text-2xl font-bold"
              >
                {user?.name?.charAt(0) || 'U'}
              </motion.div>
              <div>
                <h1 className="text-xl font-bold">
                  Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}!
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{user?.email}</span>
                  {user?.isPremium && (
                    <Badge variant="warning" className="text-[10px] px-1.5 py-0.5">
                      <Crown className="w-3 h-3 mr-0.5" />
                      Premium
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              leftIcon={<Settings className="w-4 h-4" />}
            >
              Settings
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Quick Actions */}
        <section>
          <div className="grid md:grid-cols-3 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                hoverable
                className="bg-linear-to-br from-sky-400 to-blue-500 text-white cursor-pointer h-full"
                onClick={() => navigate('/discover')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Plus className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Plan New Trip</h3>
                    <p className="text-sm text-white/80">Start a new adventure</p>
                  </div>
                  <ChevronRight className="w-5 h-5 ml-auto opacity-60" />
                </div>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card hoverable className="cursor-pointer h-full" onClick={() => navigate('/discover')}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center border-2 border-black">
                    <Sparkles className="w-7 h-7 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">AI Recommendations</h3>
                    <p className="text-sm text-gray-600">Personalized for you</p>
                  </div>
                  <ChevronRight className="w-5 h-5 ml-auto text-gray-400" />
                </div>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card hoverable className="cursor-pointer h-full" onClick={() => setShowPremiumModal(true)}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center border-2 border-black">
                    <Zap className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">Go Premium</h3>
                    <p className="text-sm text-gray-600">Unlock all features</p>
                  </div>
                  <ChevronRight className="w-5 h-5 ml-auto text-gray-400" />
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* My Trips Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black">My Trips</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/trips')}>
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Trip Tabs */}
          <Card className="p-1.5 mb-4">
            <div className="flex gap-1 overflow-auto">
              {tripTabs.map((tab) => {
                const count = tab.key === 'all'
                  ? trips.length
                  : trips.filter(t => t.status === tab.key).length;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'bg-sky-primary text-black shadow-[2px_2px_0px_#000] border-2 border-black'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                      activeTab === tab.key ? 'bg-black/10' : 'bg-gray-200'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Trip Cards */}
          <AnimatePresence mode="wait">
            {filteredTrips.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="text-center py-12">
                  <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    {activeTab === 'all' ? 'No trips yet' : `No ${activeTab} trips`}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {activeTab === 'all'
                      ? 'Start planning your first adventure!'
                      : `You don't have any ${activeTab} trips at the moment.`
                    }
                  </p>
                  <Button onClick={() => navigate('/discover')}>
                    Plan Your First Trip
                  </Button>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid md:grid-cols-2 gap-4"
              >
                {filteredTrips.map((trip, idx) => {
                  const StatusIcon = getStatusIcon(trip.status);
                  return (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card
                        hoverable
                        padding="none"
                        className="overflow-hidden cursor-pointer group"
                        onClick={() => navigate(
                          trip.status === 'active' || trip.status === 'upcoming'
                            ? `/trip/${trip.id}`
                            : `/itinerary/${trip.id}`
                        )}
                      >
                        <div className="flex">
                          <div className="w-32 h-32 shrink-0 relative overflow-hidden">
                            <img
                              src={trip.image}
                              alt={trip.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className={`absolute top-2 left-2 w-8 h-8 ${getStatusColor(trip.status)} rounded-lg flex items-center justify-center`}>
                              <StatusIcon className="w-4 h-4 text-white" />
                            </div>
                            {trip.progress !== undefined && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                                <div
                                  className="h-full bg-sky-500 transition-all"
                                  style={{ width: `${trip.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant={getStatusBadge(trip.status) as any} className="text-[10px]">
                                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                                </Badge>
                                {trip.progress !== undefined && (
                                  <span className="text-xs text-gray-500">{trip.progress}% done</span>
                                )}
                              </div>
                              <h3 className="font-bold text-lg line-clamp-1">{trip.name}</h3>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {trip.destination}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(trip.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {trip.duration}d
                              </span>
                              <span>{trip.stops} stops</span>
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center pr-4">
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Recommended Itineraries Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-black">Discover Itineraries</h2>
              <p className="text-gray-600 text-sm">Curated trips handpicked for you</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/discover')}>
              Browse All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Vibe Filters */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {vibeFilters.map((vibe) => (
              <motion.button
                key={vibe.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVibeFilter(vibe.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  vibeFilter === vibe.key
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                <vibe.icon className="w-4 h-4" />
                {vibe.label}
              </motion.button>
            ))}
          </div>

          {/* Itinerary Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItineraries.slice(0, 6).map((itinerary, idx) => (
              <motion.div
                key={itinerary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  hoverable
                  padding="none"
                  className="overflow-hidden group"
                >
                  <div
                    className="relative h-40 cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/itinerary/${itinerary.id}`)}
                  >
                    <img
                      src={itinerary.coverImage}
                      alt={itinerary.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Match Score Badge */}
                    {itinerary.matchScore && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="success" className="backdrop-blur-sm">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {itinerary.matchScore}% Match
                        </Badge>
                      </div>
                    )}

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(itinerary);
                      }}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
                        isFavorite(itinerary.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-gray-600 hover:bg-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite(itinerary.id) ? 'fill-white' : ''}`} />
                    </button>

                    {/* Duration & City */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <span className="text-sm font-medium">{itinerary.city}</span>
                      <span className="text-sm bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {itinerary.durationDays} days
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3
                      className="font-bold text-lg mb-1 line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => navigate(`/itinerary/${itinerary.id}`)}
                    >
                      {itinerary.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {itinerary.description}
                    </p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {itinerary.highlights.slice(0, 3).map((highlight, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
                        >
                          {highlight}
                        </span>
                      ))}
                      {itinerary.highlights.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                          +{itinerary.highlights.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                      {itinerary.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {itinerary.rating}
                        </span>
                      )}
                      {itinerary.bookings && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {itinerary.bookings.toLocaleString()} trips
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto"
                        onClick={() => navigate(`/itinerary/${itinerary.id}`)}
                      >
                        View <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* View More CTA */}
          {filteredItineraries.length > 6 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-6"
            >
              <Button
                variant="secondary"
                onClick={() => navigate('/discover')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Explore {filteredItineraries.length - 6} More Itineraries
              </Button>
            </motion.div>
          )}
        </section>

        {/* Saved Itineraries Quick Access */}
        {favorites.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <h2 className="text-xl font-bold">Saved Itineraries</h2>
                <Badge variant="secondary" className="text-xs">{favorites.length}</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/favorites')}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
              {favorites.slice(0, 4).map((fav, idx) => (
                <motion.div
                  key={fav.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex-shrink-0 w-64"
                >
                  <Card
                    hoverable
                    padding="none"
                    className="overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/itinerary/${fav.id}`)}
                  >
                    <div className="relative h-32">
                      <img
                        src={fav.image}
                        alt={fav.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-sm line-clamp-1">{fav.name}</h4>
                      <p className="text-xs text-gray-500">{fav.destination} • {fav.duration} days</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Premium Upsell */}
        {!user?.isPremium && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-black shadow-[4px_4px_0px_#000]">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-xl mb-1">Unlock Premium Features</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Get AI-powered optimization, exclusive local gems, smart weather adaptation, and unlimited trip planning!
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['AI Optimizer', 'Local Secrets', 'Weather Smart', 'Priority Support'].map((feature) => (
                      <span
                        key={feature}
                        className="text-xs px-2 py-1 bg-white/80 rounded-full border border-purple-200"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  className="flex-shrink-0"
                  onClick={() => setShowPremiumModal(true)}
                >
                  Upgrade Now
                </Button>
              </div>
            </Card>
          </motion.section>
        )}
      </main>

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
}
