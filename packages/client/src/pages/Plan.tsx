import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  GripVertical, Plus, Minus, Trash2, Search, Clock, DollarSign,
  Sparkles, Wand2, Star, X, ChevronDown, ChevronUp,
  Car, Footprints, Sun, Lock, Crown
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { PremiumModal } from '@/components/modals';

interface ItineraryItem {
  id: string;
  name: string;
  type: string;
  durationMins: number; // Duration in minutes for easy calculation
  image: string;
  description?: string;
  cost?: number;
  rating?: number;
  isLocalGem?: boolean;
  transitMins?: number; // Transit time to next activity
}

interface DayPlan {
  day: number;
  title: string;
  startTime: number; // Start time in minutes from midnight (e.g., 360 = 6:00 AM)
  items: ItineraryItem[];
}

// Helper to format minutes to time string (e.g., 390 -> "6:30 AM")
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
};

// Helper to format duration (e.g., 90 -> "1h 30m")
const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Calculate activity times based on position and cumulative durations
const calculateActivityTime = (
  items: ItineraryItem[],
  itemIndex: number,
  startTime: number
): { start: number; end: number } => {
  let currentTime = startTime;
  for (let i = 0; i < itemIndex; i++) {
    currentTime += items[i].durationMins + (items[i].transitMins || 15);
  }
  return {
    start: currentTime,
    end: currentTime + items[itemIndex].durationMins,
  };
};

