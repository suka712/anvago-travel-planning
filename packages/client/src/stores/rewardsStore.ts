import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Points rewards for different actions
export const REWARD_POINTS = {
  // Trip completion rewards
  COMPLETE_TRIP: 50,
  RATE_LOCATION: 10,
  RATE_TRIP: 25,

  // Photo rewards
  UPLOAD_PHOTO: 30,
  FIRST_PHOTO_BONUS: 20, // Extra points for first photo of a location

  // Feedback rewards
  WRITE_TIP: 25,
  VERIFY_HOURS: 15,
  VERIFY_PRICE: 15,
  REPORT_CLOSED: 20,

  // Quality bonuses
  DETAILED_REVIEW: 40, // 50+ characters
  HELPFUL_REVIEW_BONUS: 50, // When others mark as helpful

  // Streak bonuses
  DAILY_CONTRIBUTION: 10,
  WEEKLY_STREAK: 100,
} as const;

// Reward tiers
export type RewardTier = {
  points: number;
  name: string;
  icon: string;
  premiumDays: number;
};

export const REWARD_TIERS: RewardTier[] = [
  { points: 0, name: 'Explorer', icon: '🌱', premiumDays: 0 },
  { points: 100, name: 'Traveler', icon: '🎒', premiumDays: 3 },
  { points: 300, name: 'Adventurer', icon: '🧭', premiumDays: 7 },
  { points: 600, name: 'Pathfinder', icon: '🗺️', premiumDays: 14 },
  { points: 1000, name: 'Local Expert', icon: '⭐', premiumDays: 30 },
  { points: 2000, name: 'Ambassador', icon: '👑', premiumDays: 60 },
];

// Gift options to redeem points
export const GIFTS = [
  { id: 'premium_week', name: '1 Week Premium', points: 200, type: 'premium', value: 7 },
  { id: 'premium_month', name: '1 Month Premium', points: 500, type: 'premium', value: 30 },
  { id: 'discount_10', name: '10% Partner Discount', points: 150, type: 'discount', value: 10 },
  { id: 'discount_20', name: '20% Partner Discount', points: 300, type: 'discount', value: 20 },
  { id: 'free_coffee', name: 'Free Coffee Voucher', points: 100, type: 'voucher', value: 'coffee' },
  { id: 'local_tour', name: 'Local Guide Tour', points: 800, type: 'experience', value: 'tour' },
] as const;

export interface Contribution {
  id: string;
  type: 'photo' | 'rating' | 'tip' | 'verify_hours' | 'verify_price' | 'report';
  locationId?: string;
  locationName?: string;
  tripId?: string;
  points: number;
  timestamp: Date;
  data?: Record<string, unknown>;
}

export interface RewardsState {
  points: number;
  totalEarnedPoints: number;
  contributions: Contribution[];
  streakDays: number;
  lastContributionDate: string | null;
  redeemedGifts: string[];

  // Actions
  addPoints: (amount: number, contribution: Omit<Contribution, 'id' | 'timestamp'>) => void;
  redeemGift: (giftId: string) => boolean;
  getCurrentTier: () => RewardTier;
  getNextTier: () => RewardTier | null;
  getProgressToNextTier: () => number;
  checkAndUpdateStreak: () => void;
}

export const useRewardsStore = create<RewardsState>()(
  persist(
    (set, get) => ({
      points: 245, // Start with some mock points for demo
      totalEarnedPoints: 445,
      contributions: [
        // Mock previous contributions
        {
          id: 'mock-1',
          type: 'photo',
          locationName: 'My Khe Beach',
          points: 30,
          timestamp: new Date(Date.now() - 86400000 * 2),
        },
        {
          id: 'mock-2',
          type: 'rating',
          locationName: 'Bánh Mì Bà Lan',
          points: 10,
          timestamp: new Date(Date.now() - 86400000 * 2),
        },
        {
          id: 'mock-3',
          type: 'tip',
          locationName: 'Han Market',
          points: 25,
          timestamp: new Date(Date.now() - 86400000),
        },
      ],
      streakDays: 3,
      lastContributionDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      redeemedGifts: [],

      addPoints: (amount, contribution) => {
        const newContribution: Contribution = {
          ...contribution,
          id: `contrib-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };

        set((state) => ({
          points: state.points + amount,
          totalEarnedPoints: state.totalEarnedPoints + amount,
          contributions: [newContribution, ...state.contributions].slice(0, 100), // Keep last 100
          lastContributionDate: new Date().toISOString().split('T')[0],
        }));

        // Check streak
        get().checkAndUpdateStreak();
      },

      redeemGift: (giftId) => {
        const gift = GIFTS.find(g => g.id === giftId);
        if (!gift) return false;

        const { points } = get();
        if (points < gift.points) return false;

        set((state) => ({
          points: state.points - gift.points,
          redeemedGifts: [...state.redeemedGifts, giftId],
        }));

        return true;
      },

      getCurrentTier: () => {
        const { totalEarnedPoints } = get();
        let currentTier = REWARD_TIERS[0];

        for (const tier of REWARD_TIERS) {
          if (totalEarnedPoints >= tier.points) {
            currentTier = tier;
          } else {
            break;
          }
        }

        return currentTier;
      },

      getNextTier: () => {
        const { totalEarnedPoints } = get();

        for (const tier of REWARD_TIERS) {
          if (totalEarnedPoints < tier.points) {
            return tier;
          }
        }

        return null; // Max tier reached
      },

      getProgressToNextTier: () => {
        const { totalEarnedPoints } = get();
        const currentTier = get().getCurrentTier();
        const nextTier = get().getNextTier();

        if (!nextTier) return 100; // Max tier

        const progress = ((totalEarnedPoints - currentTier.points) / (nextTier.points - currentTier.points)) * 100;
        return Math.min(100, Math.max(0, progress));
      },

      checkAndUpdateStreak: () => {
        const { lastContributionDate, streakDays } = get();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (lastContributionDate === yesterday) {
          // Continuing streak
          set({ streakDays: streakDays + 1 });
        } else if (lastContributionDate !== today) {
          // Streak broken
          set({ streakDays: 1 });
        }
      },
    }),
    {
      name: 'anvago-rewards',
    }
  )
);
