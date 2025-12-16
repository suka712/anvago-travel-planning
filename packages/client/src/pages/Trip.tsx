import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Navigation, MapPin, Clock, ChevronRight, CheckCircle2, Circle,
  CloudRain, Bike, Car, Footprints, Map, Maximize2, Minimize2,
  X, Play, Pause, SkipForward, RefreshCw, Coffee, ChevronDown,
  Sunrise, PartyPopper, Loader2, Sparkles
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import Header from '@/components/layouts/Header';
import { useTripProgressStore, TripStop } from '@/stores/tripProgressStore';
import { tripsAPI } from '@/services/api';

// API trip data type
interface ApiTrip {
  id: string;
  status: 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  currentDayNumber: number;
  currentItemIndex: number;
  completedItems: number;
  totalItems: number;
  itinerary: {
    id: string;
    title: string;
    city: string;
    durationDays: number;
    items: Array<{
      id: string;
      dayNumber: number;
      orderIndex: number;
      startTime: string;
      duration: number;
      notes?: string;
      location: {
        id: string;
        name: string;
        address: string;
        category: string;
        imageUrl?: string;
      };
    }>;
  };
}

// Alternative stop for smart reroute
const alternativeStop: TripStop = {
  id: 'alt-1',
  name: '43 Factory Coffee',
  type: 'cafe',
  time: '15:00',
  duration: '2h',
  status: 'upcoming',
  address: '43 Tran Cao Van, Thanh Khe, Da Nang',
  image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300',
  transport: { mode: 'grab_bike', duration: '10 min', cost: 30000 },
};

const weatherAlert = {
  type: 'rain',
  message: 'Light rain expected at 3 PM',
  icon: CloudRain,
};