// Mock data with duration in minutes
const mockItinerary: DayPlan[] = [
  {
    day: 1,
    title: 'Beach Vibes & Local Flavors',
    startTime: 360, // 6:00 AM
    items: [
      { id: '1', name: 'Sunrise at My Khe Beach', type: 'beach', durationMins: 120, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200', rating: 4.8, transitMins: 15 },
      { id: '2', name: 'Bánh Mì Bà Lan', type: 'food', durationMins: 45, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200', cost: 30000, rating: 4.9, isLocalGem: true, transitMins: 20 },
      { id: '3', name: 'Han Market', type: 'shopping', durationMins: 120, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200', cost: 0, rating: 4.5, transitMins: 15 },
      { id: '4', name: 'Madame Lan Restaurant', type: 'food', durationMins: 90, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200', cost: 250000, rating: 4.7, transitMins: 20 },
      { id: '5', name: 'Beach Club Relaxation', type: 'beach', durationMins: 180, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200', cost: 150000, rating: 4.6, transitMins: 25 },
      { id: '6', name: 'Bé Mặn Seafood', type: 'food', durationMins: 120, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200', cost: 400000, rating: 4.8 },
    ],
  },
  {
    day: 2,
    title: 'Mountains & Mysticism',
    startTime: 360, // 6:00 AM
    items: [
      { id: '7', name: 'Marble Mountains', type: 'nature', durationMins: 240, image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200', cost: 40000, rating: 4.9, transitMins: 30 },
      { id: '8', name: 'The Fig Restaurant', type: 'food', durationMins: 90, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200', cost: 300000, rating: 4.6, transitMins: 20 },
      { id: '9', name: 'Cham Museum', type: 'museum', durationMins: 120, image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200', cost: 60000, rating: 4.7, transitMins: 15 },
      { id: '10', name: 'Dragon Bridge Show', type: 'attraction', durationMins: 60, image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=200', cost: 0, rating: 4.8 },
    ],
  },
];

const mockSearchResults = [
  { id: 's1', name: 'Son Tra Peninsula', type: 'nature', durationMins: 180, cost: 0, rating: 4.9, image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200' },
  { id: 's2', name: '43 Factory Coffee', type: 'cafe', durationMins: 60, cost: 80000, rating: 4.8, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200', isLocalGem: true },
  { id: 's3', name: 'Linh Ung Pagoda', type: 'temple', durationMins: 90, cost: 0, rating: 4.7, image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200' },
  { id: 's4', name: 'Ba Na Hills', type: 'attraction', durationMins: 360, cost: 850000, rating: 4.6, image: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=200' },
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
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState('');

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
      transitMins: 15, // Default transit time
    };
    setItinerary(prev => prev.map((day, idx) =>
      idx === dayIndex ? { ...day, items: [...day.items, newItem] } : day
    ));
    setShowSearch(false);
  };

  // Adjust duration of an activity (in 15-minute increments)
  const handleAdjustDuration = (dayIndex: number, itemId: string, delta: number) => {
    setItinerary(prev => prev.map((day, idx) => {
      if (idx !== dayIndex) return day;
      return {
        ...day,
        items: day.items.map(item => {
          if (item.id !== itemId) return item;
          const newDuration = Math.max(15, item.durationMins + delta);
          return { ...item, durationMins: newDuration };
        }),
      };
    }));
  };

  // Adjust day start time
  const handleAdjustStartTime = (dayIndex: number, delta: number) => {
    setItinerary(prev => prev.map((day, idx) => {
      if (idx !== dayIndex) return day;
      const newStartTime = Math.max(0, Math.min(1380, day.startTime + delta)); // Between 0:00 and 23:00
      return { ...day, startTime: newStartTime };
    }));
  };

  const formatCost = (cost?: number) => {
    if (!cost) return 'Free';
    return `${(cost / 1000).toFixed(0)}k VND`;
  };

  // Calculate total day duration including transit
  const getTotalDayDuration = (day: DayPlan) => {
    return day.items.reduce((total, item, idx) => {
      const transit = idx < day.items.length - 1 ? (item.transitMins || 15) : 0;
      return total + item.durationMins + transit;
    }, 0);
  };

  // Get day end time
  const getDayEndTime = (day: DayPlan) => {
    return day.startTime + getTotalDayDuration(day);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Customize Your Trip</h1>
              <p className="text-sm text-gray-600">Reorder activities and adjust durations to plan your perfect day</p>
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
              onClick={() => {
                if (!isPremium) {
                  setPremiumFeature('Go AI Optimization');
                  setShowPremiumModal(true);
                } else {
                  setShowOptimizeModal(true);
                }
              }}
              leftIcon={<Wand2 className="w-4 h-4" />}
              className="relative"
            >
              Go AI Optimize
              {!isPremium && <Lock className="w-3 h-3 ml-1 text-gray-400" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Star className="w-4 h-4" />}
              onClick={() => {
                if (!isPremium) {
                  setPremiumFeature('Localize by Anva');
                  setShowPremiumModal(true);
                }
              }}
            >
              Localize by Anva
              {!isPremium && <Lock className="w-3 h-3 ml-1 text-gray-400" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Search className="w-4 h-4" />}
              onClick={() => {
                if (!isPremium) {
                  setPremiumFeature('Smart Search');
                  setShowPremiumModal(true);
                }
              }}
            >
              Smart Search
              {!isPremium && <Lock className="w-3 h-3 ml-1 text-gray-400" />}
            </Button>
            {!isPremium && (
              <Button 
                size="sm" 
                variant="primary" 
                className="ml-4"
                onClick={() => {
                  setPremiumFeature('');
                  setShowPremiumModal(true);
                }}
              >
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
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <button
                    onClick={() => toggleDay(day.day)}
                    className="flex items-center gap-4 flex-1"
                  >
                    <div className="w-12 h-12 bg-[#4FC3F7] text-white rounded-xl flex items-center justify-center font-bold text-lg border-2 border-black">
                      {day.day}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg">Day {day.day}</h3>
                      <p className="text-sm text-gray-600">{day.title} • {day.items.length} activities</p>
                    </div>
                  </button>

                  {/* Day time summary */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAdjustStartTime(dayIndex, -30); }}
                        className="w-6 h-6 flex items-center justify-center rounded bg-white border border-gray-300 hover:bg-gray-50 text-gray-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <div className="text-center min-w-[100px]">
                        <div className="text-xs text-gray-500">Start</div>
                        <div className="font-mono text-sm font-medium">{formatTime(day.startTime)}</div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAdjustStartTime(dayIndex, 30); }}
                        className="w-6 h-6 flex items-center justify-center rounded bg-white border border-gray-300 hover:bg-gray-50 text-gray-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">End</div>
                      <div className="font-mono text-sm font-medium text-gray-600">{formatTime(getDayEndTime(day))}</div>
                    </div>
                    <button onClick={() => toggleDay(day.day)}>
                      {expandedDays.includes(day.day) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

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
                        className=""
                      >
                        {day.items.map((item, itemIndex) => {
                          const times = calculateActivityTime(day.items, itemIndex, day.startTime);
                          const isLast = itemIndex === day.items.length - 1;

                          return (
                            <Reorder.Item
                              key={item.id}
                              value={item}
                              className="bg-white"
                            >
                              <div className="flex group">
                                {/* Timeline Column */}
                                <div className="flex flex-col items-center w-20 flex-shrink-0 py-3">
                                  {/* Start Time */}
                                  <div className="text-center mb-2">
                                    <span className="font-mono text-xs font-medium text-[#4FC3F7]">
                                      {formatTime(times.start)}
                                    </span>
                                  </div>

                                  {/* Timeline dot and line */}
                                  <div className="flex flex-col items-center flex-1">
                                    <div className="w-3 h-3 rounded-full bg-[#4FC3F7] border-2 border-white shadow-sm" />
                                    <div className="w-0.5 flex-1 bg-[#4FC3F7]/30 my-1" />
                                  </div>

                                  {/* End Time */}
                                  <div className="text-center mt-2">
                                    <span className="font-mono text-xs text-gray-400">
                                      {formatTime(times.end)}
                                    </span>
                                  </div>
                                </div>

                                {/* Activity Card */}
                                <div className="flex-1 py-3 pr-4">
                                  <div className="flex items-stretch gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-[#4FC3F7] transition-all bg-white hover:shadow-md">
                                    {/* Drag Handle */}
                                    <div className="flex items-center cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors">
                                      <GripVertical className="w-5 h-5" />
                                    </div>

                                    {/* Image */}
                                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 border-gray-100">
                                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-semibold truncate">{item.name}</h4>
                                        {item.isLocalGem && (
                                          <Badge variant="warning" className="text-xs">
                                            <Star className="w-3 h-3 mr-0.5" />
                                            Local Gem
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
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

                                    {/* Duration Control */}
                                    <div className="flex flex-col items-center justify-center px-2 border-l border-gray-100">
                                      <button
                                        onClick={() => handleAdjustDuration(dayIndex, item.id, 15)}
                                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#4FC3F7]/10 text-gray-400 hover:text-[#4FC3F7] transition-colors"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                      <div className="text-center my-1">
                                        <Clock className="w-4 h-4 text-[#4FC3F7] mx-auto mb-0.5" />
                                        <span className="font-mono text-sm font-medium">{formatDuration(item.durationMins)}</span>
                                      </div>
                                      <button
                                        onClick={() => handleAdjustDuration(dayIndex, item.id, -15)}
                                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#4FC3F7]/10 text-gray-400 hover:text-[#4FC3F7] transition-colors"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col items-center justify-center gap-1 pl-2 border-l border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          if (!isPremium) {
                                            setPremiumFeature('Smart Search');
                                            setShowPremiumModal(true);
                                          }
                                        }}
                                        disabled={false}
                                        title="Find similar"
                                        className="p-2"
                                      >
                                        <Search className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveItem(dayIndex, item.id)}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Transit indicator */}
                                  {!isLast && (
                                    <div className="flex items-center gap-2 ml-4 mt-2 text-xs text-gray-400">
                                      <Car className="w-3 h-3" />
                                      <span>{item.transitMins || 15} min travel</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Reorder.Item>
                          );
                        })}
                      </Reorder.Group>

                      {/* Add to Day Button */}
                      <div className="p-4 border-t bg-gray-50">
                        <Button
                          variant="ghost"
                          onClick={() => setShowSearch(true)}
                          leftIcon={<Plus className="w-4 h-4" />}
                          className="w-full border-2 border-dashed border-gray-300 hover:border-[#4FC3F7]"
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
            leftIcon={<Plus className="w-5 h-5" />}
            className="w-full border-2 border-dashed"
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
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-[#4FC3F7]"
                      onClick={() => handleAddItem(0, result)}
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
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
                          <span className="capitalize">{result.type}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(result.durationMins)}
                          </span>
                          <span>•</span>
                          <span>{formatCost(result.cost)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#4FC3F7]/10 text-[#4FC3F7]">
                        <Plus className="w-5 h-5" />
                      </div>
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
                  <Button variant="secondary" className="flex-1" onClick={() => setShowOptimizeModal(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" leftIcon={<Sparkles className="w-4 h-4" />}>
                    Optimize Now
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature={premiumFeature}
      />
    </div>
  );
}

