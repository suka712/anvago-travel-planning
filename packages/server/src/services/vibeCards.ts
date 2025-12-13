import type { Location } from '@prisma/client';
import { prisma } from '../config/database.js';
import type { VibeCard } from '@anvago/shared';

// Get vibe cards for the swiper
export async function getVibeCards(city: string): Promise<VibeCard[]> {
  // Try to get from database first
  const locations = await prisma.location.findMany({
    where: {
      city,
      OR: [
        { isPopular: true },
        { isHiddenGem: true },
        { rating: { gte: 4.0 } },
      ],
    },
    take: 15,
    orderBy: { rating: 'desc' },
  });

  if (locations.length >= 10) {
    return locations.map((loc: Location) => ({
      id: loc.id,
      image: loc.imageUrl,
      title: getVibeTitle(loc),
      subtitle: loc.name,
      tags: loc.tags.slice(0, 3),
    }));
  }

  // Return mock vibe cards for Danang
  return getMockVibeCards();
}

function getVibeTitle(location: any): string {
  const categoryTitles: Record<string, string[]> = {
    beach: ['Golden Shores', 'Coastal Bliss', 'Sandy Paradise'],
    temple: ['Sacred Serenity', 'Spiritual Heights', 'Ancient Wisdom'],
    nature: ['Wild Beauty', 'Natural Wonder', 'Green Escape'],
    restaurant: ['Flavor Journey', 'Culinary Delight', 'Taste Adventure'],
    cafe: ['Coffee Culture', 'Cozy Corner', 'Caffeine Dreams'],
    nightlife: ['Night Vibes', 'After Dark', 'City Lights'],
    market: ['Local Hustle', 'Market Magic', 'Trading Post'],
    attraction: ['Must-See Magic', 'Iconic Spot', 'Famous Views'],
    museum: ['Time Travel', 'Cultural Treasure', 'History Alive'],
  };

  const titles = categoryTitles[location.category] || ['Hidden Gem', 'Local Favorite'];
  return titles[Math.floor(Math.random() * titles.length)];
}

function getMockVibeCards(): VibeCard[] {
  return [
    {
      id: 'vibe-1',
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
      title: 'Mystical Heights',
      subtitle: 'Marble Mountains',
      tags: ['spiritual', 'nature', 'photography'],
    },
    {
      id: 'vibe-2',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      title: 'Golden Shores',
      subtitle: 'My Khe Beach',
      tags: ['beach', 'relaxation', 'sunrise'],
    },
    {
      id: 'vibe-3',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
      title: 'Local Hustle',
      subtitle: 'Han Market',
      tags: ['local', 'food', 'shopping'],
    },
    {
      id: 'vibe-4',
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
      title: 'Sacred Serenity',
      subtitle: 'Linh Ung Pagoda',
      tags: ['temple', 'spiritual', 'views'],
    },
    {
      id: 'vibe-5',
      image: 'https://images.unsplash.com/photo-1555921015-5532091f6026?w=800',
      title: 'Night Magic',
      subtitle: 'Dragon Bridge',
      tags: ['nightlife', 'iconic', 'photography'],
    },
    {
      id: 'vibe-6',
      image: 'https://images.unsplash.com/photo-1504457047772-27faf1c00561?w=800',
      title: 'Flavor Journey',
      subtitle: 'Street Food Alley',
      tags: ['food', 'local', 'adventure'],
    },
    {
      id: 'vibe-7',
      image: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=800',
      title: 'Coastal Bliss',
      subtitle: 'Non Nuoc Beach',
      tags: ['beach', 'peaceful', 'nature'],
    },
    {
      id: 'vibe-8',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      title: 'City Lights',
      subtitle: 'Rooftop Bar Scene',
      tags: ['nightlife', 'views', 'social'],
    },
    {
      id: 'vibe-9',
      image: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800',
      title: 'Wild Beauty',
      subtitle: 'Son Tra Peninsula',
      tags: ['nature', 'adventure', 'wildlife'],
    },
    {
      id: 'vibe-10',
      image: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=800',
      title: 'Coffee Culture',
      subtitle: 'Vietnamese Cafes',
      tags: ['cafe', 'local', 'relaxation'],
    },
    {
      id: 'vibe-11',
      image: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=800',
      title: 'Sunset Dreams',
      subtitle: 'Ba Na Hills',
      tags: ['views', 'adventure', 'photography'],
    },
    {
      id: 'vibe-12',
      image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800',
      title: 'Hidden Waterfall',
      subtitle: 'Secret Nature Spot',
      tags: ['nature', 'hidden_gem', 'adventure'],
    },
  ];
}

