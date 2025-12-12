import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  GripVertical, Plus, Trash2, Search, MapPin, Clock, DollarSign,
  Sparkles, Wand2, Star, Filter, X, Check, ChevronDown, ChevronUp,
  Bike, Car, Footprints, Sun, Cloud, Navigation, Lock, Crown
} from 'lucide-react';
import { Button, Card, Badge, Input, Modal } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

interface ItineraryItem {
  id: string;
  name: string;
  type: string;
  time: string;
  duration: string;
  image: string;
  description?: string;
  cost?: number;
  rating?: number;
  isLocalGem?: boolean;
}

interface DayPlan {
  day: number;
  title: string;
  items: ItineraryItem[];
}

// Mock data
const mockItinerary: DayPlan[] = [
  {
    day: 1,
    title: 'Beach Vibes & Local Flavors',
    items: [
      { id: '1', name: 'Sunrise at My Khe Beach', type: 'beach', time: '6:00', duration: '2h', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200', rating: 4.8 },
      { id: '2', name: 'Bánh Mì Bà Lan', type: 'food', time: '8:30', duration: '45m', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200', cost: 30000, rating: 4.9, isLocalGem: true },
      { id: '3', name: 'Han Market', type: 'shopping', time: '10:00', duration: '2h', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200', cost: 0, rating: 4.5 },
      { id: '4', name: 'Madame Lan Restaurant', type: 'food', time: '12:30', duration: '1.5h', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200', cost: 250000, rating: 4.7 },
      { id: '5', name: 'Beach Club Relaxation', type: 'beach', time: '15:00', duration: '3h', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200', cost: 150000, rating: 4.6 },
      { id: '6', name: 'Bé Mặn Seafood', type: 'food', time: '19:00', duration: '2h', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200', cost: 400000, rating: 4.8 },
    ],
  },
  {
    day: 2,
    title: 'Mountains & Mysticism',
    items: [
      { id: '7', name: 'Marble Mountains', type: 'nature', time: '6:00', duration: '4h', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200', cost: 40000, rating: 4.9 },
      { id: '8', name: 'The Fig Restaurant', type: 'food', time: '11:00', duration: '1.5h', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200', cost: 300000, rating: 4.6 },
      { id: '9', name: 'Cham Museum', type: 'museum', time: '13:30', duration: '2h', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200', cost: 60000, rating: 4.7 },
      { id: '10', name: 'Dragon Bridge Show', type: 'attraction', time: '20:30', duration: '1h', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=200', cost: 0, rating: 4.8 },
    ],
  },
];

const mockSearchResults = [
  { id: 's1', name: 'Son Tra Peninsula', type: 'nature', duration: '3h', cost: 0, rating: 4.9, image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200' },
  { id: 's2', name: '43 Factory Coffee', type: 'cafe', duration: '1h', cost: 80000, rating: 4.8, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200', isLocalGem: true },
  { id: 's3', name: 'Linh Ung Pagoda', type: 'temple', duration: '1.5h', cost: 0, rating: 4.7, image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200' },
  { id: 's4', name: 'Ba Na Hills', type: 'attraction', duration: '6h', cost: 850000, rating: 4.6, image: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=200' },
];

export default function Plan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isPremium = user?.subscriptionTier === 'premium';

  const [itinerary, setItinerary] = useState<DayPlan[]>(mockItinerary);
  const [expandedDays, setExpandedDays] = useState<number[]>([1, 2]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [showSmartSearch, setShowSmartSearch] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItineraryItem | null>(null);

  const toggleDay = (day: number) => {
    setExpandedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleReorder = (dayIndex: number, newItems: ItineraryItem[]) => {
    setItinerary(prev => prev.map((day, idx) => 
      idx === dayIndex ? { ...day, items: newItems } : day
    ));
  };

  const handleRemoveItem = (dayIndex: number, itemId: string) => {
    setItinerary(prev => prev.map((day, idx) => 
      idx === dayIndex ? { ...day, items: day.items.filter(item => item.id !== itemId) } : day
    ));
  };

  const handleAddItem = (dayIndex: number, item: typeof mockSearchResults[0]) => {
    const newItem: ItineraryItem = {
      ...item,
      time: '12:00', // Default time
    };
    setItinerary(prev => prev.map((day, idx) => 
      idx === dayIndex ? { ...day, items: [...day.items, newItem] } : day
    ));
    setShowSearch(false);
  };

  const formatCost = (cost?: number) => {
    if (!cost) return 'Free';
    return `${(cost / 1000).toFixed(0)}k VND`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Customize Your Trip</h1>
              <p className="text-sm text-gray-600">Drag to reorder, click to edit</p>
            </div>
            <div className="flex items-center gap-3">
              {!isPremium && (
                <Badge variant="warning" className="flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Free Plan
                </Badge>
              )}
              <Button variant="ghost" onClick={() => setShowSearch(true)} leftIcon={<Plus className="w-4 h-4" />}>
                Add Location
              </Button>
              <Button onClick={() => navigate(`/itinerary/${id}`)}>
                Save & Preview
              </Button>
            </div>
          </div>
        </div>

        {/* Premium Features Bar */}
        <div className="bg-gradient-to-r from-[#4FC3F7]/10 to-[#81D4FA]/10 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => !isPremium ? null : setShowOptimizeModal(true)}
              leftIcon={<Wand2 className="w-4 h-4" />}
              disabled={!isPremium}
              className="relative"
            >
              Go AI Optimize
              {!isPremium && <Lock className="w-3 h-3 ml-1 text-gray-400" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Star className="w-4 h-4" />}
              disabled={!isPremium}
            >
              Localize by Anva
              {!isPremium && <Lock className="w-3 h-3 ml-1 text-gray-400" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Search className="w-4 h-4" />}
              disabled={!isPremium}
            >
              Smart Search
              {!isPremium && <Lock className="w-3 h-3 ml-1 text-gray-400" />}
            </Button>
            {!isPremium && (
              <Button size="sm" variant="primary" className="ml-4">
                <Crown className="w-4 h-4 mr-1" />
                Upgrade to Premium
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {itinerary.map((day, dayIndex) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.1 }}
            >
              <Card className="overflow-hidden">
                {/* Day Header */}
                <button
                  onClick={() => toggleDay(day.day)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#4FC3F7] text-white rounded-xl flex items-center justify-center font-bold text-lg border-2 border-black">
                      {day.day}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg">Day {day.day}</h3>
                      <p className="text-sm text-gray-600">{day.title} • {day.items.length} activities</p>
                    </div>
                  </div>
                  {expandedDays.includes(day.day) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Day Items */}
                <AnimatePresence>
                  {expandedDays.includes(day.day) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t"
                    >
                      <Reorder.Group
                        axis="y"
                        values={day.items}
                        onReorder={(newItems) => handleReorder(dayIndex, newItems)}
                        className="divide-y"
                      >
                        {day.items.map((item) => (
                          <Reorder.Item
                            key={item.id}
                            value={item}
                            className="bg-white"
                          >
                            <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group">
                              {/* Drag Handle */}
                              <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                                <GripVertical className="w-5 h-5" />
                              </div>

                              {/* Time */}
                              <div className="w-16 text-center">
                                <span className="font-mono text-sm text-gray-500">{item.time}</span>
                              </div>

                              {/* Image */}
                              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 border-gray-200">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium truncate">{item.name}</h4>
                                  {item.isLocalGem && (
                                    <Badge variant="warning" className="text-xs">
                                      <Star className="w-3 h-3 mr-0.5" />
                                      Local Gem
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {item.duration}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    {formatCost(item.cost)}
                                  </span>
                                  {item.rating && (
                                    <span className="flex items-center gap-1">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      {item.rating}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowSmartSearch(item.id)}
                                  disabled={!isPremium}
                                  title="Find similar"
                                >
                                  <Search className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(dayIndex, item.id)}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>

                      {/* Add to Day Button */}
                      <div className="p-4 border-t bg-gray-50">
                        <Button
                          variant="ghost"
                          fullWidth
                          onClick={() => setShowSearch(true)}
                          leftIcon={<Plus className="w-4 h-4" />}
                          className="border-2 border-dashed border-gray-300 hover:border-[#4FC3F7]"
                        >
                          Add activity to Day {day.day}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}

          {/* Add Day Button */}
          <Button
            variant="secondary"
            fullWidth
            leftIcon={<Plus className="w-5 h-5" />}
            className="border-2 border-dashed"
          >
            Add Another Day
          </Button>
        </div>
      </main>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search locations, restaurants, activities..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 text-lg outline-none"
                    autoFocus
                  />
                  <button onClick={() => setShowSearch(false)}>
                    <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {mockSearchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleAddItem(0, result)}
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={result.image} alt={result.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{result.name}</h4>
                          {result.isLocalGem && (
                            <Badge variant="warning" className="text-xs">Local Gem</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span>{result.type}</span>
                          <span>•</span>
                          <span>{result.duration}</span>
                          <span>•</span>
                          <span>{formatCost(result.cost)}</span>
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-[#4FC3F7]" />
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Optimize Modal */}
      <AnimatePresence>
        {showOptimizeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
            onClick={() => setShowOptimizeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <Card>
                <div className="text-center mb-6">
                  <Wand2 className="w-12 h-12 text-[#4FC3F7] mx-auto mb-3" />
                  <h2 className="text-xl font-bold">Go AI Optimization</h2>
                  <p className="text-gray-600">Let AI optimize your itinerary</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { id: 'walking', label: 'Minimize Walking', icon: Footprints },
                    { id: 'budget', label: 'Optimize Budget', icon: DollarSign },
                    { id: 'time', label: 'Save Time', icon: Clock },
                    { id: 'weather', label: 'Weather Smart', icon: Sun },
                  ].map(option => (
                    <button
                      key={option.id}
                      className="p-4 rounded-xl border-2 hover:border-[#4FC3F7] transition-colors text-left"
                    >
                      <option.icon className="w-6 h-6 text-[#4FC3F7] mb-2" />
                      <span className="font-medium text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="secondary" fullWidth onClick={() => setShowOptimizeModal(false)}>
                    Cancel
                  </Button>
                  <Button fullWidth leftIcon={<Sparkles className="w-4 h-4" />}>
                    Optimize Now
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

