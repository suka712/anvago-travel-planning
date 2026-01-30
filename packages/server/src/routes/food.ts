import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../config/database.js';

const router: Router = Router();

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Mock food spots for demo
const mockFoodSpots = [
  {
    id: '1',
    name: 'Bánh Mì Bà Lan',
    category: 'street',
    rating: 4.8,
    reviews: 324,
    priceLevel: 1,
    latitude: 16.0544,
    longitude: 108.2022,
    image: 'https://images.unsplash.com/photo-1600454309261-3dc64d79c6a4?w=400',
    tags: ['Authentic', 'Quick Bite', 'Local Favorite'],
    openNow: true,
    address: '23 Tran Phu, Hai Chau, Da Nang',
  },
  {
    id: '2',
    name: 'Madame Lan Restaurant',
    category: 'local',
    rating: 4.6,
    reviews: 512,
    priceLevel: 2,
    latitude: 16.0612,
    longitude: 108.2145,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    tags: ['Fine Dining', 'Traditional', 'Garden View'],
    openNow: true,
    address: '4 Bach Dang, Hai Chau, Da Nang',
  },
  {
    id: '3',
    name: '43 Factory Coffee',
    category: 'cafe',
    rating: 4.9,
    reviews: 891,
    priceLevel: 2,
    latitude: 16.0478,
    longitude: 108.2256,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
    tags: ['Specialty Coffee', 'Instagram Worthy', 'Peaceful'],
    openNow: true,
    address: '43 Tran Cao Van, Thanh Khe, Da Nang',
  },
  {
    id: '4',
    name: 'Phở Bò Sài Gòn',
    category: 'soup',
    rating: 4.7,
    reviews: 267,
    priceLevel: 1,
    latitude: 16.0589,
    longitude: 108.2198,
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    tags: ['Breakfast Spot', 'Authentic Pho', 'Family Recipe'],
    openNow: true,
    address: '15 Le Duan, Hai Chau, Da Nang',
  },
  {
    id: '5',
    name: 'Bé Mặn Seafood',
    category: 'local',
    rating: 4.5,
    reviews: 445,
    priceLevel: 3,
    latitude: 16.0423,
    longitude: 108.2456,
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
    tags: ['Fresh Seafood', 'Ocean View', 'Must Try'],
    openNow: false,
    address: '23 Vo Nguyen Giap, Son Tra, Da Nang',
  },
  {
    id: '6',
    name: 'Chè Xưa',
    category: 'dessert',
    rating: 4.4,
    reviews: 198,
    priceLevel: 1,
    latitude: 16.0534,
    longitude: 108.2089,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    tags: ['Sweet Treats', 'Traditional Dessert', 'Cool Down'],
    openNow: true,
    address: '78 Phan Chau Trinh, Hai Chau, Da Nang',
  },
];

// GET /food/spots - Get food spots with optional filters
router.get('/spots', async (req: Request, res: Response) => {
  try {
    const { category, lat, lng, radius = 5 } = req.query;

    let spots = [...mockFoodSpots];

    // Filter by category
    if (category && category !== 'all') {
      spots = spots.filter(s => s.category === category);
    }

    // Calculate distance if user location provided
    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);

      spots = spots.map(spot => ({
        ...spot,
        distance: calculateDistance(userLat, userLng, spot.latitude, spot.longitude),
      })).filter(spot => spot.distance <= parseFloat(radius as string))
        .sort((a, b) => a.distance - b.distance);
    }

    res.json({
      success: true,
      data: spots,
    });
  } catch (error) {
    console.error('Error fetching food spots:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch food spots',
    });
  }
});

