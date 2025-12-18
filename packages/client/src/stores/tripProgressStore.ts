import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TripStop {
  id: string;
  name: string;
  type: string;
  time: string;
  duration: string;
  status: 'completed' | 'current' | 'upcoming' | 'skipped';
  address: string;
  image: string;
  authenticityScore?: number; // 0-100 AI-calculated authenticity
  transport?: {
    mode: 'grab_bike' | 'grab_car' | 'walk';
    duration: string;
    cost?: number;
  };
}

export interface TripProgress {
  tripId: string;
  tripName: string;
  tripTheme: string;
  currentDay: number;
  totalDays: number;
  stops: TripStop[];
  dayCompleted: boolean;
  tripCompleted: boolean;
  startedAt: string;
  lastUpdated: string;
}

// Multi-day stop templates
type DayStops = Record<number, TripStop[]>;

const multiDayTemplates: Record<string, DayStops> = {
  'Beach & Culture Explorer': {
    1: [
      { id: '1-1', name: 'Sunrise at My Khe Beach', type: 'beach', time: '6:00', duration: '2h', status: 'upcoming', address: 'My Khe Beach, Phuoc My, Son Tra, Da Nang', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300', authenticityScore: 88 },
      { id: '1-2', name: 'Bánh Mì Bà Lan', type: 'food', time: '8:30', duration: '45m', status: 'upcoming', address: '115 Nguyen Chi Thanh, Hai Chau, Da Nang', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300', transport: { mode: 'grab_bike', duration: '10 min', cost: 25000 }, authenticityScore: 96 },
      { id: '1-3', name: 'Han Market', type: 'shopping', time: '10:00', duration: '2h', status: 'upcoming', address: '119 Tran Phu, Hai Chau, Da Nang', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300', transport: { mode: 'walk', duration: '15 min' }, authenticityScore: 72 },
      { id: '1-4', name: 'Madame Lan Restaurant', type: 'food', time: '12:30', duration: '1.5h', status: 'upcoming', address: '4 Bach Dang, Hai Chau, Da Nang', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300', transport: { mode: 'grab_bike', duration: '8 min', cost: 20000 }, authenticityScore: 78 },
      { id: '1-5', name: 'Beach Club Relaxation', type: 'beach', time: '15:00', duration: '3h', status: 'upcoming', address: 'My Khe Beach, Son Tra, Da Nang', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300', transport: { mode: 'grab_car', duration: '15 min', cost: 75000 }, authenticityScore: 45 },
    ],
    2: [
      { id: '2-1', name: 'Dragon Bridge Morning Walk', type: 'activity', time: '7:00', duration: '1h', status: 'upcoming', address: 'Dragon Bridge, Hai Chau, Da Nang', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=300', authenticityScore: 82 },
      { id: '2-2', name: 'Phở Sài Gòn Breakfast', type: 'food', time: '8:30', duration: '1h', status: 'upcoming', address: '15 Nguyen Chi Thanh, Da Nang', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300', transport: { mode: 'walk', duration: '10 min' }, authenticityScore: 94 },
      { id: '2-3', name: 'Marble Mountains', type: 'activity', time: '10:00', duration: '3h', status: 'upcoming', address: 'Marble Mountains, Ngu Hanh Son, Da Nang', image: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=300', transport: { mode: 'grab_car', duration: '25 min', cost: 95000 }, authenticityScore: 85 },
      { id: '2-4', name: 'Lunch at Làng Cá Restaurant', type: 'food', time: '13:30', duration: '1.5h', status: 'upcoming', address: 'An Bang Beach, Hoi An', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300', transport: { mode: 'grab_bike', duration: '15 min', cost: 35000 }, authenticityScore: 91 },
      { id: '2-5', name: 'An Bang Beach Sunset', type: 'beach', time: '16:00', duration: '3h', status: 'upcoming', address: 'An Bang Beach, Hoi An', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300', transport: { mode: 'walk', duration: '5 min' }, authenticityScore: 87 },
    ],
    3: [
      { id: '3-1', name: 'Hoi An Ancient Town', type: 'activity', time: '8:00', duration: '3h', status: 'upcoming', address: 'Ancient Town, Hoi An', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=300', authenticityScore: 92 },
      { id: '3-2', name: 'Cao Lầu at Morning Glory', type: 'food', time: '11:30', duration: '1.5h', status: 'upcoming', address: '106 Nguyen Thai Hoc, Hoi An', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300', transport: { mode: 'walk', duration: '10 min' }, authenticityScore: 68 },
      { id: '3-3', name: 'Tailor Shop Visit', type: 'shopping', time: '14:00', duration: '2h', status: 'upcoming', address: 'Le Loi Street, Hoi An', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300', transport: { mode: 'walk', duration: '5 min' }, authenticityScore: 75 },
      { id: '3-4', name: 'Hoi An Night Market', type: 'shopping', time: '18:00', duration: '3h', status: 'upcoming', address: 'Nguyen Hoang Street, Hoi An', image: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=300', transport: { mode: 'walk', duration: '8 min' }, authenticityScore: 79 },
    ],
  },
  'Foodie Paradise Trail': {
    1: [
      { id: '1-1', name: 'Breakfast at Bánh Cuốn Bà Vân', type: 'food', time: '7:00', duration: '1h', status: 'upcoming', address: '26 Trần Bình Trọng, Da Nang', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300' },
      { id: '1-2', name: 'Con Market Food Tour', type: 'food', time: '9:00', duration: '2h', status: 'upcoming', address: 'Ông Ích Khiêm, Hai Chau, Da Nang', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300', transport: { mode: 'grab_bike', duration: '12 min', cost: 28000 } },
      { id: '1-3', name: 'Mì Quảng Bà Mua', type: 'food', time: '12:00', duration: '1h', status: 'upcoming', address: '19-21 Trần Bình Trọng, Da Nang', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300', transport: { mode: 'walk', duration: '10 min' } },
      { id: '1-4', name: 'Coffee at 43 Factory', type: 'cafe', time: '14:00', duration: '1.5h', status: 'upcoming', address: '43 Tran Cao Van, Thanh Khe, Da Nang', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300', transport: { mode: 'grab_bike', duration: '8 min', cost: 22000 } },
      { id: '1-5', name: 'Seafood Dinner at Bé Mặn', type: 'food', time: '18:00', duration: '2h', status: 'upcoming', address: 'Võ Nguyên Giáp, Sơn Trà, Da Nang', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300', transport: { mode: 'grab_car', duration: '20 min', cost: 85000 } },
    ],
    2: [
      { id: '2-1', name: 'Bánh Xèo Bà Dưỡng', type: 'food', time: '8:00', duration: '1h', status: 'upcoming', address: '23 Hoang Dieu, Da Nang', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300' },
      { id: '2-2', name: 'Han Market Snacks', type: 'food', time: '10:00', duration: '2h', status: 'upcoming', address: 'Han Market, Da Nang', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300', transport: { mode: 'grab_bike', duration: '10 min', cost: 25000 } },
      { id: '2-3', name: 'Bún Chả Cá 109', type: 'food', time: '12:30', duration: '1h', status: 'upcoming', address: '109 Nguyen Chi Thanh, Da Nang', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300', transport: { mode: 'walk', duration: '15 min' } },
      { id: '2-4', name: 'Waterfront Coffee', type: 'cafe', time: '14:30', duration: '1.5h', status: 'upcoming', address: 'Bach Dang Street, Da Nang', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300', transport: { mode: 'grab_bike', duration: '8 min', cost: 20000 } },
      { id: '2-5', name: 'BBQ at Nem Nướng', type: 'food', time: '18:00', duration: '2h', status: 'upcoming', address: 'Tran Phu Street, Da Nang', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300', transport: { mode: 'walk', duration: '10 min' } },
    ],
    3: [
      { id: '3-1', name: 'Hoi An Central Market', type: 'food', time: '7:00', duration: '2h', status: 'upcoming', address: 'Central Market, Hoi An', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300' },
      { id: '3-2', name: 'Cooking Class', type: 'activity', time: '10:00', duration: '3h', status: 'upcoming', address: 'Red Bridge Cooking School, Hoi An', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300', transport: { mode: 'grab_bike', duration: '15 min', cost: 30000 } },
      { id: '3-3', name: 'White Rose Dumplings', type: 'food', time: '14:00', duration: '1h', status: 'upcoming', address: '533 Hai Ba Trung, Hoi An', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300', transport: { mode: 'walk', duration: '10 min' } },
      { id: '3-4', name: 'Lantern Night Food Tour', type: 'food', time: '18:00', duration: '3h', status: 'upcoming', address: 'Ancient Town, Hoi An', image: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=300', transport: { mode: 'walk', duration: '5 min' } },
    ],
  },
};

const defaultDayTemplate: TripStop[] = [
  { id: '1', name: 'Morning Activity', type: 'activity', time: '8:00', duration: '2h', status: 'upcoming', address: 'Da Nang', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=300' },
  { id: '2', name: 'Lunch Break', type: 'food', time: '12:00', duration: '1.5h', status: 'upcoming', address: 'Da Nang', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300', transport: { mode: 'grab_bike', duration: '15 min', cost: 30000 } },
  { id: '3', name: 'Afternoon Exploration', type: 'activity', time: '14:00', duration: '3h', status: 'upcoming', address: 'Da Nang', image: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=300', transport: { mode: 'walk', duration: '10 min' } },
  { id: '4', name: 'Evening Activity', type: 'activity', time: '18:00', duration: '2h', status: 'upcoming', address: 'Da Nang', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300', transport: { mode: 'grab_bike', duration: '12 min', cost: 25000 } },
];

// Get stops for a specific day
const getStopsForDay = (tripName: string, day: number): TripStop[] => {
  const tripTemplate = multiDayTemplates[tripName];
  if (tripTemplate && tripTemplate[day]) {
    return tripTemplate[day].map((stop, idx) => ({
      ...stop,
      status: idx === 0 ? 'current' as const : 'upcoming' as const,
    }));
  }
  // Fall back to default template with unique IDs per day
  return defaultDayTemplate.map((stop, idx) => ({
    ...stop,
    id: `${day}-${stop.id}`,
    status: idx === 0 ? 'current' as const : 'upcoming' as const,
  }));
};

// Get total days for a trip
const getTotalDays = (tripName: string): number => {
  const tripTemplate = multiDayTemplates[tripName];
  if (tripTemplate) {
    return Object.keys(tripTemplate).length;
  }
  return 3; // Default to 3 days
};

const getTripTheme = (tripName: string): string => {
  const themes: Record<string, string> = {
    'Beach & Culture Explorer': 'Beach & Culture',
    'Foodie Paradise Trail': 'Food & Culture',
    "Adventure Seeker's Dream": 'Adventure',
    'Relaxation Retreat': 'Wellness',
  };
  return themes[tripName] || 'Explorer';
};

interface TripProgressState {
  trips: Record<string, TripProgress>;

  // Actions
  startTrip: (tripId: string, tripName: string) => void;
  getTrip: (tripId: string) => TripProgress | null;
  updateStopStatus: (tripId: string, stopId: string, status: TripStop['status']) => void;
  markStopComplete: (tripId: string, stopId: string) => void;
  skipStop: (tripId: string, stopId: string) => void;
  replaceStop: (tripId: string, oldStopId: string, newStop: TripStop) => void;
  advanceToNextDay: (tripId: string) => void;
  resetTrip: (tripId: string) => void;
  deleteTrip: (tripId: string) => void;
}

export const useTripProgressStore = create<TripProgressState>()(
  persist(
    (set, get) => ({
      trips: {},

      startTrip: (tripId, tripName) => {
        const existing = get().trips[tripId];
        if (existing) return; // Trip already started

        const totalDays = getTotalDays(tripName);
        const newTrip: TripProgress = {
          tripId,
          tripName,
          tripTheme: getTripTheme(tripName),
          currentDay: 1,
          totalDays,
          stops: getStopsForDay(tripName, 1),
          dayCompleted: false,
          tripCompleted: false,
          startedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };

        set(state => ({
          trips: { ...state.trips, [tripId]: newTrip },
        }));
      },

      getTrip: (tripId) => {
        return get().trips[tripId] || null;
      },

      updateStopStatus: (tripId, stopId, status) => {
        set(state => {
          const trip = state.trips[tripId];
          if (!trip) return state;

          const updatedStops = trip.stops.map(stop =>
            stop.id === stopId ? { ...stop, status } : stop
          );

          return {
            trips: {
              ...state.trips,
              [tripId]: {
                ...trip,
                stops: updatedStops,
                lastUpdated: new Date().toISOString(),
              },
            },
          };
        });
      },

      markStopComplete: (tripId, stopId) => {
        set(state => {
          const trip = state.trips[tripId];
          if (!trip) return state;

          const stopIndex = trip.stops.findIndex(s => s.id === stopId);
          if (stopIndex === -1) return state;

          const isLastStop = stopIndex === trip.stops.length - 1;
          const updatedStops = trip.stops.map((stop, idx) => {
            if (stop.id === stopId) {
              return { ...stop, status: 'completed' as const };
            }
            // Make the next stop current if not the last stop
            if (idx === stopIndex + 1 && stop.status === 'upcoming') {
              return { ...stop, status: 'current' as const };
            }
            return stop;
          });

          // Check if day is completed (all stops completed or skipped)
          const allDone = updatedStops.every(s => s.status === 'completed' || s.status === 'skipped');
          const isLastDay = trip.currentDay >= trip.totalDays;

          return {
            trips: {
              ...state.trips,
              [tripId]: {
                ...trip,
                stops: updatedStops,
                dayCompleted: isLastStop || allDone,
                tripCompleted: allDone && isLastDay,
                lastUpdated: new Date().toISOString(),
              },
            },
          };
        });
      },

      skipStop: (tripId, stopId) => {
        set(state => {
          const trip = state.trips[tripId];
          if (!trip) return state;

          const stopIndex = trip.stops.findIndex(s => s.id === stopId);
          if (stopIndex === -1) return state;

          const isLastStop = stopIndex === trip.stops.length - 1;
          const updatedStops = trip.stops.map((stop, idx) => {
            if (stop.id === stopId) {
              return { ...stop, status: 'skipped' as const };
            }
            // Make the next stop current
            if (idx === stopIndex + 1 && stop.status === 'upcoming') {
              return { ...stop, status: 'current' as const };
            }
            return stop;
          });

          // Check if day is completed
          const allDone = updatedStops.every(s => s.status === 'completed' || s.status === 'skipped');
          const isLastDay = trip.currentDay >= trip.totalDays;

          return {
            trips: {
              ...state.trips,
              [tripId]: {
                ...trip,
                stops: updatedStops,
                dayCompleted: isLastStop || allDone,
                tripCompleted: allDone && isLastDay,
                lastUpdated: new Date().toISOString(),
              },
            },
          };
        });
      },

      replaceStop: (tripId, oldStopId, newStop) => {
        set(state => {
          const trip = state.trips[tripId];
          if (!trip) return state;

          const updatedStops = trip.stops.map(stop =>
            stop.id === oldStopId ? { ...newStop, status: stop.status } : stop
          );

          return {
            trips: {
              ...state.trips,
              [tripId]: {
                ...trip,
                stops: updatedStops,
                lastUpdated: new Date().toISOString(),
              },
            },
          };
        });
      },

      advanceToNextDay: (tripId) => {
        set(state => {
          const trip = state.trips[tripId];
          if (!trip) return state;
          if (trip.currentDay >= trip.totalDays) return state; // Already on last day

          const nextDay = trip.currentDay + 1;
          const newStops = getStopsForDay(trip.tripName, nextDay);

          return {
            trips: {
              ...state.trips,
              [tripId]: {
                ...trip,
                currentDay: nextDay,
                stops: newStops,
                dayCompleted: false,
                tripCompleted: false,
                lastUpdated: new Date().toISOString(),
              },
            },
          };
        });
      },

      resetTrip: (tripId) => {
        set(state => {
          const trip = state.trips[tripId];
          if (!trip) return state;

          const resetStops = getStopsForDay(trip.tripName, 1);

          return {
            trips: {
              ...state.trips,
              [tripId]: {
                ...trip,
                currentDay: 1,
                stops: resetStops,
                dayCompleted: false,
                tripCompleted: false,
                lastUpdated: new Date().toISOString(),
              },
            },
          };
        });
      },

      deleteTrip: (tripId) => {
        set(state => {
          const { [tripId]: _, ...remainingTrips } = state.trips;
          return { trips: remainingTrips };
        });
      },
    }),
    {
      name: 'anvago-trip-progress',
    }
  )
);
