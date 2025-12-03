import { DayItinerary } from "./sampleItinerary";

export type RoadmapTemplate = {
  id: string;
  name: string;
  description: string;
  duration: string;
  tags: string[];
  thumbnail: string;
  itinerary: DayItinerary[];
};

export const roadmapTemplates: RoadmapTemplate[] = [
  {
    id: "foodie-explorer",
    name: "Foodie Explorer",
    description: "A culinary journey through Da Nang's best local eateries and hidden gems",
    duration: "3 days",
    tags: ["Food", "Local", "Budget-friendly"],
    thumbnail: "🍜",
    itinerary: [
      {
        day: 1,
        date: "Day 1",
        activities: [
          { id: "f1-1", time: "07:00", name: "Bánh Mì Bà Lan", description: "Famous breakfast spot for authentic bánh mì", category: "food" },
          { id: "f1-2", time: "10:00", name: "Con Market", description: "Local market with fresh produce and snacks", category: "activity" },
          { id: "f1-3", time: "12:00", name: "Mì Quảng Bà Mua", description: "The famous Da Nang noodle dish", category: "food" },
          { id: "f1-4", time: "15:00", name: "Coffee Workshop", description: "Learn Vietnamese coffee culture", category: "activity" },
          { id: "f1-5", time: "19:00", name: "Seafood BBQ Night", description: "Fresh seafood by the beach", category: "food" },
        ],
      },
      {
        day: 2,
        date: "Day 2",
        activities: [
          { id: "f2-1", time: "06:30", name: "Phở Breakfast", description: "Traditional morning pho experience", category: "food" },
          { id: "f2-2", time: "09:00", name: "Cooking Class", description: "Learn to make local dishes", category: "activity" },
          { id: "f2-3", time: "13:00", name: "Bánh Xèo Lunch", description: "Crispy Vietnamese pancakes", category: "food" },
          { id: "f2-4", time: "16:00", name: "Street Food Tour", description: "Guided walk through food stalls", category: "activity" },
          { id: "f2-5", time: "20:00", name: "Rooftop Dinner", description: "Fine dining with city views", category: "food" },
        ],
      },
      {
        day: 3,
        date: "Day 3",
        activities: [
          { id: "f3-1", time: "08:00", name: "Breakfast at Han Market", description: "Market breakfast experience", category: "food" },
          { id: "f3-2", time: "11:00", name: "Hoi An Food Trip", description: "Day trip to Hoi An for Cao Lầu", category: "transport" },
          { id: "f3-3", time: "13:00", name: "Cao Lầu Lunch", description: "Hoi An's signature dish", category: "food" },
          { id: "f3-4", time: "16:00", name: "White Rose Dumplings", description: "Local dumpling specialty", category: "food" },
          { id: "f3-5", time: "19:00", name: "Riverside Farewell", description: "Dinner by the Thu Bon River", category: "food" },
        ],
      },
    ],
  },
  {
    id: "adventure-seeker",
    name: "Adventure Seeker",
    description: "Thrilling outdoor activities and breathtaking natural wonders",
    duration: "4 days",
    tags: ["Adventure", "Nature", "Active"],
    thumbnail: "🏔️",
    itinerary: [
      {
        day: 1,
        date: "Day 1",
        activities: [
          { id: "a1-1", time: "05:30", name: "Sunrise at Son Tra", description: "Early morning hike to Lady Buddha", category: "sightseeing" },
          { id: "a1-2", time: "09:00", name: "Monkey Mountain Trek", description: "Wildlife spotting adventure", category: "activity" },
          { id: "a1-3", time: "12:00", name: "Beach Lunch", description: "Refuel at a beachside cafe", category: "food" },
          { id: "a1-4", time: "14:00", name: "Surfing Lesson", description: "Catch waves at My Khe Beach", category: "activity" },
          { id: "a1-5", time: "18:00", name: "Beach Sunset", description: "Relax and watch the sunset", category: "sightseeing" },
        ],
      },
      {
        day: 2,
        date: "Day 2",
        activities: [
          { id: "a2-1", time: "06:00", name: "Marble Mountains", description: "Cave exploration and climbing", category: "activity" },
          { id: "a2-2", time: "10:00", name: "Zipline Adventure", description: "Soar above the forest canopy", category: "activity" },
          { id: "a2-3", time: "13:00", name: "Mountain Picnic", description: "Packed lunch with views", category: "food" },
          { id: "a2-4", time: "15:00", name: "Rock Climbing", description: "Guided climbing session", category: "activity" },
          { id: "a2-5", time: "19:00", name: "BBQ Dinner", description: "Grilled feast after adventure", category: "food" },
        ],
      },
      {
        day: 3,
        date: "Day 3",
        activities: [
          { id: "a3-1", time: "07:00", name: "Ba Na Hills Cable Car", description: "World's longest cable car ride", category: "transport" },
          { id: "a3-2", time: "09:00", name: "Golden Bridge", description: "Walk the famous giant hands bridge", category: "sightseeing" },
          { id: "a3-3", time: "12:00", name: "French Village Lunch", description: "Buffet with mountain views", category: "food" },
          { id: "a3-4", time: "14:00", name: "Fantasy Park", description: "Indoor adventure games", category: "activity" },
          { id: "a3-5", time: "18:00", name: "Return & Rest", description: "Head back to Da Nang", category: "transport" },
        ],
      },
      {
        day: 4,
        date: "Day 4",
        activities: [
          { id: "a4-1", time: "06:00", name: "Kayaking Cu De River", description: "Paddle through mangroves", category: "activity" },
          { id: "a4-2", time: "10:00", name: "Fishing Village Visit", description: "Experience local fishing life", category: "sightseeing" },
          { id: "a4-3", time: "13:00", name: "Fresh Catch Lunch", description: "Cook your own catch", category: "food" },
          { id: "a4-4", time: "15:00", name: "Parasailing", description: "Fly above the coastline", category: "activity" },
          { id: "a4-5", time: "19:00", name: "Adventure Farewell", description: "Celebrate at a rooftop bar", category: "food" },
        ],
      },
    ],
  },
  {
    id: "cultural-immersion",
    name: "Cultural Immersion",
    description: "Deep dive into Vietnamese history, traditions, and local life",
    duration: "3 days",
    tags: ["Culture", "History", "Heritage"],
    thumbnail: "🏛️",
    itinerary: [
      {
        day: 1,
        date: "Day 1",
        activities: [
          { id: "c1-1", time: "08:00", name: "Museum of Cham Sculpture", description: "Ancient Cham artifacts", category: "sightseeing" },
          { id: "c1-2", time: "11:00", name: "Traditional Tea House", description: "Vietnamese tea ceremony", category: "activity" },
          { id: "c1-3", time: "13:00", name: "Local Family Lunch", description: "Home-cooked meal experience", category: "food" },
          { id: "c1-4", time: "15:00", name: "Craft Village Tour", description: "Meet local artisans", category: "activity" },
          { id: "c1-5", time: "19:00", name: "Traditional Music Show", description: "Live cultural performance", category: "activity" },
        ],
      },
      {
        day: 2,
        date: "Day 2",
        activities: [
          { id: "c2-1", time: "07:00", name: "Morning Tai Chi", description: "Join locals by the river", category: "activity" },
          { id: "c2-2", time: "09:00", name: "Linh Ung Pagoda", description: "Visit the Lady Buddha statue", category: "sightseeing" },
          { id: "c2-3", time: "12:00", name: "Temple Vegetarian Lunch", description: "Buddhist cuisine experience", category: "food" },
          { id: "c2-4", time: "14:00", name: "Calligraphy Workshop", description: "Learn Vietnamese writing", category: "activity" },
          { id: "c2-5", time: "18:00", name: "Dragon Bridge Show", description: "Fire and water display", category: "sightseeing" },
        ],
      },
      {
        day: 3,
        date: "Day 3",
        activities: [
          { id: "c3-1", time: "06:00", name: "Hoi An Day Trip", description: "UNESCO World Heritage town", category: "transport" },
          { id: "c3-2", time: "08:00", name: "Ancient Town Walk", description: "Explore 400-year-old architecture", category: "sightseeing" },
          { id: "c3-3", time: "11:00", name: "Lantern Making Class", description: "Create your own lantern", category: "activity" },
          { id: "c3-4", time: "13:00", name: "Cao Lầu Lunch", description: "Hoi An signature noodles", category: "food" },
          { id: "c3-5", time: "18:00", name: "Lantern Night", description: "Experience the magical lantern-lit streets", category: "sightseeing" },
        ],
      },
    ],
  },
  {
    id: "beach-relaxation",
    name: "Beach Relaxation",
    description: "Ultimate chill vibes with pristine beaches and spa retreats",
    duration: "3 days",
    tags: ["Beach", "Relaxation", "Wellness"],
    thumbnail: "🏖️",
    itinerary: [
      {
        day: 1,
        date: "Day 1",
        activities: [
          { id: "b1-1", time: "09:00", name: "My Khe Beach Morning", description: "Sunrise yoga on the sand", category: "activity" },
          { id: "b1-2", time: "11:00", name: "Beach Club Brunch", description: "Relaxed oceanfront dining", category: "food" },
          { id: "b1-3", time: "14:00", name: "Spa Treatment", description: "Traditional Vietnamese massage", category: "activity" },
          { id: "b1-4", time: "17:00", name: "Sunset Swim", description: "Cool off in warm waters", category: "activity" },
          { id: "b1-5", time: "19:00", name: "Beachside Dinner", description: "Fresh seafood at sunset", category: "food" },
        ],
      },
      {
        day: 2,
        date: "Day 2",
        activities: [
          { id: "b2-1", time: "08:00", name: "An Bang Beach Trip", description: "Scenic drive to quieter shores", category: "transport" },
          { id: "b2-2", time: "10:00", name: "Beach Hammock", description: "Read and relax by the waves", category: "activity" },
          { id: "b2-3", time: "13:00", name: "Beach Shack Lunch", description: "Simple, fresh coastal fare", category: "food" },
          { id: "b2-4", time: "15:00", name: "Paddleboard Session", description: "Gentle water activity", category: "activity" },
          { id: "b2-5", time: "19:00", name: "Bonfire Night", description: "Beach bonfire with music", category: "activity" },
        ],
      },
      {
        day: 3,
        date: "Day 3",
        activities: [
          { id: "b3-1", time: "10:00", name: "Sleep In", description: "Late morning rest", category: "activity" },
          { id: "b3-2", time: "12:00", name: "Pool Day", description: "Resort pool and cocktails", category: "activity" },
          { id: "b3-3", time: "14:00", name: "Final Spa Visit", description: "Full body relaxation package", category: "activity" },
          { id: "b3-4", time: "17:00", name: "Golden Hour Photos", description: "Beach photoshoot opportunity", category: "activity" },
          { id: "b3-5", time: "19:00", name: "Farewell Dinner", description: "Rooftop fine dining", category: "food" },
        ],
      },
    ],
  },
  {
    id: "photography-tour",
    name: "Photography Tour",
    description: "Capture stunning moments at Da Nang's most photogenic locations",
    duration: "2 days",
    tags: ["Photography", "Scenic", "Instagram"],
    thumbnail: "📸",
    itinerary: [
      {
        day: 1,
        date: "Day 1",
        activities: [
          { id: "p1-1", time: "05:00", name: "Sunrise at My Khe", description: "Golden hour beach shots", category: "sightseeing" },
          { id: "p1-2", time: "08:00", name: "Dragon Bridge", description: "Iconic architecture photography", category: "sightseeing" },
          { id: "p1-3", time: "11:00", name: "Han Market Colors", description: "Vibrant market scenes", category: "activity" },
          { id: "p1-4", time: "14:00", name: "Marble Mountains", description: "Cave and temple shots", category: "sightseeing" },
          { id: "p1-5", time: "18:00", name: "Son Tra Sunset", description: "Panoramic city views", category: "sightseeing" },
        ],
      },
      {
        day: 2,
        date: "Day 2",
        activities: [
          { id: "p2-1", time: "06:00", name: "Golden Bridge Dawn", description: "Misty morning at Ba Na Hills", category: "sightseeing" },
          { id: "p2-2", time: "10:00", name: "French Village", description: "European architecture in Vietnam", category: "sightseeing" },
          { id: "p2-3", time: "14:00", name: "Hoi An Ancient Town", description: "Yellow buildings and lanterns", category: "sightseeing" },
          { id: "p2-4", time: "17:00", name: "Thu Bon River", description: "Boat ride for river shots", category: "activity" },
          { id: "p2-5", time: "19:00", name: "Lantern Night", description: "Magical evening photography", category: "sightseeing" },
        ],
      },
    ],
  },
  {
    id: "family-friendly",
    name: "Family Fun",
    description: "Kid-friendly activities and attractions for the whole family",
    duration: "3 days",
    tags: ["Family", "Kids", "Fun"],
    thumbnail: "👨‍👩‍👧‍👦",
    itinerary: [
      {
        day: 1,
        date: "Day 1",
        activities: [
          { id: "ff1-1", time: "09:00", name: "Beach Morning", description: "Sandcastle building at My Khe", category: "activity" },
          { id: "ff1-2", time: "12:00", name: "Kid-Friendly Lunch", description: "Western-Vietnamese fusion", category: "food" },
          { id: "ff1-3", time: "14:00", name: "Asia Park", description: "Amusement rides and Sun Wheel", category: "activity" },
          { id: "ff1-4", time: "17:00", name: "Ice Cream Break", description: "Cool treats by the river", category: "food" },
          { id: "ff1-5", time: "19:00", name: "Dragon Bridge Show", description: "Fire breathing dragon display", category: "sightseeing" },
        ],
      },
      {
        day: 2,
        date: "Day 2",
        activities: [
          { id: "ff2-1", time: "08:00", name: "Ba Na Hills", description: "Fantasy Park and gardens", category: "activity" },
          { id: "ff2-2", time: "10:00", name: "Golden Bridge", description: "Family photo opportunity", category: "sightseeing" },
          { id: "ff2-3", time: "12:00", name: "Buffet Lunch", description: "Something for everyone", category: "food" },
          { id: "ff2-4", time: "14:00", name: "Indoor Games", description: "Arcade and entertainment", category: "activity" },
          { id: "ff2-5", time: "18:00", name: "Return & Pizza", description: "Casual family dinner", category: "food" },
        ],
      },
      {
        day: 3,
        date: "Day 3",
        activities: [
          { id: "ff3-1", time: "09:00", name: "Hoi An Boat Ride", description: "Basket boat experience", category: "activity" },
          { id: "ff3-2", time: "11:00", name: "Lantern Making", description: "Kids craft their own lanterns", category: "activity" },
          { id: "ff3-3", time: "13:00", name: "Riverside Lunch", description: "Scenic family meal", category: "food" },
          { id: "ff3-4", time: "15:00", name: "Bicycle Tour", description: "Easy ride through rice fields", category: "activity" },
          { id: "ff3-5", time: "18:00", name: "Farewell Dinner", description: "Celebration meal", category: "food" },
        ],
      },
    ],
  },
  {
    id: "budget-backpacker",
    name: "Budget Backpacker",
    description: "Maximum experience with minimum spend - backpacker style",
    duration: "4 days",
    tags: ["Budget", "Backpacker", "Local"],
    thumbnail: "🎒",
    itinerary: [
      {
        day: 1,
        date: "Day 1",
        activities: [
          { id: "bb1-1", time: "06:00", name: "Free Beach Sunrise", description: "Start the day at My Khe", category: "sightseeing" },
          { id: "bb1-2", time: "08:00", name: "$1 Bánh Mì", description: "Best cheap breakfast in town", category: "food" },
          { id: "bb1-3", time: "10:00", name: "Walk Dragon Bridge", description: "Free iconic sightseeing", category: "sightseeing" },
          { id: "bb1-4", time: "12:00", name: "$2 Mì Quảng", description: "Local noodles at local prices", category: "food" },
          { id: "bb1-5", time: "15:00", name: "Han Market", description: "Free wandering and bargaining", category: "activity" },
        ],
      },
      {
        day: 2,
        date: "Day 2",
        activities: [
          { id: "bb2-1", time: "07:00", name: "Bus to Marble Mountains", description: "Public transport adventure", category: "transport" },
          { id: "bb2-2", time: "09:00", name: "Marble Mountains", description: "Small entrance fee, big views", category: "sightseeing" },
          { id: "bb2-3", time: "12:00", name: "Street Food Lunch", description: "Eat where locals eat", category: "food" },
          { id: "bb2-4", time: "14:00", name: "Non Nuoc Beach", description: "Free beach time nearby", category: "activity" },
          { id: "bb2-5", time: "18:00", name: "Sunset & Cheap Beer", description: "Bia hoi on the beach", category: "food" },
        ],
      },
      {
        day: 3,
        date: "Day 3",
        activities: [
          { id: "bb3-1", time: "06:00", name: "Bus to Hoi An", description: "Cheap local bus ride", category: "transport" },
          { id: "bb3-2", time: "08:00", name: "Free Ancient Town", description: "Wander without a ticket", category: "sightseeing" },
          { id: "bb3-3", time: "12:00", name: "$1.50 Cao Lầu", description: "Authentic at market prices", category: "food" },
          { id: "bb3-4", time: "15:00", name: "An Bang Beach", description: "Free beach, cheap beers", category: "activity" },
          { id: "bb3-5", time: "19:00", name: "Free Lantern Night", description: "Walk the lit streets", category: "sightseeing" },
        ],
      },
      {
        day: 4,
        date: "Day 4",
        activities: [
          { id: "bb4-1", time: "07:00", name: "Son Tra Peninsula", description: "Rent a motorbike, explore free", category: "activity" },
          { id: "bb4-2", time: "10:00", name: "Lady Buddha", description: "Free temple visit", category: "sightseeing" },
          { id: "bb4-3", time: "12:00", name: "Seafood at the Source", description: "Cheap at fishing pier", category: "food" },
          { id: "bb4-4", time: "15:00", name: "Local Coffee Shop", description: "$0.50 cà phê sữa đá", category: "food" },
          { id: "bb4-5", time: "18:00", name: "Farewell Street Food", description: "Final cheap feast", category: "food" },
        ],
      },
    ],
  },
];