// POST /food/ai-recommend - Get AI-powered food recommendations
router.post('/ai-recommend', async (req: Request, res: Response) => {
  try {
    const { mood, preferences, timeOfDay, lat, lng } = req.body;

    // Get available food spots
    let spots = [...mockFoodSpots];

    // Generate AI recommendations
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a local food expert AI for Da Nang, Vietnam.
Based on the following context, recommend the best food spots and generate personalized insights.

User Context:
- Current mood: ${mood || 'hungry'}
- Preferences: ${preferences?.join(', ') || 'any food'}
- Time of day: ${timeOfDay || 'anytime'}

Available Food Spots:
${spots.map(s => `- ${s.name} (${s.category}): ${s.tags.join(', ')}, Rating: ${s.rating}, Price: ${'$'.repeat(s.priceLevel)}`).join('\n')}

Respond in JSON format:
{
  "recommendation": "A brief personalized recommendation message (2-3 sentences)",
  "topPicks": ["spot name 1", "spot name 2", "spot name 3"],
  "insights": [
    { "spotName": "...", "insight": "A fun, engaging insight about why this spot is great (include emoji)" }
  ]
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiData = JSON.parse(jsonMatch[0]);

          // Merge AI insights with spot data
          const enrichedSpots = spots.map(spot => {
            const insight = aiData.insights?.find((i: any) =>
              i.spotName.toLowerCase().includes(spot.name.toLowerCase()) ||
              spot.name.toLowerCase().includes(i.spotName.toLowerCase())
            );
            return {
              ...spot,
              aiInsight: insight?.insight || generateDefaultInsight(spot),
              isTopPick: aiData.topPicks?.some((p: string) =>
                p.toLowerCase().includes(spot.name.toLowerCase()) ||
                spot.name.toLowerCase().includes(p.toLowerCase())
              ),
            };
          });

          // Sort to put top picks first
          enrichedSpots.sort((a, b) => (b.isTopPick ? 1 : 0) - (a.isTopPick ? 1 : 0));

          return res.json({
            success: true,
            data: {
              recommendation: aiData.recommendation,
              spots: enrichedSpots,
            },
          });
        }
      } catch (aiError) {
        console.error('AI generation failed:', aiError);
      }
    }

    // Fallback: return spots with default insights
    const fallbackSpots = spots.map(spot => ({
      ...spot,
      aiInsight: generateDefaultInsight(spot),
      isTopPick: spot.rating >= 4.7,
    }));

    res.json({
      success: true,
      data: {
        recommendation: "Based on your location in Da Nang, I recommend exploring the local street food scene! The bánh mì here is legendary, and the pho is perfect for any time of day. 🍜",
        spots: fallbackSpots,
      },
    });
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
    });
  }
});

// POST /food/ai-insight - Generate AI insight for a specific spot
router.post('/ai-insight', async (req: Request, res: Response) => {
  try {
    const { spotId, spotName, category, tags } = req.body;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a fun, enthusiastic local food expert. Generate a SHORT, engaging insight (1-2 sentences max) about this food spot in Da Nang:

Name: ${spotName}
Category: ${category}
Known for: ${tags?.join(', ')}

Make it sound like a friend giving a tip. Include 1-2 relevant emojis. Be specific and mention what makes this place special.`;

        const result = await model.generateContent(prompt);
        const insight = result.response.text().trim();

        return res.json({
          success: true,
          data: { insight },
        });
      } catch (aiError) {
        console.error('AI insight generation failed:', aiError);
      }
    }

    // Fallback
    res.json({
      success: true,
      data: {
        insight: generateDefaultInsight({ name: spotName, category, tags }),
      },
    });
  } catch (error) {
    console.error('Error generating AI insight:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate insight',
    });
  }
});

// Helper: Calculate distance between two coordinates (in km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
}

// Helper: Generate default insight based on category
function generateDefaultInsight(spot: any): string {
  const insights: Record<string, string[]> = {
    street: [
      "🔥 This spot is legendary among locals! The secret recipe has been perfected over generations.",
      "💯 A must-visit for authentic street food. Come early to beat the crowds!",
    ],
    local: [
      "🌟 One of the highest-rated restaurants in the area. The flavor profiles here are exceptional!",
      "🎯 Perfect for experiencing authentic Vietnamese cuisine. Locals highly recommend it!",
    ],
    cafe: [
      "☕ Coffee enthusiasts rave about this place! The beans are sourced from the Central Highlands.",
      "📸 Instagrammable vibes and world-class coffee. A perfect retreat!",
    ],
    dessert: [
      "🍨 Sweet tooth paradise! The traditional recipes here are absolutely divine.",
      "✨ Best place to cool down with authentic Vietnamese desserts!",
    ],
    soup: [
      "🍜 The broth here is simmered for hours. Pho perfection at its finest!",
      "🌅 Locals swear by the morning bowls. The secret is in the slow-cooked broth!",
    ],
  };

  const category = spot.category || 'local';
  const options = insights[category] || insights.local;
  return options[Math.floor(Math.random() * options.length)];
}

export default router;
