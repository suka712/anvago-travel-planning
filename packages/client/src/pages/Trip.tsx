import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation, MapPin, Clock, ChevronRight, CheckCircle2, Circle,
  AlertTriangle, Cloud, CloudRain, Bike, Car, Footprints, Phone,
  Bell, X, Play, Pause, SkipForward, Home, RefreshCw, Coffee
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';

interface TripStop {
  id: string;
  name: string;
  type: string;
  time: string;
  duration: string;
  status: 'completed' | 'current' | 'upcoming' | 'skipped';
  address: string;
  image: string;
  transport?: {
    mode: 'grab_bike' | 'grab_car' | 'walk';
    duration: string;
    cost?: number;
  };
}

const mockTripStops: TripStop[] = [
  {
    id: '1',
    name: 'Sunrise at My Khe Beach',
    type: 'beach',
    time: '6:00',
    duration: '2h',
    status: 'completed',
    address: 'My Khe Beach, Phuoc My, Son Tra, Da Nang',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300',
  },
  {
    id: '2',
    name: 'Bánh Mì Bà Lan',
    type: 'food',
    time: '8:30',
    duration: '45m',
    status: 'completed',
    address: '115 Nguyen Chi Thanh, Hai Chau, Da Nang',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300',
    transport: { mode: 'grab_bike', duration: '10 min', cost: 25000 },
  },
  {
    id: '3',
    name: 'Han Market',
    type: 'shopping',
    time: '10:00',
    duration: '2h',
    status: 'current',
    address: '119 Tran Phu, Hai Chau, Da Nang',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300',
    transport: { mode: 'walk', duration: '15 min' },
  },
  {
    id: '4',
    name: 'Madame Lan Restaurant',
    type: 'food',
    time: '12:30',
    duration: '1.5h',
    status: 'upcoming',
    address: '4 Bach Dang, Hai Chau, Da Nang',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300',
    transport: { mode: 'grab_bike', duration: '8 min', cost: 20000 },
  },
  {
    id: '5',
    name: 'Beach Club Relaxation',
    type: 'beach',
    time: '15:00',
    duration: '3h',
    status: 'upcoming',
    address: 'My Khe Beach, Son Tra, Da Nang',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300',
    transport: { mode: 'grab_car', duration: '15 min', cost: 75000 },
  },
];

const weatherAlert = {
  type: 'rain',
  message: 'Light rain expected at 3 PM. Consider indoor alternatives.',
  icon: CloudRain,
};

