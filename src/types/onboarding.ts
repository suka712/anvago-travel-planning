export type OnboardingData = {
  duration: string;
  groupSize: string;
  startTime: string;
  endTime: string;
  interests: string[];
  budget: string;
  foodPreferences: string[];
  transportMode: string;
  mobility: string;
};

export const INTERESTS = [
  "Local Food",
  "Culture & History",
  "Adventure",
  "Nightlife",
  "Beach & Nature",
  "Shopping",
];

export const FOOD_PREFERENCES = [
  "Vegetarian",
  "Vegan",
  "Halal",
  "No Seafood",
  "No Spicy",
  "Local Everything",
];

export const TRANSPORT_MODES = [
  { value: "walking", label: "Walking", description: "Prefer to walk everywhere" },
  { value: "grab", label: "Grab/Taxi", description: "Use ride-hailing apps" },
  { value: "motorbike", label: "Motorbike", description: "Rent or ride motorbike" },
  { value: "mixed", label: "Mixed", description: "Combination of all" },
];

export const MOBILITY_OPTIONS = [
  { value: "full", label: "Full mobility", description: "No restrictions" },
  { value: "limited-walking", label: "Limited walking", description: "Prefer shorter distances" },
  { value: "wheelchair", label: "Wheelchair accessible", description: "Need accessible routes" },
  { value: "stroller", label: "With stroller", description: "Traveling with young children" },
];

export const BUDGET_OPTIONS = [
  { value: "budget", label: "Budget", description: "Under $30/day" },
  { value: "moderate", label: "Moderate", description: "$30-80/day" },
  { value: "comfort", label: "Comfort", description: "$80-150/day" },
  { value: "luxury", label: "Luxury", description: "$150+/day" },
];
