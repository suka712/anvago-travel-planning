import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, DollarSign, Star, Calendar, ChevronRight,
  Share2, Download, Heart, Map, Cloud, Navigation,
  Bike, Car, Footprints, ArrowLeft
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { ShareModal } from '@/components/modals';
import TripMap from '@/components/map/TripMap';

// Mock itinerary data
const mockItinerary = {
  id: '1',
  name: 'Beach & Culture Explorer',
  description: 'A perfect blend of relaxation and discovery through Danang',
  matchScore: 95,
  duration: 3,
  estimatedCost: 2500000,
  city: 'Danang',
  image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200',
  tags: ['beach', 'culture', 'food', 'photography'],
  weather: { temp: 28, condition: 'Partly Cloudy', icon: Cloud },
  days: [
    {
      day: 1,
      title: 'Beach Vibes & Local Flavors',
      activities: [
        {
          id: '1',
          time: '6:00',
          name: 'Sunrise at My Khe Beach',
          type: 'beach',
          duration: '2h',
          description: 'Start your day with a stunning sunrise at one of the world\'s most beautiful beaches',
          image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
          location: { lat: 16.0544, lng: 108.2272 },
          cost: 0,
          rating: 4.8,
        },
        {
          id: '2',
          time: '8:30',
          name: 'Bánh Mì Bà Lan',
          type: 'food',
          duration: '45m',
          description: 'Famous local bánh mì shop with crispy bread and fresh ingredients',
          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
          cost: 30000,
          rating: 4.9,
          isLocalGem: true,
          transport: { mode: 'grab_bike', duration: '10 min', cost: 25000 },
        },
        {
          id: '3',
          time: '10:00',
          name: 'Han Market',
          type: 'shopping',
          duration: '2h',
          description: 'Explore Danang\'s largest traditional market for souvenirs and local goods',
          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
          cost: 0,
          rating: 4.5,
          transport: { mode: 'walk', duration: '15 min' },
        },
        {
          id: '4',
          time: '12:30',
          name: 'Madame Lan Restaurant',
          type: 'food',
          duration: '1.5h',
          description: 'Elegant Vietnamese cuisine in a beautiful colonial-style setting',
          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
          cost: 250000,
          rating: 4.7,
          transport: { mode: 'grab_bike', duration: '8 min', cost: 20000 },
        },
        {
          id: '5',
          time: '15:00',
          name: 'Beach Club Relaxation',
          type: 'beach',
          duration: '3h',
          description: 'Unwind at a beachfront club with swimming, sunbathing, and cocktails',
          image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
          cost: 150000,
          rating: 4.6,
          transport: { mode: 'grab_car', duration: '15 min', cost: 75000 },
        },
        {
          id: '6',
          time: '19:00',
          name: 'Bé Mặn Seafood',
          type: 'food',
          duration: '2h',
          description: 'Fresh seafood dinner at a beloved local restaurant',
          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
          cost: 400000,
          rating: 4.8,
          transport: { mode: 'grab_bike', duration: '10 min', cost: 30000 },
        },
      ],
    },
    {
      day: 2,
      title: 'Mountains & Mysticism',
      activities: [
        {
          id: '7',
          time: '6:00',
          name: 'Marble Mountains',
          type: 'nature',
          duration: '4h',
          description: 'Explore ancient caves, temples, and panoramic views',
          image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400',
          cost: 40000,
          rating: 4.9,
        },
        {
          id: '8',
          time: '11:00',
          name: 'The Fig Restaurant',
          type: 'food',
          duration: '1.5h',
          description: 'Modern Vietnamese brunch with garden views',
          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
          cost: 300000,
          rating: 4.6,
          transport: { mode: 'grab_bike', duration: '15 min', cost: 35000 },
        },
        {
          id: '9',
          time: '13:30',
          name: 'Cham Museum',
          type: 'museum',
          duration: '2h',
          description: 'World\'s largest collection of Cham sculpture',
          image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400',
          cost: 60000,
          rating: 4.7,
          transport: { mode: 'grab_car', duration: '20 min', cost: 60000 },
        },
        {
          id: '10',
          time: '20:30',
          name: 'Dragon Bridge Show',
          type: 'attraction',
          duration: '1h',
          description: 'Watch the iconic Dragon Bridge breathe fire and water',
          image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
          cost: 0,
          rating: 4.8,
          transport: { mode: 'walk', duration: '10 min' },
        },
      ],
    },
    {
      day: 3,
      title: 'Peninsula Adventure',
      activities: [
        {
          id: '11',
          time: '5:30',
          name: 'Son Tra Peninsula Drive',
          type: 'nature',
          duration: '3h',
          description: 'Scenic drive with wildlife spotting and ocean views',
          image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400',
          cost: 0,
          rating: 4.9,
        },
        {
          id: '12',
          time: '9:00',
          name: 'Linh Ung Pagoda',
          type: 'temple',
          duration: '1.5h',
          description: 'Iconic Lady Buddha statue with stunning views',
          image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400',
          cost: 0,
          rating: 4.8,
        },
        {
          id: '13',
          time: '11:00',
          name: 'Bảo Ngư Restaurant',
          type: 'food',
          duration: '1.5h',
          description: 'Famous for fresh abalone and seafood',
          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
          cost: 500000,
          rating: 4.7,
          isLocalGem: true,
          transport: { mode: 'grab_bike', duration: '20 min', cost: 40000 },
        },
        {
          id: '14',
          time: '16:30',
          name: '43 Factory Coffee',
          type: 'cafe',
          duration: '1.5h',
          description: 'Award-winning specialty coffee roastery',
          image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
          cost: 80000,
          rating: 4.9,
          isLocalGem: true,
          transport: { mode: 'grab_bike', duration: '15 min', cost: 30000 },
        },
        {
          id: '15',
          time: '18:30',
          name: 'Farewell Dinner',
          type: 'food',
          duration: '2h',
          description: 'End your trip with a memorable dining experience',
          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
          cost: 600000,
          rating: 4.8,
          transport: { mode: 'grab_car', duration: '10 min', cost: 50000 },
        },
      ],
    },
  ],
};