export default function Trip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stops, setStops] = useState<TripStop[]>(mockTripStops);
  const [isPaused, setIsPaused] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [showWeatherAlert, setShowWeatherAlert] = useState(true);
  const [showRerouteOffer, setShowRerouteOffer] = useState(false);
  const [currentTime, setCurrentTime] = useState('10:45');
  const [notification, setNotification] = useState<string | null>(null);

  const currentStop = stops.find(s => s.status === 'current');
  const nextStop = stops.find(s => s.status === 'upcoming');
  const completedCount = stops.filter(s => s.status === 'completed').length;
  const progress = (completedCount / stops.length) * 100;

  // Simulate time passing
  useEffect(() => {
    const timer = setInterval(() => {
      // In real app, update current time
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Show reroute offer after weather alert
  useEffect(() => {
    if (showWeatherAlert) {
      const timer = setTimeout(() => {
        setShowRerouteOffer(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showWeatherAlert]);

  const handleMarkComplete = (stopId: string) => {
    setStops(prev => {
      const newStops = [...prev];
      const currentIdx = newStops.findIndex(s => s.id === stopId);
      if (currentIdx !== -1) {
        newStops[currentIdx].status = 'completed';
        if (currentIdx + 1 < newStops.length) {
          newStops[currentIdx + 1].status = 'current';
        }
      }
      return newStops;
    });
    setNotification('Great! Moving to next destination...');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSkip = (stopId: string) => {
    setStops(prev => {
      const newStops = [...prev];
      const currentIdx = newStops.findIndex(s => s.id === stopId);
      if (currentIdx !== -1) {
        newStops[currentIdx].status = 'skipped';
        if (currentIdx + 1 < newStops.length) {
          newStops[currentIdx + 1].status = 'current';
        }
      }
      return newStops;
    });
  };

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'grab_bike': return Bike;
      case 'grab_car': return Car;
      default: return Footprints;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Status Bar */}
      <header className="sticky top-0 z-30 bg-[#4FC3F7] text-white">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="p-1 hover:bg-white/20 rounded">
                <Home className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-bold">Day 1 - Beach & Culture</h1>
                <p className="text-sm opacity-80">{currentTime} • {completedCount}/{stops.length} completed</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
                className="text-white hover:bg-white/20"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </header>

      {/* Weather Alert */}
      <AnimatePresence>
        {showWeatherAlert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-yellow-50 border-b border-yellow-200"
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <weatherAlert.icon className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">{weatherAlert.message}</p>
              </div>
              <button onClick={() => setShowWeatherAlert(false)}>
                <X className="w-4 h-4 text-yellow-600" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Reroute Offer */}
      <AnimatePresence>
        {showRerouteOffer && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="mx-4 mt-4"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-[#4FC3F7]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#4FC3F7] rounded-full flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#2196F3]">Anva Smart Reroute</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Rain at 3 PM may affect Beach Club. Would you like to swap with an indoor activity?
                  </p>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg mb-3">
                    <Coffee className="w-5 h-5 text-[#4FC3F7]" />
                    <div>
                      <p className="font-medium">43 Factory Coffee</p>
                      <p className="text-xs text-gray-500">Award-winning Vietnamese coffee • Indoor</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setShowRerouteOffer(false)}>
                      Accept Swap
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowRerouteOffer(false)}>
                      Keep Original
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Current Stop */}
        {currentStop && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <p className="text-sm font-medium text-gray-500 mb-2">NOW</p>
            <Card className="overflow-hidden border-2 border-[#4FC3F7]">
              <div className="relative h-40">
                <img src={currentStop.image} alt={currentStop.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-xl font-bold">{currentStop.name}</h2>
                  <p className="text-sm opacity-80">{currentStop.address}</p>
                </div>
                <Badge variant="success" className="absolute top-4 right-4">
                  <MapPin className="w-3 h-3 mr-1" />
                  You're here
                </Badge>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {currentStop.time} - {currentStop.duration}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" leftIcon={<Navigation className="w-4 h-4" />}>
                    Get Directions
                  </Button>
                </div>

                <div className="flex gap-3">
                  <Button
                    fullWidth
                    onClick={() => handleMarkComplete(currentStop.id)}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Mark Complete
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

        {/* Next Stop Preview */}
        {nextStop && nextStop.transport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <p className="text-sm font-medium text-gray-500 mb-2">NEXT UP</p>
            <Card className="bg-gray-50">
              {/* Transport */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border mb-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getTransportIcon(nextStop.transport!.mode);
                    return <Icon className="w-5 h-5 text-[#4FC3F7]" />;
                  })()}
                  <div>
                    <p className="font-medium">
                      {nextStop.transport.mode === 'grab_bike' ? 'Grab Bike' :
                       nextStop.transport.mode === 'grab_car' ? 'Grab Car' : 'Walk'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {nextStop.transport.duration}
                      {nextStop.transport.cost && ` • ${(nextStop.transport.cost / 1000).toFixed(0)}k VND`}
                    </p>
                  </div>
                </div>
                <Button size="sm" onClick={() => setShowTransportModal(true)}>
                  Book Now
                </Button>
              </div>

              {/* Destination */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={nextStop.image} alt={nextStop.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{nextStop.name}</h3>
                  <p className="text-sm text-gray-500">{nextStop.time} • {nextStop.duration}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Timeline */}
        <div>
          <p className="text-sm font-medium text-gray-500 mb-4">TODAY'S TIMELINE</p>
          <div className="space-y-4">
            {stops.map((stop, idx) => (
              <motion.div
                key={stop.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-4"
              >
                {/* Status Icon */}
                <div className="flex flex-col items-center">
                  {stop.status === 'completed' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : stop.status === 'current' ? (
                    <div className="w-6 h-6 bg-[#4FC3F7] rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    </div>
                  ) : stop.status === 'skipped' ? (
                    <X className="w-6 h-6 text-gray-400" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300" />
                  )}
                  {idx < stops.length - 1 && (
                    <div className={`w-0.5 h-12 mt-1 ${
                      stop.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 pb-4 ${
                  stop.status === 'skipped' ? 'opacity-50' : ''
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-500">{stop.time}</span>
                    {stop.status === 'current' && (
                      <Badge variant="primary" className="text-xs">Now</Badge>
                    )}
                  </div>
                  <h4 className={`font-medium ${
                    stop.status === 'skipped' ? 'line-through text-gray-400' : ''
                  }`}>
                    {stop.name}
                  </h4>
                  <p className="text-sm text-gray-500">{stop.duration}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Transport Modal */}
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
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Book Your Ride</h2>
                
                <div className="space-y-3 mb-6">
                  {[
                    { mode: 'grab_bike', name: 'Grab Bike', price: '25,000 VND', time: '8 min', icon: Bike },
                    { mode: 'grab_car', name: 'Grab Car', price: '65,000 VND', time: '12 min', icon: Car },
                    { mode: 'walk', name: 'Walk', price: 'Free', time: '25 min', icon: Footprints },
                  ].map(option => (
                    <button
                      key={option.mode}
                      className="w-full flex items-center justify-between p-4 rounded-xl border-2 hover:border-[#4FC3F7] transition-colors"
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

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 z-50"
          >
            <Card className="bg-green-500 text-white flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              <span>{notification}</span>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

