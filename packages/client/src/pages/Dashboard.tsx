import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Map, Calendar, Clock, Star, ChevronRight, Settings,
  User, Crown, LogOut, Heart, History, Sparkles, Bell
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

const mockTrips = [
  {
    id: '1',
    name: 'Beach & Culture Explorer',
    destination: 'Danang',
    date: '2024-12-15',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400',
    progress: 0,
  },
  {
    id: '2',
    name: 'Foodie Paradise Trail',
    destination: 'Danang',
    date: '2024-11-20',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    progress: 100,
  },
];

const mockSavedItineraries = [
  {
    id: '3',
    name: 'Adventure Seeker\'s Dream',
    destination: 'Danang',
    duration: 5,
    image: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=400',
  },
  {
    id: '4',
    name: 'Relaxation Retreat',
    destination: 'Danang',
    duration: 3,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'trips' | 'saved'>('trips');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#4FC3F7] to-[#2196F3] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}!</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{user?.email}</span>
                  {user?.isPremium && (
                    <Badge variant="warning">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              hoverable
              className="bg-gradient-to-br from-[#4FC3F7] to-[#2196F3] text-white cursor-pointer"
              onClick={() => navigate('/discover')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Plan New Trip</h3>
                  <p className="text-sm opacity-80">Start a new adventure</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <Card hoverable className="cursor-pointer" onClick={() => navigate('/discover')}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold">AI Recommendations</h3>
                <p className="text-sm text-gray-600">Get personalized trips</p>
              </div>
            </div>
          </Card>

          <Card hoverable className="cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <History className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold">Trip History</h3>
                <p className="text-sm text-gray-600">View past adventures</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('trips')}
            className={`pb-3 px-1 font-medium border-b-2 transition-colors ${
              activeTab === 'trips'
                ? 'border-[#4FC3F7] text-[#2196F3]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Map className="w-4 h-4 inline mr-2" />
            My Trips
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-3 px-1 font-medium border-b-2 transition-colors ${
              activeTab === 'saved'
                ? 'border-[#4FC3F7] text-[#2196F3]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Heart className="w-4 h-4 inline mr-2" />
            Saved Itineraries
          </button>
        </div>

        {/* Content */}
        {activeTab === 'trips' && (
          <div className="space-y-4">
            {mockTrips.length === 0 ? (
              <Card className="text-center py-12">
                <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No trips yet</h3>
                <p className="text-gray-600 mb-6">Start planning your first adventure!</p>
                <Button onClick={() => navigate('/discover')}>
                  Plan Your First Trip
                </Button>
              </Card>
            ) : (
              mockTrips.map((trip, idx) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card
                    hoverable
                    padding="none"
                    className="overflow-hidden cursor-pointer"
                    onClick={() => navigate(trip.status === 'upcoming' ? `/trip/${trip.id}` : `/itinerary/${trip.id}`)}
                  >
                    <div className="flex">
                      <div className="w-32 h-32 flex-shrink-0">
                        <img src={trip.image} alt={trip.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg">{trip.name}</h3>
                              <Badge variant={trip.status === 'upcoming' ? 'primary' : 'success'}>
                                {trip.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{trip.destination}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(trip.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>

                        {trip.status === 'upcoming' && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Ready to go</span>
                              <span className="font-medium text-[#2196F3]">Start Trip →</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="grid md:grid-cols-2 gap-4">
            {mockSavedItineraries.map((itinerary, idx) => (
              <motion.div
                key={itinerary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  hoverable
                  padding="none"
                  className="overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/itinerary/${itinerary.id}`)}
                >
                  <div className="relative h-32">
                    <img src={itinerary.image} alt={itinerary.name} className="w-full h-full object-cover" />
                    <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg">
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-1">{itinerary.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{itinerary.destination}</span>
                      <span>•</span>
                      <span>{itinerary.duration} days</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Premium Upsell (if not premium) */}
        {!user?.isPremium && (
          <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Upgrade to Premium</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Unlock AI optimization, smart search, local gems, and more!
                </p>
                <Button size="sm">
                  Upgrade Now
                </Button>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

