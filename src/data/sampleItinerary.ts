export type Activity = {
  id: string;
  time: string;
  name: string;
  description: string;
  category: "food" | "sightseeing" | "activity" | "transport";
};

export type DayItinerary = {
  day: number;
  date: string;
  activities: Activity[];
};

export const sampleItinerary: DayItinerary[] = [
  {
    day: 1,
    date: "Day 1",
    activities: [
      {
        id: "1-1",
        time: "08:00",
        name: "Bánh Mì Bà Lan",
        description: "Famous local breakfast spot for authentic bánh mì",
        category: "food",
      },
      {
        id: "1-2",
        time: "09:30",
        name: "Dragon Bridge",
        description: "Iconic bridge that breathes fire on weekends",
        category: "sightseeing",
      },
      {
        id: "1-3",
        time: "11:00",
        name: "Han Market",
        description: "Local market with souvenirs and street food",
        category: "activity",
      },
      {
        id: "1-4",
        time: "12:30",
        name: "Mì Quảng Bà Mua",
        description: "Try the famous Da Nang noodle dish",
        category: "food",
      },
      {
        id: "1-5",
        time: "15:00",
        name: "My Khe Beach",
        description: "Relax at one of Vietnam's best beaches",
        category: "activity",
      },
    ],
  },
  {
    day: 2,
    date: "Day 2",
    activities: [
      {
        id: "2-1",
        time: "07:00",
        name: "Marble Mountains",
        description: "Explore caves and pagodas with stunning views",
        category: "sightseeing",
      },
      {
        id: "2-2",
        time: "10:30",
        name: "Non Nuoc Stone Village",
        description: "Watch artisans craft marble sculptures",
        category: "activity",
      },
      {
        id: "2-3",
        time: "12:00",
        name: "Seafood Lunch at An Bang",
        description: "Fresh seafood by the beach",
        category: "food",
      },
      {
        id: "2-4",
        time: "14:30",
        name: "Hoi An Old Town",
        description: "UNESCO World Heritage Site nearby",
        category: "sightseeing",
      },
      {
        id: "2-5",
        time: "18:00",
        name: "Lantern-lit dinner",
        description: "Enjoy Cao Lầu in the ancient town",
        category: "food",
      },
    ],
  },
  {
    day: 3,
    date: "Day 3",
    activities: [
      {
        id: "3-1",
        time: "06:00",
        name: "Ba Na Hills",
        description: "Cable car to Golden Bridge and French Village",
        category: "sightseeing",
      },
      {
        id: "3-2",
        time: "09:00",
        name: "Golden Bridge",
        description: "Walk across the famous giant hands bridge",
        category: "activity",
      },
      {
        id: "3-3",
        time: "12:00",
        name: "French Village Lunch",
        description: "Buffet with mountain views",
        category: "food",
      },
      {
        id: "3-4",
        time: "16:00",
        name: "Return to Da Nang",
        description: "Head back to city center",
        category: "transport",
      },
      {
        id: "3-5",
        time: "19:00",
        name: "Rooftop Farewell Dinner",
        description: "Sunset views over the Han River",
        category: "food",
      },
    ],
  },
];