export default function Trip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tripId = id || 'default';

  // API state
  const [apiTrip, setApiTrip] = useState<ApiTrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Get store actions and data
  const { startTrip, getTrip, markStopComplete, skipStop, replaceStop, advanceToNextDay, resetTrip } = useTripProgressStore();
  const tripProgress = getTrip(tripId);

  const [isPaused, setIsPaused] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [showWeatherAlert, setShowWeatherAlert] = useState(true);
  const [showRerouteOffer, setShowRerouteOffer] = useState(false);
  const [rerouteAccepted, setRerouteAccepted] = useState(false);
  const [currentTime, _setCurrentTime] = useState('10:45');
  const [mapExpanded, setMapExpanded] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);

  // Get trip name from local mapping for demo purposes
  const tripNames: Record<string, string> = {
    '1': 'Beach & Culture Explorer',
    '2': 'Foodie Paradise Trail',
  };
  const localTripName = tripNames[tripId] || 'Beach & Culture Explorer';

  // Fetch trip from API on mount, fall back to local template for demo
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setIsLoading(true);
        const response = await tripsAPI.getById(tripId);
        const trip = response.data.data as ApiTrip;
        setApiTrip(trip);

        // Initialize local store with API data if not already initialized
        if (!tripProgress) {
          startTrip(tripId, trip.itinerary.title);
        }

        // If trip is scheduled, activate it
        if (trip.status === 'scheduled') {
          await tripsAPI.update(tripId, { status: 'active' });
          setApiTrip(prev => prev ? { ...prev, status: 'active' } : null);
        }
      } catch (err) {
        // API failed - fall back to local template for demo purposes
        if (!tripProgress) {
          startTrip(tripId, localTripName);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrip();
  }, [tripId, localTripName]);

  // Get stops from store, or empty array while initializing
  const stops = tripProgress?.stops || [];
  const currentStop = stops.find(s => s.status === 'current');
  const nextStop = stops.find(s => s.status === 'upcoming');
  const completedCount = stops.filter(s => s.status === 'completed').length;
  const progress = stops.length > 0 ? (completedCount / stops.length) * 100 : 0;

  // Simulate time passing
  useEffect(() => {
    const timer = setInterval(() => {
      // In real app, update current time
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Show reroute offer after weather alert
  useEffect(() => {
    if (showWeatherAlert && !rerouteAccepted) {
      const timer = setTimeout(() => {
        setShowRerouteOffer(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showWeatherAlert, rerouteAccepted]);

  // Sync progress to API
  const syncToApi = useCallback(async (action: 'advance' | 'complete' | 'day_advance') => {
    if (!apiTrip) return;

    setIsSyncing(true);
    try {
      if (action === 'advance') {
        const response = await tripsAPI.advance(tripId);
        const updatedTrip = response.data.data;
        setApiTrip(updatedTrip);

        // Check if trip completed
        if (updatedTrip.isComplete || updatedTrip.status === 'completed') {
          toast.success('Trip completed! Great job!');
        }
      } else if (action === 'complete') {
        await tripsAPI.update(tripId, { status: 'completed' });
        setApiTrip(prev => prev ? { ...prev, status: 'completed' } : null);
      } else if (action === 'day_advance') {
        const nextDay = (apiTrip.currentDayNumber || 1) + 1;
        await tripsAPI.update(tripId, { currentDayNumber: nextDay, currentItemIndex: 0 });
        setApiTrip(prev => prev ? { ...prev, currentDayNumber: nextDay, currentItemIndex: 0 } : null);
      }
    } catch (err) {
      console.error('Failed to sync to API:', err);
      // Don't show error toast - local state is still updated
    } finally {
      setIsSyncing(false);
    }
  }, [apiTrip, tripId]);

  const handleMarkComplete = async (stopId: string) => {
    const stop = stops.find(s => s.id === stopId);
    markStopComplete(tripId, stopId);
    toast.success(`${stop?.name} completed!`);

    // Sync to API
    await syncToApi('advance');
  };

  const handleSkip = async (stopId: string) => {
    const stop = stops.find(s => s.id === stopId);
    skipStop(tripId, stopId);
    toast(`Skipped ${stop?.name}`, { icon: '⏭️' });

    // Sync to API (skip also advances)
    await syncToApi('advance');
  };

  const handleAdvanceDay = async () => {
    advanceToNextDay(tripId);
    toast.success(`Starting Day ${(tripProgress?.currentDay || 1) + 1}!`, { icon: '🌅' });

    // Sync day advance to API
    await syncToApi('day_advance');
  };

  const handleRestartTrip = async () => {
    resetTrip(tripId);
    toast.success('Trip restarted! Enjoy your adventure again!');

    // Reset API trip status
    if (apiTrip) {
      try {
        await tripsAPI.update(tripId, { status: 'active', currentDayNumber: 1, currentItemIndex: 0 });
        setApiTrip(prev => prev ? { ...prev, status: 'active', currentDayNumber: 1, currentItemIndex: 0 } : null);
      } catch (err) {
        console.error('Failed to reset trip in API:', err);
      }
    }
  };

  // Handle accepting the smart reroute swap
  const handleAcceptSwap = () => {
    // Find Beach Club and replace with 43 Factory Coffee
    const beachClubStop = stops.find(s => s.name === 'Beach Club Relaxation');
    if (beachClubStop) {
      replaceStop(tripId, beachClubStop.id, alternativeStop);
    }
    setShowRerouteOffer(false);
    setRerouteAccepted(true);
    setShowWeatherAlert(false);
    toast.success('Itinerary updated! 43 Factory Coffee swapped in.');
  };

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'grab_bike': return Bike;
      case 'grab_car': return Car;
      default: return Footprints;
    }
  };

  // Derive trip name from API or local store
  const tripName = apiTrip?.itinerary?.title || tripProgress?.tripName || 'My Trip';
  const totalDays = apiTrip?.itinerary?.durationDays || tripProgress?.totalDays || 3;
  const currentDay = apiTrip?.currentDayNumber || tripProgress?.currentDay || 1;

  // Loading messages for the preparation screen
  const loadingMessages = [
    { icon: CloudRain, text: 'Checking weather conditions...', color: 'text-sky-500' },
    { icon: Car, text: 'Analyzing traffic patterns...', color: 'text-amber-500' },
    { icon: MapPin, text: 'Optimizing your route...', color: 'text-green-500' },
    { icon: Sparkles, text: 'Preparing your adventure...', color: 'text-purple-500' },
  ];

  const [loadingStep, setLoadingStep] = useState(0);
  const [showPreparing, setShowPreparing] = useState(true);

  // Cycle through loading messages
  useEffect(() => {
    if (!isLoading && showPreparing) {
      const interval = setInterval(() => {
        setLoadingStep(prev => {
          if (prev >= loadingMessages.length - 1) {
            clearInterval(interval);
            setTimeout(() => setShowPreparing(false), 500);
            return prev;
          }
          return prev + 1;
        });
      }, 500);

      // Ensure minimum 2 second display
      const timer = setTimeout(() => {
        setShowPreparing(false);
      }, 2000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isLoading, showPreparing, loadingMessages.length]);

  // Loading/Preparing state
  if (isLoading || showPreparing) {
    const currentMessage = loadingMessages[Math.min(loadingStep, loadingMessages.length - 1)];
    const CurrentIcon = currentMessage.icon;

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center max-w-sm px-4">
            {/* Animated icon container */}
            <motion.div
              key={loadingStep}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] mx-auto mb-6 flex items-center justify-center"
            >
              <CurrentIcon className={`w-10 h-10 ${currentMessage.color}`} />
            </motion.div>

            {/* Loading message */}
            <motion.p
              key={`text-${loadingStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-medium text-gray-700 mb-4"
            >
              {currentMessage.text}
            </motion.p>

            {/* Progress dots */}
            <div className="flex justify-center gap-2">
              {loadingMessages.map((_, idx) => (
                <motion.div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx <= loadingStep ? 'bg-sky-primary' : 'bg-gray-200'
                  }`}
                  initial={false}
                  animate={{
                    scale: idx === loadingStep ? [1, 1.3, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>

            {/* Subtitle */}
            <p className="text-sm text-gray-400 mt-6">
              Personalizing your {localTripName}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Header */}
      <Header />

      {/* Trip Info Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-lg">
                    Day {currentDay}
                    <span className="text-gray-400 font-normal"> / {totalDays}</span>
                  </h1>
                  <Badge variant="secondary" className="text-xs">
                    {tripProgress?.tripTheme || 'Explorer'}
                  </Badge>
                  {isSyncing && (
                    <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {currentTime} • {completedCount}/{stops.length} stops today
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Progress indicator */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-sky-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {Math.round(progress)}%
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Constrained width */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Weather Alert Banner */}
        <AnimatePresence>
          {showWeatherAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <Card className="bg-amber-50 border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <weatherAlert.icon className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-800">{weatherAlert.message}</p>
                      <p className="text-xs text-amber-600">May affect outdoor activities</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWeatherAlert(false)}
                    className="p-1 hover:bg-amber-100 rounded"
                  >
                    <X className="w-4 h-4 text-amber-600" />
                  </button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map View - Always visible */}
        <div className="mb-6">
          <Card className="overflow-hidden p-0">
            <motion.div
              animate={{ height: mapExpanded ? 350 : 160 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="w-full h-full bg-gray-200 flex items-center justify-center relative">
                {/* Placeholder map - In production, integrate with Google Maps or Mapbox */}
                <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-sky-200" />
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234FC3F7' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                {/* Map markers preview */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {stops.slice(0, mapExpanded ? 5 : 3).map((stop, idx) => (
                    <div
                      key={stop.id}
                      className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium ${
                        stop.status === 'current'
                          ? 'bg-sky-primary text-white'
                          : stop.status === 'completed'
                          ? 'bg-green-500 text-white'
                          : stop.status === 'skipped'
                          ? 'bg-gray-400 text-white'
                          : 'bg-white text-gray-700 shadow-sm'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="truncate max-w-28">{stop.name}</span>
                    </div>
                  ))}
                </div>

                {/* Expand/Collapse button */}
                <button
                  onClick={() => setMapExpanded(!mapExpanded)}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 shadow-md hover:shadow-lg transition-shadow"
                >
                  {mapExpanded ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      Expand
                    </>
                  )}
                </button>

                {/* Center placeholder when expanded */}
                {mapExpanded && (
                  <div className="relative z-10 text-center">
                    <Map className="w-10 h-10 text-sky-primary/40 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Interactive map coming soon</p>
                  </div>
                )}
              </div>
            </motion.div>
          </Card>
        </div>

        {/* Day Complete Card */}
        {tripProgress?.dayCompleted && !tripProgress?.tripCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 text-center py-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Sunrise className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Day {currentDay} Complete!</h2>
              <p className="text-gray-600 mb-6">
                Great job today! Ready for Day {currentDay + 1}?
              </p>
              <div className="flex gap-3 justify-center max-w-xs mx-auto">
                <Button onClick={handleAdvanceDay} className="flex-1">
                  Start Day {currentDay + 1}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Trip Complete Card */}
        {(tripProgress?.tripCompleted || apiTrip?.status === 'completed') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <PartyPopper className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Trip Complete!</h2>
              <p className="text-gray-600 mb-2">
                Congratulations! You've completed your {totalDays}-day adventure.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {tripName}
              </p>
              <div className="flex gap-3 justify-center max-w-md mx-auto">
                <Button onClick={handleRestartTrip} variant="secondary" className="flex-1">
                  Restart Trip
                </Button>
                <Button onClick={() => navigate('/dashboard')} className="flex-1">
                  Back to Dashboard
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Current Stop - Highlighted */}
        {currentStop && !tripProgress?.dayCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-sky-primary uppercase tracking-wide">
                Current Stop
              </p>
              <Badge variant="primary" className="animate-pulse">
                <MapPin className="w-3 h-3 mr-1" />
                You're here
              </Badge>
            </div>
            <Card className="overflow-hidden border-2 border-sky-primary">
              <div className="relative h-48 sm:h-56">
                <img
                  src={currentStop.image}
                  alt={currentStop.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h2 className="text-2xl font-bold mb-1">{currentStop.name}</h2>
                  <p className="text-sm opacity-90 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {currentStop.address}
                  </p>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-4 h-4 text-sky-primary" />
                      {currentStop.time}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{currentStop.duration}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Navigation className="w-4 h-4" />}
                  >
                    Directions
                  </Button>
                </div>

                <div className="flex gap-3">
                  <Button
                    fullWidth
                    onClick={() => handleMarkComplete(currentStop.id)}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Complete
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleSkip(currentStop.id)}
                    leftIcon={<SkipForward className="w-4 h-4" />}
                  >
                    Skip
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Next Stop Preview with Transport */}
        {nextStop && nextStop.transport && !tripProgress?.dayCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Next Up
            </p>
            <Card>
              {/* Transport Option */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-primary/10 rounded-lg flex items-center justify-center">
                    {(() => {
                      const Icon = getTransportIcon(nextStop.transport!.mode);
                      return <Icon className="w-5 h-5 text-sky-primary" />;
                    })()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {nextStop.transport.mode === 'grab_bike' ? 'Grab Bike' :
                       nextStop.transport.mode === 'grab_car' ? 'Grab Car' : 'Walk'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {nextStop.transport.duration}
                      {nextStop.transport.cost && ` • ${(nextStop.transport.cost / 1000).toFixed(0)}k VND`}
                    </p>
                  </div>
                </div>
                <Button size="sm" onClick={() => setShowTransportModal(true)}>
                  Book Now
                </Button>
              </div>

              {/* Destination Preview */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 border-gray-100">
                  <img
                    src={nextStop.image}
                    alt={nextStop.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{nextStop.name}</h3>
                  <p className="text-sm text-gray-500">{nextStop.time} • {nextStop.duration}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Timeline */}
        <div className="mb-24">
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="flex items-center justify-between w-full mb-4"
          >
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Today's Timeline
            </p>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showTimeline ? '' : '-rotate-90'}`} />
          </button>

          <AnimatePresence>
            {showTimeline && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <div className="space-y-1">
                    {stops.map((stop, idx) => (
                      <motion.div
                        key={stop.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                          stop.status === 'current' ? 'bg-sky-primary/5' : ''
                        }`}
                      >
                        {/* Status Icon */}
                        <div className="flex flex-col items-center pt-0.5">
                          {stop.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : stop.status === 'current' ? (
                            <div className="w-5 h-5 bg-sky-primary rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                          ) : stop.status === 'skipped' ? (
                            <X className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300" />
                          )}
                          {idx < stops.length - 1 && (
                            <div className={`w-0.5 h-8 mt-1 ${
                              stop.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>

                        {/* Content */}
                        <div className={`flex-1 min-w-0 ${
                          stop.status === 'skipped' ? 'opacity-50' : ''
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-gray-500">{stop.time}</span>
                            {stop.status === 'current' && (
                              <Badge variant="primary" className="text-[10px] px-1.5 py-0.5">Now</Badge>
                            )}
                          </div>
                          <h4 className={`font-medium text-sm ${
                            stop.status === 'skipped' ? 'line-through text-gray-400' : ''
                          }`}>
                            {stop.name}
                          </h4>
                          <p className="text-xs text-gray-500">{stop.duration}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Smart Reroute Offer - Bottom Floating Card */}
      <AnimatePresence>
        {showRerouteOffer && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-6"
          >
            <div className="max-w-4xl mx-auto">
              <Card className="bg-gradient-to-br from-white to-sky-50 border-2 border-sky-primary shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-sky-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <RefreshCw className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sky-primary">Anva Smart Reroute</h3>
                      <Badge variant="warning" className="text-[10px]">Weather</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Rain at 3 PM may affect <strong>Beach Club</strong>. Swap with indoor activity?
                    </p>

                    {/* Suggestion Card */}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-gray-100 mb-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={alternativeStop.image}
                          alt={alternativeStop.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Coffee className="w-4 h-4 text-sky-primary" />
                          <p className="font-semibold text-sm">{alternativeStop.name}</p>
                        </div>
                        <p className="text-xs text-gray-500">Award-winning Vietnamese coffee • Indoor</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handleAcceptSwap} className="flex-1">
                        Accept Swap
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setShowRerouteOffer(false)}
                        className="flex-1"
                      >
                        Keep Original
                      </Button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRerouteOffer(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transport Booking Modal */}
      <AnimatePresence>
        {showTransportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowTransportModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3" />
              <div className="p-6 max-w-2xl mx-auto">
                <h2 className="text-xl font-bold mb-4">Book Your Ride</h2>

                <div className="space-y-3 mb-6">
                  {[
                    { mode: 'grab_bike', name: 'Grab Bike', price: '25,000 VND', time: '8 min', icon: Bike },
                    { mode: 'grab_car', name: 'Grab Car', price: '65,000 VND', time: '12 min', icon: Car },
                    { mode: 'walk', name: 'Walk', price: 'Free', time: '25 min', icon: Footprints },
                  ].map(option => (
                    <button
                      key={option.mode}
                      className="w-full flex items-center justify-between p-4 rounded-xl border-2 hover:border-sky-primary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <option.icon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{option.name}</p>
                          <p className="text-sm text-gray-500">{option.time}</p>
                        </div>
                      </div>
                      <p className="font-bold">{option.price}</p>
                    </button>
                  ))}
                </div>

                <Button fullWidth size="lg" onClick={() => setShowTransportModal(false)}>
                  Open Grab App
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
