import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  GripVertical, Plus, Minus, Trash2, Search, Clock, DollarSign,
  Sparkles, Wand2, Star, X, ChevronDown, ChevronUp,
  Car, Footprints, Sun, Lock, Crown, Heart,
  MapPin, RefreshCw, Filter, ArrowRight, Check, ArrowUpDown,
  Loader2, Zap, Leaf, Users, Camera, Coffee, TrendingUp,
  Gem, Timer, ArrowLeftRight
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import Header from '@/components/layouts/Header';
import { useAuthStore } from '@/stores/authStore';
import { PremiumModal } from '@/components/modals';
import { locationsAPI } from '@/services/api';

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

  // AI Optimize state
  const [optimizeStep, setOptimizeStep] = useState<'select' | 'loading' | 'results'>('select');
  const [selectedOptimization, setSelectedOptimization] = useState<string | null>(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [optimizedItinerary, setOptimizedItinerary] = useState<DayPlan[] | null>(null);
  const [optimizationChanges, setOptimizationChanges] = useState<Array<{
    type: 'moved' | 'swapped' | 'removed' | 'added';
    itemName: string;
    from?: string;
    to?: string;
    reason: string;
  }>>([]);
  // For replace search: track which item is being replaced
  const [replaceTarget, setReplaceTarget] = useState<{ dayIndex: number; itemId: string; itemName: string } | null>(null);

  // Smart Replace state
  const [showSmartReplace, setShowSmartReplace] = useState(false);
  const [smartReplaceTab, setSmartReplaceTab] = useState<'smart' | 'search'>('smart');
  const [smartReplaceLoading, setSmartReplaceLoading] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<{
    category: string;
    icon: any;
    color: string;
    items: Array<{
      id: string;
      name: string;
      type: string;
      durationMins: number;
      cost: number;
      rating: number;
      image: string;
      isLocalGem?: boolean;
      reason: string;
      comparison: {
        ratingDiff: number;
        costDiff: number;
        durationDiff: number;
      };
    }>;
  }[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [currentItemForReplace, setCurrentItemForReplace] = useState<ItineraryItem | null>(null);
  // Search card state (right panel)
  const [cardSearchQuery, setCardSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    name: string;
    type: string;
    durationMins: number;
    cost?: number;
    rating?: number;
    image: string;
    isLocalGem?: boolean;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Modal search state
  const [modalSearchResults, setModalSearchResults] = useState<typeof searchResults>([]);
  const [isModalSearching, setIsModalSearching] = useState(false);
  const [modalDayIndex, setModalDayIndex] = useState(0); // Which day opened the modal

  // Drag and drop state (using @dnd-kit)
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<typeof searchResults[0] | null>(null);
  // Store expanded days before drag to restore after
  const expandedDaysBeforeDrag = useRef<number[]>([]);

  // Configure pointer sensor with activation constraint to distinguish click from drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  // Map API location to our format
  const mapLocationToResult = (loc: any) => ({
    id: loc.id,
    name: loc.name,
    type: loc.category || 'attraction',
    durationMins: loc.estimatedDuration || 60,
    cost: loc.priceRange === 'free' ? 0 : loc.priceRange === 'budget' ? 50000 : loc.priceRange === 'moderate' ? 150000 : 300000,
    rating: loc.rating || 4.5,
    image: loc.imageUrl || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200',
    isLocalGem: loc.isLocalGem || false,
  });

  // Load default locations on mount
  useEffect(() => {
    const loadDefaultLocations = async () => {
      try {
        const response = await locationsAPI.getAll({ city: 'Danang' });
        const locations = response.data?.data || [];
        // Take first 8 locations as defaults
        setSearchResults(locations.slice(0, 8).map(mapLocationToResult));
      } catch (error) {
        console.error('Failed to load default locations:', error);
      }
    };
    loadDefaultLocations();
  }, []);

  // Fetch locations when search query changes
  useEffect(() => {
    const searchLocations = async () => {
      if (cardSearchQuery.length < 2) {
        // Reload defaults when search is cleared
        try {
          const response = await locationsAPI.getAll({ city: 'Danang' });
          const locations = response.data?.data || [];
          setSearchResults(locations.slice(0, 8).map(mapLocationToResult));
        } catch (error) {
          console.error('Failed to load locations:', error);
        }
        return;
      }

      setIsSearching(true);
      try {
        const response = await locationsAPI.search(cardSearchQuery, 'Danang');
        const locations = response.data?.data || [];
        setSearchResults(locations.map(mapLocationToResult));
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchLocations, 300);
    return () => clearTimeout(debounce);
  }, [cardSearchQuery]);

  // Fetch locations for modal search (both regular search modal and Smart Replace manual search)
  useEffect(() => {
    const searchModalLocations = async () => {
      if (!showSearch && !showSmartReplace) {
        setModalSearchResults([]);
        return;
      }

      if (searchQuery.length < 2) {
        // Load defaults when modal opens or search is cleared
        try {
          const response = await locationsAPI.getAll({ city: 'Danang' });
          const locations = response.data?.data || [];
          setModalSearchResults(locations.slice(0, 8).map(mapLocationToResult));
        } catch (error) {
          console.error('Failed to load locations:', error);
        }
        return;
      }

      setIsModalSearching(true);
      try {
        const response = await locationsAPI.search(searchQuery, 'Danang');
        const locations = response.data?.data || [];
        setModalSearchResults(locations.map(mapLocationToResult));
      } catch (error) {
        console.error('Modal search failed:', error);
        setModalSearchResults([]);
      } finally {
        setIsModalSearching(false);
      }
    };

    const debounce = setTimeout(searchModalLocations, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, showSearch, showSmartReplace]);

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
    setReplaceTarget(null);
  };

  // Insert item at a specific position within a day
  const handleInsertItem = (dayIndex: number, position: number, item: typeof mockSearchResults[0]) => {
    const newItem: ItineraryItem = {
      ...item,
      id: `inserted-${Date.now()}`, // Ensure unique ID
      transitMins: 15,
    };
    setItinerary(prev => prev.map((day, idx) => {
      if (idx !== dayIndex) return day;
      const newItems = [...day.items];
      newItems.splice(position, 0, newItem);
      return { ...day, items: newItems };
    }));
  };

  // Replace an existing item with a new one
  const handleReplaceItem = (item: typeof mockSearchResults[0]) => {
    if (!replaceTarget) return;
    const newItem: ItineraryItem = {
      ...item,
      id: `replaced-${Date.now()}`, // New unique ID
      transitMins: 15,
    };
    setItinerary(prev => prev.map((day, idx) => {
      if (idx !== replaceTarget.dayIndex) return day;
      return {
        ...day,
        items: day.items.map(existingItem =>
          existingItem.id === replaceTarget.itemId ? newItem : existingItem
        ),
      };
    }));
    setShowSearch(false);
    setReplaceTarget(null);
  };

  // Open Smart Replace modal
  const openSmartReplace = (dayIndex: number, item: ItineraryItem) => {
    setReplaceTarget({ dayIndex, itemId: item.id, itemName: item.name });
    setCurrentItemForReplace(item);
    setSmartReplaceTab('smart');
    setSelectedSuggestion(null);
    setShowComparison(false);
    setShowSmartReplace(true);
    setSmartReplaceLoading(true);

    // Get context: previous and next items
    const dayItems = itinerary[dayIndex].items;
    const itemIndex = dayItems.findIndex(i => i.id === item.id);
    const prevItem = itemIndex > 0 ? dayItems[itemIndex - 1] : null;
    const nextItem = itemIndex < dayItems.length - 1 ? dayItems[itemIndex + 1] : null;

    // Simulate AI generating smart suggestions
    setTimeout(() => {
      const suggestions = generateSmartSuggestions(item, prevItem, nextItem, dayIndex);
      setSmartSuggestions(suggestions);
      setSmartReplaceLoading(false);
    }, 1500);
  };

  // Generate smart suggestions based on context
  const generateSmartSuggestions = (
    currentItem: ItineraryItem,
    prevItem: ItineraryItem | null,
    nextItem: ItineraryItem | null,
    dayIndex: number
  ) => {
    // Mock data - in production this would come from an AI/ML service
    const mockSuggestionsByType: Record<string, Array<{
      id: string;
      name: string;
      type: string;
      durationMins: number;
      cost: number;
      rating: number;
      image: string;
      isLocalGem?: boolean;
    }>> = {
      food: [
        { id: 'sg1', name: 'Mì Quảng Bà Mua', type: 'food', durationMins: 45, cost: 40000, rating: 4.9, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200', isLocalGem: true },
        { id: 'sg2', name: 'Bánh Tráng Thịt Heo', type: 'food', durationMins: 60, cost: 80000, rating: 4.7, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200' },
        { id: 'sg3', name: 'Bún Chả Cá', type: 'food', durationMins: 40, cost: 35000, rating: 4.8, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200', isLocalGem: true },
        { id: 'sg4', name: 'Nhà Hàng Apsara', type: 'food', durationMins: 90, cost: 350000, rating: 4.6, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200' },
      ],
      beach: [
        { id: 'sg5', name: 'Non Nuoc Beach', type: 'beach', durationMins: 150, cost: 0, rating: 4.8, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200' },
        { id: 'sg6', name: 'Bãi Bụt Beach', type: 'beach', durationMins: 120, cost: 0, rating: 4.7, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200', isLocalGem: true },
        { id: 'sg7', name: 'An Bang Beach', type: 'beach', durationMins: 180, cost: 50000, rating: 4.9, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200' },
      ],
      nature: [
        { id: 'sg8', name: 'Son Tra Peninsula', type: 'nature', durationMins: 180, cost: 0, rating: 4.9, image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200' },
        { id: 'sg9', name: 'Ba Na Hills', type: 'nature', durationMins: 360, cost: 850000, rating: 4.6, image: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=200' },
        { id: 'sg10', name: 'Hai Van Pass', type: 'nature', durationMins: 240, cost: 200000, rating: 4.8, image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200' },
      ],
      shopping: [
        { id: 'sg11', name: 'Con Market', type: 'shopping', durationMins: 90, cost: 0, rating: 4.5, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200' },
        { id: 'sg12', name: 'Vincom Plaza', type: 'shopping', durationMins: 120, cost: 0, rating: 4.3, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200' },
      ],
      attraction: [
        { id: 'sg13', name: 'Linh Ung Pagoda', type: 'attraction', durationMins: 90, cost: 0, rating: 4.8, image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200' },
        { id: 'sg14', name: 'Museum of Cham Sculpture', type: 'attraction', durationMins: 90, cost: 60000, rating: 4.7, image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200' },
        { id: 'sg15', name: 'Asia Park', type: 'attraction', durationMins: 180, cost: 200000, rating: 4.5, image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=200' },
      ],
      museum: [
        { id: 'sg16', name: 'Da Nang Museum', type: 'museum', durationMins: 90, cost: 20000, rating: 4.4, image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200' },
        { id: 'sg17', name: '3D Art Museum', type: 'museum', durationMins: 120, cost: 150000, rating: 4.6, image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=200' },
      ],
    };

    const currentType = currentItem.type;
    const currentCost = currentItem.cost || 0;
    const currentRating = currentItem.rating || 4.5;
    const currentDuration = currentItem.durationMins;

    // Get suggestions for the same type and some variety
    const sameTypeSuggestions = mockSuggestionsByType[currentType] || [];
    const otherTypes = Object.keys(mockSuggestionsByType).filter(t => t !== currentType);
    const varietySuggestions = otherTypes.flatMap(t => mockSuggestionsByType[t]?.slice(0, 1) || []);

    // Build categorized suggestions with reasons
    const categories = [];

    // Similar Experiences
    const similar = sameTypeSuggestions.slice(0, 2).map(s => ({
      ...s,
      reason: `Similar ${currentType} experience with ${s.rating > currentRating ? 'higher' : 'comparable'} ratings`,
      comparison: {
        ratingDiff: Number((s.rating - currentRating).toFixed(1)),
        costDiff: s.cost - currentCost,
        durationDiff: s.durationMins - currentDuration,
      },
    }));
    if (similar.length > 0) {
      categories.push({
        category: 'Similar Experiences',
        icon: RefreshCw,
        color: 'text-blue-500',
        items: similar,
      });
    }

    // Higher Rated
    const higherRated = [...sameTypeSuggestions, ...varietySuggestions]
      .filter(s => s.rating > currentRating)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 2)
      .map(s => ({
        ...s,
        reason: `Rated ${(s.rating - currentRating).toFixed(1)} stars higher by travelers`,
        comparison: {
          ratingDiff: Number((s.rating - currentRating).toFixed(1)),
          costDiff: s.cost - currentCost,
          durationDiff: s.durationMins - currentDuration,
        },
      }));
    if (higherRated.length > 0) {
      categories.push({
        category: 'Higher Rated',
        icon: TrendingUp,
        color: 'text-green-500',
        items: higherRated,
      });
    }

    // Budget Friendly
    const budgetFriendly = [...sameTypeSuggestions, ...varietySuggestions]
      .filter(s => s.cost < currentCost)
      .sort((a, b) => a.cost - b.cost)
      .slice(0, 2)
      .map(s => ({
        ...s,
        reason: `Save ${((currentCost - s.cost) / 1000).toFixed(0)}k VND while enjoying a great experience`,
        comparison: {
          ratingDiff: Number((s.rating - currentRating).toFixed(1)),
          costDiff: s.cost - currentCost,
          durationDiff: s.durationMins - currentDuration,
        },
      }));
    if (budgetFriendly.length > 0) {
      categories.push({
        category: 'Budget Friendly',
        icon: DollarSign,
        color: 'text-emerald-500',
        items: budgetFriendly,
      });
    }

    // Local Hidden Gems
    const localGems = [...sameTypeSuggestions, ...varietySuggestions]
      .filter(s => s.isLocalGem)
      .slice(0, 2)
      .map(s => ({
        ...s,
        reason: 'A local favorite spot most tourists miss - authentic experience guaranteed',
        comparison: {
          ratingDiff: Number((s.rating - currentRating).toFixed(1)),
          costDiff: s.cost - currentCost,
          durationDiff: s.durationMins - currentDuration,
        },
      }));
    if (localGems.length > 0) {
      categories.push({
        category: 'Local Hidden Gems',
        icon: Gem,
        color: 'text-purple-500',
        items: localGems,
      });
    }

    // Best for Time of Day (context-aware)
    const timeContext = dayIndex === 0 ? 'morning' : 'afternoon';
    const timeBasedReason = prevItem?.type === 'food'
      ? `Perfect activity after a meal - ${nextItem ? `and leads nicely to ${nextItem.name}` : 'great way to continue your day'}`
      : nextItem?.type === 'food'
        ? `Ideal before your meal at ${nextItem.name} - builds up an appetite!`
        : `Great ${timeContext} activity that fits your schedule flow`;

    const timeBased = varietySuggestions.slice(0, 2).map(s => ({
      ...s,
      reason: timeBasedReason,
      comparison: {
        ratingDiff: Number((s.rating - currentRating).toFixed(1)),
        costDiff: s.cost - currentCost,
        durationDiff: s.durationMins - currentDuration,
      },
    }));
    if (timeBased.length > 0) {
      categories.push({
        category: 'Best for This Moment',
        icon: Timer,
        color: 'text-amber-500',
        items: timeBased,
      });
    }

    return categories;
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

  // Helper to get drop zone ID
  const getDropZoneId = (dayIndex: number, position: number) => `dropzone-${dayIndex}-${position}`;

  // @dnd-kit drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    // Find the card data from search results
    const card = searchResults.find(r => r.id === active.id);
    setActiveCard(card || null);
    // Save current expanded state and expand all days
    expandedDaysBeforeDrag.current = [...expandedDays];
    setExpandedDays(itinerary.map(day => day.day));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;

    if (over && activeCard) {
      // Parse the drop zone ID to get dayIndex and position
      const match = (over.id as string).match(/dropzone-(\d+)-(\d+)/);
      if (match) {
        const dayIndex = parseInt(match[1], 10);
        const position = parseInt(match[2], 10);
        handleInsertItem(dayIndex, position, {
          ...activeCard,
          cost: activeCard.cost ?? 0,
          rating: activeCard.rating ?? 4.5,
        });
      }
    }

    // Reset drag state
    setActiveId(null);
    setActiveCard(null);
    // Restore expanded days to previous state
    setExpandedDays(expandedDaysBeforeDrag.current);
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

  // Draggable search result card component
  const DraggableCard = ({ result }: { result: typeof searchResults[0] }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: result.id,
    });

    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={() => {
          if (!isDragging) {
            handleAddItem(0, {
              ...result,
              cost: result.cost ?? 0,
              rating: result.rating ?? 4.5,
            });
          }
        }}
        className={`flex items-center gap-2 p-2 rounded-lg bg-white hover:bg-gray-50 cursor-grab active:cursor-grabbing transition-colors border-2 border-gray-100 hover:border-sky-primary ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-200">
          <img src={result.image} alt={result.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h4 className="font-medium text-sm truncate">{result.name}</h4>
            {result.isLocalGem && (
              <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="capitalize">{result.type}</span>
            <span>•</span>
            <span>{formatDuration(result.durationMins)}</span>
          </div>
        </div>
        <Plus className="w-4 h-4 text-sky-primary shrink-0" />
      </div>
    );
  };

  // Droppable zone component
  const DropZone = ({ dayIndex, position }: { dayIndex: number; position: number }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: getDropZoneId(dayIndex, position),
    });

    return (
      <div
        ref={setNodeRef}
        className={`mx-4 transition-all duration-200 ${
          activeId
            ? isOver
              ? 'h-16 border-2 border-dashed border-sky-primary bg-sky-primary/10 rounded-lg flex items-center justify-center'
              : 'h-8 border-2 border-dashed border-gray-200 rounded-lg my-1'
            : 'h-0'
        }`}
      >
        {activeId && isOver && (
          <span className="text-sky-primary text-sm font-medium flex items-center gap-1">
            <Plus className="w-4 h-4" /> Drop here
          </span>
        )}
      </div>
    );
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gray-50">
        {/* Global Header */}
        <Header />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Itinerary Timeline - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
          {itinerary.map((day, dayIndex) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.1 }}
            >
              <Card className="overflow-hidden">
                {/* Day Header */}
                <div className="flex items-center justify-between p-4 transition-colors">
                  <button
                    onClick={() => toggleDay(day.day)}
                    className="flex items-center gap-4 flex-1"
                  >
                    <div className="w-12 h-12 bg-sky-primary text-white rounded-xl flex items-center justify-center font-bold text-lg border-2 border-black">
                      {day.day}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg">Day {day.day}</h3>
                      <p className="text-sm text-gray-600">{day.title} • {day.items.length} activities</p>
                    </div>
                  </button>

                  {/* Day time summary */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 rounded-3xl px-3 py-2 hover:bg-gray-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAdjustStartTime(dayIndex, -30); }}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-300 hover:bg-sky-50 text-gray-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <div className="text-center min-w-25">
                        <div className="text-xs text-gray-500">Start</div>
                        <div className="font-mono text-sm font-medium">{formatTime(day.startTime)}</div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAdjustStartTime(dayIndex, 30); }}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-300 hover:bg-sky-50 text-gray-600"
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
                        {/* Drop zone before first item */}
                        <DropZone dayIndex={dayIndex} position={0} />

                        {day.items.map((item, itemIndex) => {
                          const times = calculateActivityTime(day.items, itemIndex, day.startTime);
                          const isLast = itemIndex === day.items.length - 1;

                          return (
                            <div key={item.id}>
                              <Reorder.Item
                                value={item}
                                className="bg-white"
                              >
                              <div className="flex group">
                                {/* Timeline Column */}
                                <div className="flex flex-col items-center w-20 shrink-0 py-3">
                                  {/* Start Time */}
                                  <div className="text-center mb-2">
                                    <span className="font-mono text-xs font-medium text-sky-primary">
                                      {formatTime(times.start)}
                                    </span>
                                  </div>

                                  {/* Timeline dot and line */}
                                  <div className="flex flex-col items-center flex-1">
                                    <div className="w-3 h-3 rounded-full bg-sky-primary border-2 border-white shadow-sm" />
                                    <div className="w-0.5 flex-1 bg-sky-primary/30 my-1" />
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
                                  <div className="flex items-stretch gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-sky-primary transition-all bg-white hover:shadow-md">
                                    {/* Drag Handle */}
                                    <div className="flex items-center cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors">
                                      <GripVertical className="w-5 h-5" />
                                    </div>

                                    {/* Image */}
                                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 border-gray-100">
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
                                    <div className="flex flex-col items-center justify-center min-w-20 px-2">
                                      <button
                                        onClick={() => handleAdjustDuration(dayIndex, item.id, 15)}
                                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-sky-primary/10 text-gray-400 hover:text-sky-primary transition-colors"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                      <div className="text-center my-1">
                                        <Clock className="w-4 h-4 text-sky-primary mx-auto mb-0.5" />
                                        <span className="font-mono text-sm font-medium">{formatDuration(item.durationMins)}</span>
                                      </div>
                                      <button
                                        onClick={() => handleAdjustDuration(dayIndex, item.id, -15)}
                                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-sky-primary/10 text-gray-400 hover:text-sky-primary transition-colors"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col items-center justify-center gap-1 pl-2 border-l border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openSmartReplace(dayIndex, item)}
                                        title="Smart Replace"
                                        className="p-2"
                                      >
                                        <RefreshCw className="w-4 h-4" />
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

                              {/* Drop zone after this item */}
                              <DropZone dayIndex={dayIndex} position={itemIndex + 1} />
                            </div>
                          );
                        })}
                      </Reorder.Group>

                      {/* Add to Day Button */}
                      <div className="p-4 border-t">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setModalDayIndex(dayIndex);
                            setShowSearch(true);
                          }}
                          leftIcon={<Plus className="w-4 h-4" />}
                          className="w-full border-2 border-dashed border-gray-300 hover:border-sky-primary"
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

          {/* Right Column - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Complete Trip Card */}
              <Card>
                <Button
                  onClick={() => navigate(`/itinerary/${id}`)}
                  className="w-full"
                  size="lg"
                >
                  Complete Trip
                </Button>
                <div className="mt-4 flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Heart className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    Wherever you go, we encourage supporting local businesses and vendors. Your purchase means a lot to the community.
                  </p>
                </div>
              </Card>

              {/* Optimizations Card */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-sky-primary" />
                    Optimizations
                  </h2>
                  {!isPremium && (
                    <Badge variant="ghost" className="text-xs">
                      <Lock className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>

                {/* AI Feature Cards */}
                <div className="space-y-3">
                  {/* Go AI Optimize */}
                  <button
                    onClick={() => {
                      setOptimizeStep('select');
                      setSelectedOptimization(null);
                      setShowMoreOptions(false);
                      setShowOptimizeModal(true);
                    }}
                    className="w-full p-3 rounded-lg border-2 border-gray-200 hover:border-sky-primary hover:bg-sky-primary/5 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-sky-300 flex items-center justify-center shrink-0">
                        <Wand2 className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">Go AI Optimize</h3>
                          <Badge variant="success" className="text-[10px] px-1.5 py-0">NEW</Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">Optimize route & timing</p>
                      </div>
                    </div>
                  </button>

                  {/* Localize by Anva */}
                  <button
                    onClick={() => {
                      if (!isPremium) {
                        setPremiumFeature('Localize by Anva');
                        setShowPremiumModal(true);
                      }
                    }}
                    className="w-full p-3 rounded-lg border-2 border-gray-200 hover:border-sky-primary hover:bg-sky-primary/5 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-linear-to-br from-sky-500 to-purple-100 flex items-center justify-center shrink-0">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">Localize by Anva</h3>
                          {!isPremium && <Lock className="w-3 h-3 text-gray-400" />}
                        </div>
                        <p className="text-xs text-gray-500 truncate">Find authentic local gems</p>
                      </div>
                    </div>
                  </button>

                  {/* Smart Search */}
                  <button
                    onClick={() => {
                      if (!isPremium) {
                        setPremiumFeature('Smart Search');
                        setShowPremiumModal(true);
                      }
                    }}
                    className="w-full p-3 rounded-lg border-2 border-gray-200 hover:border-sky-primary hover:bg-sky-primary/5 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-linear-to-br from-sky-500 to-teal-100 flex items-center justify-center shrink-0">
                        <Search className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">Smart Search</h3>
                          {!isPremium && <Lock className="w-3 h-3 text-gray-400" />}
                        </div>
                        <p className="text-xs text-gray-500 truncate">Filter by budget, distance</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Upgrade CTA */}
                {!isPremium && (
                  <div className="mt-4 p-3 rounded-lg bg-linear-to-br from-sky-primary/10 to-sky-light/10 border border-sky-primary/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-4 h-4 text-sky-primary" />
                      <h3 className="font-semibold text-sm">Optimize for perfection</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Smart optimization, local tips & advanced filters.
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setPremiumFeature('');
                        setShowPremiumModal(true);
                      }}
                    >
                      Upgrade to Premium
                    </Button>
                  </div>
                )}

                {/* Quick Tips */}
              </Card>

              {/* Add Location Card */}
              <Card className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Plus className="w-5 h-5 text-sky-primary" />
                    Add Location
                  </h2>
                </div>

                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search cafes, restaurants, attractions..."
                    value={cardSearchQuery}
                    onChange={e => setCardSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-sky-primary focus:outline-none transition-colors"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-sky-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Search Results */}
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {searchResults.length === 0 && !isSearching && cardSearchQuery.length >= 2 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No locations found for "{cardSearchQuery}"
                    </div>
                  )}
                  {searchResults.length === 0 && !isSearching && cardSearchQuery.length < 2 && (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      Loading suggestions...
                    </div>
                  )}
                  {searchResults.map((result) => (
                    <DraggableCard key={result.id} result={result} />
                  ))}
                </div>

                {/* Drag hint */}
                {searchResults.length > 0 && (
                  <p className="text-xs text-gray-400 text-center mt-3">
                    {activeId
                      ? 'Drop on a highlighted zone to add'
                      : 'Click to add or drag to place anywhere'}
                  </p>
                )}
              </Card>
            </div>
          </div>
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
            onClick={() => {
              setShowSearch(false);
              setReplaceTarget(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <Card>
                {/* Header with replace context */}
                {replaceTarget && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800">
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-sm">
                        Replacing <strong>{replaceTarget.itemName}</strong>
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={replaceTarget ? "Search for a replacement..." : "Search locations, restaurants, activities..."}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 text-lg outline-none"
                    autoFocus
                  />
                  <button onClick={() => {
                    setShowSearch(false);
                    setReplaceTarget(null);
                  }}>
                    <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>

                {/* Premium Smart Filter Hint */}
                <div className="mb-4 p-3 bg-linear-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Filter className="w-4 h-4" />
                      <span className="text-sm">Smart Filters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setPremiumFeature('Smart Search Filters');
                          setShowPremiumModal(true);
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors"
                      >
                        <MapPin className="w-3 h-3" />
                        Within 2km
                        <Lock className="w-3 h-3 ml-1" />
                      </button>
                      <button
                        onClick={() => {
                          setPremiumFeature('Smart Search Filters');
                          setShowPremiumModal(true);
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors"
                      >
                        <DollarSign className="w-3 h-3" />
                        Similar Budget
                        <Lock className="w-3 h-3 ml-1" />
                      </button>
                      <button
                        onClick={() => {
                          setPremiumFeature('Smart Search Filters');
                          setShowPremiumModal(true);
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors"
                      >
                        Same Category
                        <Lock className="w-3 h-3 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {isModalSearching && (
                    <div className="text-center py-4 text-gray-400">
                      <div className="w-6 h-6 border-2 border-sky-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Searching...
                    </div>
                  )}
                  {!isModalSearching && modalSearchResults.length === 0 && searchQuery.length >= 2 && (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>No results found for "{searchQuery}"</p>
                      <p className="text-sm mt-1">Try different keywords</p>
                    </div>
                  )}
                  {modalSearchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-sky-primary"
                      onClick={() => {
                        const itemWithDefaults = {
                          ...result,
                          cost: result.cost ?? 0,
                          rating: result.rating ?? 4.5,
                        };
                        replaceTarget ? handleReplaceItem(itemWithDefaults) : handleAddItem(modalDayIndex, itemWithDefaults);
                      }}
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-200">
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
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-primary/10 text-sky-primary">
                        {replaceTarget ? <ArrowRight className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
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
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <Card>
                {/* Step 1: Select Optimization */}
                {optimizeStep === 'select' && (
                  <>
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-sky-300 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Wand2 className="w-7 h-7 text-white" />
                      </div>
                      <h2 className="text-xl font-bold">Go AI Optimization</h2>
                      <p className="text-gray-600 text-sm">What would you like to optimize?</p>
                    </div>

                    {/* Primary Options */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {[
                        { id: 'route', label: 'Shortest Route', icon: MapPin, desc: 'Minimize travel time' },
                        { id: 'budget', label: 'Save Money', icon: DollarSign, desc: 'Find cheaper alternatives' },
                        { id: 'time', label: 'Save Time', icon: Clock, desc: 'Efficient scheduling' },
                        { id: 'walking', label: 'Less Walking', icon: Footprints, desc: 'Reduce walking distance' },
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => setSelectedOptimization(option.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            selectedOptimization === option.id
                              ? 'border-sky-primary bg-sky-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <option.icon className={`w-5 h-5 mb-2 ${selectedOptimization === option.id ? 'text-sky-primary' : 'text-gray-500'}`} />
                          <span className="font-medium text-sm block">{option.label}</span>
                          <span className="text-xs text-gray-500">{option.desc}</span>
                        </button>
                      ))}
                    </div>

                    {/* Show More Options */}
                    <AnimatePresence>
                      {showMoreOptions && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            {[
                              { id: 'weather', label: 'Weather Smart', icon: Sun, desc: 'Avoid bad weather' },
                              { id: 'energy', label: 'Energy Saving', icon: Zap, desc: 'Balance activity levels' },
                              { id: 'eco', label: 'Eco Friendly', icon: Leaf, desc: 'Lower carbon footprint' },
                              { id: 'crowd', label: 'Avoid Crowds', icon: Users, desc: 'Less busy times' },
                              { id: 'photo', label: 'Best Photos', icon: Camera, desc: 'Optimal lighting times' },
                              { id: 'foodie', label: 'Foodie Focus', icon: Coffee, desc: 'Best meal timings' },
                            ].map(option => (
                              <button
                                key={option.id}
                                onClick={() => setSelectedOptimization(option.id)}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${
                                  selectedOptimization === option.id
                                    ? 'border-sky-primary bg-sky-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <option.icon className={`w-5 h-5 mb-2 ${selectedOptimization === option.id ? 'text-sky-primary' : 'text-gray-500'}`} />
                                <span className="font-medium text-sm block">{option.label}</span>
                                <span className="text-xs text-gray-500">{option.desc}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={() => setShowMoreOptions(!showMoreOptions)}
                      className="w-full py-2 text-sm text-sky-primary font-medium hover:underline flex items-center justify-center gap-1 mb-4"
                    >
                      {showMoreOptions ? 'Show Less' : 'Show More Options'}
                      <ChevronDown className={`w-4 h-4 transition-transform ${showMoreOptions ? 'rotate-180' : ''}`} />
                    </button>

                    <div className="flex gap-3">
                      <Button variant="secondary" className="flex-1" onClick={() => setShowOptimizeModal(false)}>
                        Cancel
                      </Button>
                      <Button
                        className="flex-1"
                        disabled={!selectedOptimization}
                        leftIcon={<Sparkles className="w-4 h-4" />}
                        onClick={() => {
                          setOptimizeStep('loading');
                          // Simulate AI processing
                          setTimeout(() => {
                            // Mock optimized data based on selection
                            const mockChanges = [
                              { type: 'moved' as const, itemName: 'Bánh Mì Bà Lan', from: 'Day 1, #2', to: 'Day 1, #3', reason: 'Better to visit Han Market first while it\'s less crowded, then grab breakfast nearby.' },
                              { type: 'swapped' as const, itemName: 'Han Market', from: 'Day 1, #3', to: 'Day 1, #2', reason: 'Morning is the best time to visit the market for fresh produce and fewer tourists.' },
                              { type: 'moved' as const, itemName: 'Beach Club Relaxation', from: 'Day 1, #5', to: 'Day 1, #4', reason: 'Moving beach time earlier takes advantage of calmer afternoon waters.' },
                            ];

                            // Create optimized itinerary (swap items 2 and 3 in day 1)
                            const optimized = JSON.parse(JSON.stringify(itinerary)) as DayPlan[];
                            const day1Items = optimized[0].items;
                            [day1Items[1], day1Items[2]] = [day1Items[2], day1Items[1]];
                            [day1Items[3], day1Items[4]] = [day1Items[4], day1Items[3]];

                            setOptimizedItinerary(optimized);
                            setOptimizationChanges(mockChanges);
                            setOptimizeStep('results');
                          }, 2000);
                        }}
                      >
                        Optimize Now
                      </Button>
                    </div>
                  </>
                )}

                {/* Step 2: Loading */}
                {optimizeStep === 'loading' && (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-sky-300 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Wand2 className="w-8 h-8 text-white" />
                    </div>
                    <Loader2 className="w-6 h-6 text-sky-primary animate-spin mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">Optimizing Your Itinerary</h3>
                    <p className="text-gray-500 text-sm">
                      Analyzing routes, timings, and local insights...
                    </p>
                  </div>
                )}

                {/* Step 3: Results */}
                {optimizeStep === 'results' && optimizedItinerary && (
                  <>
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Check className="w-7 h-7 text-green-600" />
                      </div>
                      <h2 className="text-xl font-bold">Optimization Complete!</h2>
                      <p className="text-gray-600 text-sm">We found {optimizationChanges.length} improvements for your trip</p>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <p className="text-lg font-bold text-green-600">-25 min</p>
                        <p className="text-xs text-gray-600">Travel Time</p>
                      </div>
                      <div className="text-center p-3 bg-sky-50 rounded-xl">
                        <p className="text-lg font-bold text-sky-600">Better</p>
                        <p className="text-xs text-gray-600">Route Flow</p>
                      </div>
                      <div className="text-center p-3 bg-amber-50 rounded-xl">
                        <p className="text-lg font-bold text-amber-600">Optimal</p>
                        <p className="text-xs text-gray-600">Timing</p>
                      </div>
                    </div>

                    {/* Changes List */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4 text-sky-primary" />
                        Proposed Changes
                      </h3>
                      <div className="space-y-3">
                        {optimizationChanges.map((change, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border-2 border-sky-primary/30 bg-sky-primary/5"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-sky-primary text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">{change.itemName}</span>
                                  <Badge variant="secondary" className="text-[10px]">
                                    {change.type === 'moved' ? 'Moved' : change.type === 'swapped' ? 'Swapped' : change.type}
                                  </Badge>
                                </div>
                                {change.from && change.to && (
                                  <p className="text-xs text-gray-600 mb-1">
                                    {change.from} → {change.to}
                                  </p>
                                )}
                                <p className="text-xs text-gray-700">{change.reason}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => {
                          setOptimizedItinerary(null);
                          setOptimizationChanges([]);
                          setShowOptimizeModal(false);
                        }}
                      >
                        Discard
                      </Button>
                      <Button
                        className="flex-1"
                        leftIcon={<Check className="w-4 h-4" />}
                        onClick={() => {
                          setItinerary(optimizedItinerary);
                          setOptimizedItinerary(null);
                          setOptimizationChanges([]);
                          setShowOptimizeModal(false);
                        }}
                      >
                        Accept Changes
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Replace Modal */}
      <AnimatePresence>
        {showSmartReplace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
            onClick={() => {
              setShowSmartReplace(false);
              setReplaceTarget(null);
              setCurrentItemForReplace(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <Card className="flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-300 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Smart Replace</h2>
                      {currentItemForReplace && (
                        <p className="text-sm text-gray-500">
                          Replacing: <span className="font-medium text-gray-700">{currentItemForReplace.name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowSmartReplace(false);
                      setReplaceTarget(null);
                      setCurrentItemForReplace(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 py-3 border-b shrink-0">
                  <button
                    onClick={() => setSmartReplaceTab('smart')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      smartReplaceTab === 'smart'
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Smart Suggestions
                  </button>
                  <button
                    onClick={() => setSmartReplaceTab('search')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      smartReplaceTab === 'search'
                        ? 'bg-gray-200 text-gray-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    Manual Search
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto py-4">
                  {/* Smart Suggestions Tab */}
                  {smartReplaceTab === 'smart' && (
                    <>
                      {smartReplaceLoading ? (
                        <div className="py-12 text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-300 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                          <Loader2 className="w-5 h-5 text-purple-500 animate-spin mx-auto mb-3" />
                          <p className="font-medium text-gray-800">Analyzing your itinerary...</p>
                          <p className="text-sm text-gray-500 mt-1">Finding the best alternatives based on context</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {smartSuggestions.map((category) => {
                            const CategoryIcon = category.icon;
                            return (
                              <div key={category.category}>
                                <div className="flex items-center gap-2 mb-3">
                                  <CategoryIcon className={`w-4 h-4 ${category.color}`} />
                                  <h3 className="font-semibold text-sm">{category.category}</h3>
                                </div>
                                <div className="space-y-2">
                                  {category.items.map((suggestion) => (
                                    <div
                                      key={suggestion.id}
                                      onClick={() => {
                                        setSelectedSuggestion(suggestion.id);
                                        setShowComparison(true);
                                      }}
                                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                        selectedSuggestion === suggestion.id
                                          ? 'border-purple-500 bg-purple-50'
                                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                      }`}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                          <img src={suggestion.image} alt={suggestion.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-sm">{suggestion.name}</h4>
                                            {suggestion.isLocalGem && (
                                              <Badge variant="warning" className="text-[10px]">
                                                <Star className="w-2.5 h-2.5 mr-0.5" />
                                                Gem
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{suggestion.reason}</p>
                                          <div className="flex items-center gap-3 text-xs">
                                            <span className="flex items-center gap-1 text-gray-500">
                                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                              {suggestion.rating}
                                              {suggestion.comparison.ratingDiff !== 0 && (
                                                <span className={suggestion.comparison.ratingDiff > 0 ? 'text-green-600' : 'text-red-500'}>
                                                  ({suggestion.comparison.ratingDiff > 0 ? '+' : ''}{suggestion.comparison.ratingDiff})
                                                </span>
                                              )}
                                            </span>
                                            <span className="flex items-center gap-1 text-gray-500">
                                              <DollarSign className="w-3 h-3" />
                                              {formatCost(suggestion.cost)}
                                              {suggestion.comparison.costDiff !== 0 && (
                                                <span className={suggestion.comparison.costDiff < 0 ? 'text-green-600' : 'text-red-500'}>
                                                  ({suggestion.comparison.costDiff < 0 ? '' : '+'}{(suggestion.comparison.costDiff / 1000).toFixed(0)}k)
                                                </span>
                                              )}
                                            </span>
                                            <span className="flex items-center gap-1 text-gray-500">
                                              <Clock className="w-3 h-3" />
                                              {formatDuration(suggestion.durationMins)}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="shrink-0">
                                          <ArrowLeftRight className={`w-5 h-5 ${selectedSuggestion === suggestion.id ? 'text-purple-500' : 'text-gray-300'}`} />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                          {smartSuggestions.length === 0 && !smartReplaceLoading && (
                            <div className="text-center py-8 text-gray-500">
                              <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-50" />
                              <p>No smart suggestions available</p>
                              <p className="text-sm mt-1">Try using manual search instead</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Manual Search Tab */}
                  {smartReplaceTab === 'search' && (
                    <div>
                      {/* Search Input */}
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search for a replacement..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                          autoFocus
                        />
                      </div>

                      {/* Search Results */}
                      <div className="space-y-2">
                        {isModalSearching && (
                          <div className="text-center py-4 text-gray-400">
                            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            Searching...
                          </div>
                        )}
                        {!isModalSearching && modalSearchResults.length === 0 && searchQuery.length >= 2 && (
                          <div className="text-center py-8 text-gray-500">
                            <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p>No results found for "{searchQuery}"</p>
                          </div>
                        )}
                        {modalSearchResults.map((result) => (
                          <div
                            key={result.id}
                            onClick={() => {
                              const itemWithDefaults = {
                                ...result,
                                cost: result.cost ?? 0,
                                rating: result.rating ?? 4.5,
                              };
                              handleReplaceItem(itemWithDefaults);
                              setShowSmartReplace(false);
                              setCurrentItemForReplace(null);
                            }}
                            className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 cursor-pointer transition-all"
                          >
                            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                              <img src={result.image} alt={result.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">{result.name}</h4>
                                {result.isLocalGem && (
                                  <Badge variant="warning" className="text-[10px]">Gem</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span className="capitalize">{result.type}</span>
                                <span>•</span>
                                <span>{formatDuration(result.durationMins)}</span>
                                <span>•</span>
                                <span>{formatCost(result.cost)}</span>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-purple-500 shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Comparison View */}
                <AnimatePresence>
                  {showComparison && selectedSuggestion && currentItemForReplace && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t pt-4 shrink-0"
                    >
                      {(() => {
                        const suggestion = smartSuggestions
                          .flatMap(c => c.items)
                          .find(s => s.id === selectedSuggestion);
                        if (!suggestion) return null;

                        return (
                          <div>
                            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                              <ArrowLeftRight className="w-4 h-4 text-purple-500" />
                              Comparison
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              {/* Current */}
                              <div className="p-3 rounded-xl bg-gray-100 border-2 border-gray-200">
                                <p className="text-xs text-gray-500 mb-2 font-medium">CURRENT</p>
                                <p className="font-semibold text-sm mb-2">{currentItemForReplace.name}</p>
                                <div className="space-y-1 text-xs text-gray-600">
                                  <div className="flex justify-between">
                                    <span>Rating</span>
                                    <span className="font-medium">{currentItemForReplace.rating || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Cost</span>
                                    <span className="font-medium">{formatCost(currentItemForReplace.cost)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Duration</span>
                                    <span className="font-medium">{formatDuration(currentItemForReplace.durationMins)}</span>
                                  </div>
                                </div>
                              </div>
                              {/* New */}
                              <div className="p-3 rounded-xl bg-purple-50 border-2 border-purple-300">
                                <p className="text-xs text-purple-600 mb-2 font-medium">REPLACEMENT</p>
                                <p className="font-semibold text-sm mb-2">{suggestion.name}</p>
                                <div className="space-y-1 text-xs text-gray-600">
                                  <div className="flex justify-between">
                                    <span>Rating</span>
                                    <span className="font-medium flex items-center gap-1">
                                      {suggestion.rating}
                                      {suggestion.comparison.ratingDiff !== 0 && (
                                        <span className={`text-[10px] ${suggestion.comparison.ratingDiff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                          {suggestion.comparison.ratingDiff > 0 ? '↑' : '↓'}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Cost</span>
                                    <span className="font-medium flex items-center gap-1">
                                      {formatCost(suggestion.cost)}
                                      {suggestion.comparison.costDiff !== 0 && (
                                        <span className={`text-[10px] ${suggestion.comparison.costDiff < 0 ? 'text-green-600' : 'text-red-500'}`}>
                                          {suggestion.comparison.costDiff < 0 ? '↓' : '↑'}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Duration</span>
                                    <span className="font-medium">{formatDuration(suggestion.durationMins)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => {
                                  setSelectedSuggestion(null);
                                  setShowComparison(false);
                                }}
                              >
                                Back
                              </Button>
                              <Button
                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                                leftIcon={<Check className="w-4 h-4" />}
                                onClick={() => {
                                  handleReplaceItem({
                                    id: suggestion.id,
                                    name: suggestion.name,
                                    type: suggestion.type,
                                    durationMins: suggestion.durationMins,
                                    cost: suggestion.cost,
                                    rating: suggestion.rating,
                                    image: suggestion.image,
                                    isLocalGem: suggestion.isLocalGem,
                                  });
                                  setShowSmartReplace(false);
                                  setSelectedSuggestion(null);
                                  setShowComparison(false);
                                  setCurrentItemForReplace(null);
                                }}
                              >
                                Replace
                              </Button>
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
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

      {/* Drag Overlay - Renders in a portal, appears on top of everything */}
      <DragOverlay>
        {activeCard ? (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white border-2 border-sky-primary shadow-xl w-[240px] cursor-grabbing">
            <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-200">
              <img src={activeCard.image} alt={activeCard.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h4 className="font-medium text-sm truncate">{activeCard.name}</h4>
                {activeCard.isLocalGem && (
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="capitalize">{activeCard.type}</span>
                <span>•</span>
                <span>{formatDuration(activeCard.durationMins)}</span>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
      </div>
    </DndContext>
  );
}

