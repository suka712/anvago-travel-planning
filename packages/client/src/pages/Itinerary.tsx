import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, DollarSign, Star, Calendar,
  Share2, Heart, Clock, Play, Pencil, X,
  Bike, Car, Footprints, Loader2
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { ShareModal } from '@/components/modals';
import Header from '@/components/layouts/Header';
import TripMap from '@/components/map/TripMap';
import { itinerariesAPI } from '@/services/api';

// Types based on API response
interface Location {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  rating: number;
  priceLevel: number;
  estimatedDuration: number;
  isLocalGem: boolean;
}

interface ItineraryItem {
  id: string;
  dayNumber: number;
  orderIndex: number;
  startTime: string | null;
  endTime: string | null;
  notes: string | null;
  transportMode: string | null;
  transportDuration: number | null;
  transportCost: number | null;
  location: Location;
}

interface Itinerary {
  id: string;
  title: string;
  description: string | null;
  city: string;
  durationDays: number;
  coverImage: string | null;
  startDate: string | null;
  items: ItineraryItem[];
}

// Helper to format time string
const formatTime = (timeStr: string | null, fallbackMinutes: number): string => {
  if (timeStr) {
    const date = new Date(`2000-01-01T${timeStr}`);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  // Fallback: calculate from minutes
  const hours = Math.floor(fallbackMinutes / 60) % 24;
  const mins = fallbackMinutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
};

// Helper to format duration
const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const formatCost = (priceLevel: number) => {
  if (priceLevel === 0) return 'Free';
  const costs = ['Free', '~50k', '~150k', '~300k', '500k+'];
  return costs[Math.min(priceLevel, 4)] + ' VND';
};

const getTransportIcon = (mode: string | null) => {
  if (mode === 'grab_car' || mode === 'car') return Car;
  if (mode === 'grab_bike' || mode === 'bike') return Bike;
  return Footprints;
};

export default function Itinerary() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);

  // Fetch itinerary from API
  useEffect(() => {
    const fetchItinerary = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await itinerariesAPI.getById(id);
        if (response.data?.data) {
          setItinerary(response.data.data);
        } else {
          setError('Itinerary not found');
        }
      } catch (err: any) {
        console.error('Failed to fetch itinerary:', err);
        setError(err.response?.data?.message || 'Failed to load itinerary');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItinerary();
  }, [id]);

  // Group items by day
  const dayGroups = useMemo(() => {
    if (!itinerary) return [];
    const groups: Record<number, ItineraryItem[]> = {};

    itinerary.items.forEach(item => {
      if (!groups[item.dayNumber]) {
        groups[item.dayNumber] = [];
      }
      groups[item.dayNumber].push(item);
    });

    // Sort items within each day by orderIndex
    Object.keys(groups).forEach(day => {
      groups[parseInt(day)].sort((a, b) => a.orderIndex - b.orderIndex);
    });

    return Object.entries(groups)
      .map(([day, items]) => ({ day: parseInt(day), items }))
      .sort((a, b) => a.day - b.day);
  }, [itinerary]);

  // Calculate map locations from itinerary
  const mapLocations = useMemo(() => {
    if (!itinerary) return [];
    return itinerary.items
      .filter(item => item.location.latitude && item.location.longitude)
      .map(item => ({
        id: item.location.id,
        name: item.location.name,
        lat: item.location.latitude,
        lng: item.location.longitude,
        type: item.location.category,
        isActive: item.location.id === currentLocationId,
      }));
  }, [itinerary, currentLocationId]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!itinerary) return { activities: 0, estimatedCost: 'N/A' };
    const totalPriceLevel = itinerary.items.reduce((acc, item) => acc + item.location.priceLevel, 0);
    const avgPriceLevel = totalPriceLevel / Math.max(itinerary.items.length, 1);
    return {
      activities: itinerary.items.length,
      estimatedCost: formatCost(Math.round(avgPriceLevel * itinerary.items.length)),
    };
  }, [itinerary]);

  // Get active day data
  const activeDayData = dayGroups.find(d => d.day === activeDay);

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: { date: string; day: number; isToday: boolean; isPast: boolean }[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push({ date: '', day: 0, isToday: false, isPast: true });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: d,
        isToday: date.toDateString() === today.toDateString(),
        isPast: date < today && date.toDateString() !== today.toDateString(),
      });
    }

    return days;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Loader2 className="w-10 h-10 text-sky-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading itinerary...</p>
        </main>
      </div>
    );
  }

  // Error or not found state
  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Itinerary Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "This itinerary doesn't exist or you don't have access."}</p>
          <Button onClick={() => navigate('/explore')}>
            Explore Destinations
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 pb-24">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">{itinerary.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {itinerary.city}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {itinerary.durationDays} days
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {totals.estimatedCost}
                </span>
              </div>
              {itinerary.description && (
                <p className="text-sm text-gray-500 mt-2">{itinerary.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`p-2 rounded-full transition-colors ${
                  isSaved ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Map Card */}
          <Card padding="none" className="overflow-hidden">
            <div className="h-64">
              <TripMap
                locations={mapLocations}
                showRoute
                currentLocationId={currentLocationId || undefined}
                onLocationClick={(loc) => setCurrentLocationId(loc.id)}
                className="h-full"
              />
            </div>
          </Card>

          {/* Day Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {dayGroups.map(({ day }) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeDay === day
                    ? 'bg-sky-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Day {day}
              </button>
            ))}
          </div>

          {/* Day Activities */}
          {activeDayData && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold">Day {activeDayData.day}</h2>
                  <p className="text-sm text-gray-600">
                    {activeDayData.items.length} activities
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {activeDayData.items.map((item, idx) => {
                  const TransportIcon = getTransportIcon(item.transportMode);
                  const startMinutes = 360 + idx * 120; // Default: start at 6am, 2h spacing

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      {/* Transport connector */}
                      {idx > 0 && item.transportDuration && (
                        <div className="flex items-center gap-2 py-2 px-4 text-xs text-gray-500">
                          <TransportIcon className="w-3 h-3" />
                          <span>{item.transportDuration} min travel</span>
                          {item.transportCost && (
                            <span>• ~{(item.transportCost / 1000).toFixed(0)}k VND</span>
                          )}
                        </div>
                      )}

                      <Card
                        className={`overflow-hidden cursor-pointer transition-all ${
                          currentLocationId === item.location.id ? 'ring-2 ring-sky-primary' : ''
                        }`}
                        onClick={() => setCurrentLocationId(item.location.id)}
                      >
                        <div className="flex gap-3">
                          {/* Timeline */}
                          <div className="flex flex-col items-center w-14 shrink-0">
                            <span className="font-mono text-xs font-medium text-sky-primary">
                              {formatTime(item.startTime, startMinutes)}
                            </span>
                            <div className="w-2 h-2 rounded-full bg-sky-primary my-1" />
                            <div className="w-0.5 flex-1 bg-sky-primary/30" />
                          </div>

                          {/* Image */}
                          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                            <img
                              src={item.location.imageUrl || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200'}
                              alt={item.location.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 py-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-sm truncate">{item.location.name}</h3>
                              {item.location.isLocalGem && (
                                <Badge variant="warning" className="text-xs shrink-0">
                                  <Star className="w-3 h-3 mr-0.5" />
                                  Local Gem
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {formatDuration(item.location.estimatedDuration)}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <DollarSign className="w-3 h-3" />
                                {formatCost(item.location.priceLevel)}
                              </span>
                              {item.location.rating && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    {item.location.rating.toFixed(1)}
                                  </span>
                                </>
                              )}
                            </div>
                            <Badge variant="ghost" className="text-xs mt-1 capitalize">
                              {item.location.category}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <Card className="bg-gradient-to-br from-sky-primary/10 to-sky-light/10">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-sky-primary">{itinerary.durationDays}</p>
                <p className="text-xs text-gray-600">Days</p>
              </div>
              <div>
                <p className="text-xl font-bold text-sky-primary">{totals.activities}</p>
                <p className="text-xs text-gray-600">Activities</p>
              </div>
              <div>
                <p className="text-xl font-bold text-sky-primary">{totals.estimatedCost}</p>
                <p className="text-xs text-gray-600">Est. Cost</p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 z-30">
        <div className="max-w-7xl mx-auto flex gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/plan/${id}`)}
            leftIcon={<Pencil className="w-4 h-4" />}
            className="flex-1"
          >
            Customize
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowScheduleModal(true)}
            leftIcon={<Calendar className="w-4 h-4" />}
            className="flex-1"
          >
            Schedule
          </Button>
          <Button
            onClick={() => navigate(`/trip/${id}`)}
            rightIcon={<Play className="w-4 h-4" />}
            className="flex-1"
          >
            Start Trip
          </Button>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={itinerary.title}
        description={`${itinerary.durationDays} day trip to ${itinerary.city}`}
        itineraryId={id}
      />

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowScheduleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Schedule Trip</h2>
                    <p className="text-sm text-gray-600">Pick a start date for your trip</p>
                  </div>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Calendar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarDays().map((day, idx) => (
                      <button
                        key={idx}
                        disabled={day.isPast || !day.date}
                        onClick={() => setSelectedDate(day.date)}
                        className={`
                          aspect-square flex items-center justify-center text-sm rounded-lg transition-colors
                          ${!day.date ? 'invisible' : ''}
                          ${day.isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-sky-primary/10'}
                          ${day.isToday ? 'font-bold text-sky-primary' : ''}
                          ${selectedDate === day.date ? 'bg-sky-primary text-white hover:bg-sky-primary' : ''}
                        `}
                      >
                        {day.day || ''}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDate && (
                  <div className="p-3 bg-sky-primary/10 rounded-lg mb-6">
                    <p className="text-sm text-gray-700">
                      Your trip will start on{' '}
                      <span className="font-semibold">
                        {new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {itinerary.durationDays} day trip ending{' '}
                      {new Date(new Date(selectedDate).setDate(
                        new Date(selectedDate).getDate() + itinerary.durationDays - 1
                      )).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      // TODO: Save scheduled date via API
                      setShowScheduleModal(false);
                    }}
                    disabled={!selectedDate}
                    className="flex-1"
                  >
                    Confirm Date
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