const getTransportIcon = (mode: string) => {
  switch (mode) {
    case 'grab_bike': return Bike;
    case 'grab_car': return Car;
    default: return Footprints;
  }
};

export default function Itinerary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMapView, setShowMapView] = useState(false);

  // Get locations for map
  const mapLocations = mockItinerary.days
    .flatMap(day => day.activities)
    .filter((a): a is typeof a & { location: { lat: number; lng: number } } => 'location' in a && a.location != null)
    .map(a => ({
      id: a.id,
      name: a.name,
      lat: a.location.lat,
      lng: a.location.lng,
      type: a.type,
    }));

  const formatCost = (cost: number) => {
    if (cost === 0) return 'Free';
    return `${(cost / 1000).toFixed(0)}k VND`;
  };

  const totalTransportCost = mockItinerary.days.reduce((acc, day) => 
    acc + day.activities.reduce((dayAcc, act) => 
      dayAcc + (act.transport?.cost || 0), 0
    ), 0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative h-80">
        <img 
          src={mockItinerary.image} 
          alt={mockItinerary.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`p-2 rounded-full transition-colors ${
              isSaved ? 'bg-red-500 text-white' : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
            }`}
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={() => setShowShareModal(true)}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
          <button 
            onClick={() => setShowShareModal(true)}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <Download className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Title */}
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <Badge variant="success" className="mb-3">
            <Star className="w-3 h-3 mr-1 fill-current" />
            {mockItinerary.matchScore}% Match
          </Badge>
          <h1 className="text-3xl font-bold mb-2">{mockItinerary.name}</h1>
          <p className="text-white/80 mb-4">{mockItinerary.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {mockItinerary.city}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {mockItinerary.duration} days
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {(mockItinerary.estimatedCost / 1000000).toFixed(1)}M VND
            </span>
            <span className="flex items-center gap-1">
              <mockItinerary.weather.icon className="w-4 h-4" />
              {mockItinerary.weather.temp}°C
            </span>
          </div>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="sticky top-0 z-20 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3">
            {mockItinerary.days.map(day => (
              <button
                key={day.day}
                onClick={() => setActiveDay(day.day)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeDay === day.day
                    ? 'bg-[#4FC3F7] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Day {day.day}
              </button>
            ))}
            <button 
              onClick={() => setShowMapView(!showMapView)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-1 ${
                showMapView ? 'bg-[#4FC3F7] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Map className="w-4 h-4" />
              Map View
            </button>
          </div>
        </div>
      </div>

      {/* Day Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {mockItinerary.days.filter(d => d.day === activeDay).map(day => (
          <div key={day.day}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">Day {day.day}: {day.title}</h2>
              <p className="text-gray-600">{day.activities.length} activities planned</p>
            </div>

            <div className="space-y-4">
              {day.activities.map((activity, idx) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  {/* Transport connector */}
                  {activity.transport && idx > 0 && (
                    <div className="flex items-center gap-3 py-2 px-4 text-sm text-gray-500">
                      {(() => {
                        const Icon = getTransportIcon(activity.transport.mode);
                        return <Icon className="w-4 h-4" />;
                      })()}
                      <span>
                        {activity.transport.mode === 'grab_bike' ? 'Grab Bike' :
                         activity.transport.mode === 'grab_car' ? 'Grab Car' : 'Walk'} • {activity.transport.duration}
                        {activity.transport.cost && ` • ${formatCost(activity.transport.cost)}`}
                      </span>
                    </div>
                  )}

                  <Card hoverable className="overflow-hidden">
                    <div className="flex gap-4">
                      {/* Time */}
                      <div className="w-16 text-center flex-shrink-0">
                        <span className="font-mono text-lg font-bold text-[#2196F3]">{activity.time}</span>
                        <p className="text-xs text-gray-500">{activity.duration}</p>
                      </div>

                      {/* Image */}
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={activity.image} alt={activity.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold">{activity.name}</h3>
                              {'isLocalGem' in activity && activity.isLocalGem && (
                                <Badge variant="warning" className="text-xs">
                                  <Star className="w-3 h-3 mr-0.5" />
                                  Local Gem
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{activity.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatCost(activity.cost)}
                          </span>
                          {activity.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {activity.rating}
                            </span>
                          )}
                          <Badge variant="ghost" className="text-xs">{activity.type}</Badge>
                        </div>
                      </div>

                      {/* Navigation */}
                      <Button variant="ghost" size="sm" className="flex-shrink-0">
                        <Navigation className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* Summary Card */}
        <Card className="mt-8 bg-gradient-to-br from-[#4FC3F7]/10 to-[#81D4FA]/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#2196F3]">{mockItinerary.duration}</p>
              <p className="text-sm text-gray-600">Days</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2196F3]">
                {mockItinerary.days.reduce((acc, d) => acc + d.activities.length, 0)}
              </p>
              <p className="text-sm text-gray-600">Activities</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2196F3]">
                {(mockItinerary.estimatedCost / 1000000).toFixed(1)}M
              </p>
              <p className="text-sm text-gray-600">Est. Cost (VND)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2196F3]">
                {(totalTransportCost / 1000).toFixed(0)}k
              </p>
              <p className="text-sm text-gray-600">Transport (VND)</p>
            </div>
          </div>
        </Card>
      </main>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 bg-white border-t-2 border-black p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate(`/plan/${id}`)}
          >
            Customize
          </Button>
          <Button
            fullWidth
            onClick={() => navigate(`/trip/${id}`)}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Start Trip
          </Button>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={mockItinerary.name}
        description={mockItinerary.description}
        itineraryId={id}
      />

      {/* Map View Modal */}
      {showMapView && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[80vh] bg-white rounded-xl overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-bold">Trip Map</h3>
                <button onClick={() => setShowMapView(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1">
                <TripMap
                  locations={mapLocations}
                  showRoute
                  className="h-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

