import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../config/database.js';

const router: Router = Router();

// In-memory comment store: spotId -> list of comments
interface Comment {
  id: string;
  spotId: string;
  text: string;
  author: string;
  createdAt: string;
}
const commentStore: Map<string, Comment[]> = new Map();

// AI-generated text detector (if-else keyword filter)
function looksAIGenerated(text: string): boolean {
  const lower = text.toLowerCase();

  const aiPhrases = [
    'delve into',
    'as an ai',
    'i am an ai',
    'certainly',
    'absolutely',
    'i\'d be happy to',
    'in conclusion',
    'in summary',
    'it is worth noting',
    'it\'s worth noting',
    'it is important to note',
    'furthermore',
    'moreover',
    'nevertheless',
    'subsequently',
    'undoubtedly',
    'multifaceted',
    'nuanced perspective',
    'paradigm',
    'seamlessly',
    'in the realm of',
    'culinary journey',
    'exceptional dining experience',
    'this establishment',
    'leverage',
    'utilize',
    'comprehensive',
    'overall, this',
    'i would highly recommend',
    'the ambiance is',
    'a delightful experience',
  ];

  for (const phrase of aiPhrases) {
    if (lower.includes(phrase)) {
      return true;
    }
  }

  // Also flag if text is suspiciously long and formal (over 300 chars with no casual tone)
  if (text.length > 300) {
    const casualIndicators = ['!', 'omg', 'wow', 'lol', 'tbh', 'ngl', 'honestly', 'literally', 'super', 'so good', 'loved it', 'hate'];
    const hasCasual = casualIndicators.some(c => lower.includes(c));
    if (!hasCasual) return true;
  }

  return false;
}

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
  {
    id: '7',
    name: 'Mì Quảng Bà Vị',
    category: 'local',
    rating: 4.8,
    reviews: 410,
    priceLevel: 1,
    latitude: 16.0601,
    longitude: 108.2107,
    image: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=400',
    tags: ['Mì Quảng', 'Must Try', 'Local Legend'],
    openNow: true,
    address: '166 Le Dinh Duong, Hai Chau, Da Nang',
  },
  {
    id: '8',
    name: 'Cơm Gà A Hai',
    category: 'local',
    rating: 4.7,
    reviews: 356,
    priceLevel: 1,
    latitude: 16.0672,
    longitude: 108.2131,
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400',
    tags: ['Chicken Rice', 'Comfort Food', 'Packed at Lunch'],
    openNow: true,
    address: '100 Thai Phien, Hai Chau, Da Nang',
  },
  {
    id: '9',
    name: 'Bánh Tráng Thịt Heo Trần',
    category: 'street',
    rating: 4.6,
    reviews: 289,
    priceLevel: 1,
    latitude: 16.0558,
    longitude: 108.2045,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
    tags: ['Pork Wraps', 'Da Nang Specialty', 'Authentic'],
    openNow: true,
    address: '36 Le Hong Phong, Hai Chau, Da Nang',
  },
  {
    id: '10',
    name: 'Bún Chả Cá 109',
    category: 'soup',
    rating: 4.5,
    reviews: 231,
    priceLevel: 1,
    latitude: 16.0632,
    longitude: 108.2188,
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400',
    tags: ['Fish Cake Noodle', 'Breakfast Fave', 'Local Classic'],
    openNow: true,
    address: '109 Nguyen Chi Thanh, Hai Chau, Da Nang',
  },
  {
    id: '11',
    name: 'The Fig Lounge & Coffee',
    category: 'cafe',
    rating: 4.7,
    reviews: 502,
    priceLevel: 2,
    latitude: 16.0489,
    longitude: 108.2271,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
    tags: ['Brunch', 'Cozy Vibes', 'Good Pastries'],
    openNow: true,
    address: '30 Le Quang Dao, Ngu Hanh Son, Da Nang',
  },
  {
    id: '12',
    name: 'Nhà Hàng Trần',
    category: 'local',
    rating: 4.4,
    reviews: 178,
    priceLevel: 3,
    latitude: 16.0515,
    longitude: 108.2350,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    tags: ['Vietnamese Fine Dining', 'Riverside', 'Date Night'],
    openNow: false,
    address: '4 Tran Phu, Hai Chau, Da Nang',
  },
  {
    id: '13',
    name: 'Ốc Đào',
    category: 'street',
    rating: 4.6,
    reviews: 367,
    priceLevel: 2,
    latitude: 16.0577,
    longitude: 108.2165,
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
    tags: ['Snails & Shellfish', 'Night Spot', 'Beer Friendly'],
    openNow: true,
    address: '62 Hai Phong, Thanh Khe, Da Nang',
  },
  {
    id: '14',
    name: 'Yoga Healthy Kitchen',
    category: 'healthy',
    rating: 4.5,
    reviews: 145,
    priceLevel: 2,
    latitude: 16.0503,
    longitude: 108.2290,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    tags: ['Vegan Options', 'Smoothie Bowls', 'Clean Eating'],
    openNow: true,
    address: '15 An Thuong 4, Ngu Hanh Son, Da Nang',
  },
  {
    id: '15',
    name: 'Bánh Xèo Bà Dưỡng',
    category: 'street',
    rating: 4.9,
    reviews: 623,
    priceLevel: 1,
    latitude: 16.0621,
    longitude: 108.2076,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    tags: ['Crispy Pancake', 'Anthony Bourdain Approved', 'Iconic'],
    openNow: true,
    address: '280/23 Hoang Dieu, Hai Chau, Da Nang',
  },
  {
    id: '16',
    name: 'Kem Bơ Thanh Trà',
    category: 'dessert',
    rating: 4.3,
    reviews: 214,
    priceLevel: 1,
    latitude: 16.0548,
    longitude: 108.2112,
    image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400',
    tags: ['Avocado Ice Cream', 'Cheap & Good', 'After Dinner Treat'],
    openNow: true,
    address: '72 Hai Phong, Thanh Khe, Da Nang',
  },
  {
    id: '17',
    name: 'Quán Cơm Nhà - Homey',
    category: 'local',
    rating: 4.5,
    reviews: 189,
    priceLevel: 1,
    latitude: 16.0595,
    longitude: 108.2134,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    tags: ['Home-Style', 'Rice Plates', 'Cheap Eats'],
    openNow: true,
    address: '55 Nguyen Chi Thanh, Hai Chau, Da Nang',
  },
  {
    id: '18',
    name: 'Phở Hồng',
    category: 'soup',
    rating: 4.6,
    reviews: 301,
    priceLevel: 1,
    latitude: 16.0567,
    longitude: 108.2091,
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    tags: ['Pho', 'Early Bird', 'Generous Portions'],
    openNow: true,
    address: '18 Phan Dinh Phung, Hai Chau, Da Nang',
  },
  {
    id: '19',
    name: 'Nét Huế',
    category: 'local',
    rating: 4.4,
    reviews: 276,
    priceLevel: 1,
    latitude: 16.0633,
    longitude: 108.2156,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    tags: ['Hue Cuisine', 'Spicy', 'Central Flavors'],
    openNow: true,
    address: '46 Tran Quoc Toan, Hai Chau, Da Nang',
  },
  {
    id: '20',
    name: 'Cộng Cà Phê',
    category: 'cafe',
    rating: 4.3,
    reviews: 445,
    priceLevel: 2,
    latitude: 16.0611,
    longitude: 108.2199,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    tags: ['Coconut Coffee', 'Retro Vibes', 'Chain Classic'],
    openNow: true,
    address: '96 Bach Dang, Hai Chau, Da Nang',
  },
  {
    id: '21',
    name: 'Bánh Canh Cua Ghẹ',
    category: 'soup',
    rating: 4.7,
    reviews: 198,
    priceLevel: 2,
    latitude: 16.0541,
    longitude: 108.2068,
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400',
    tags: ['Crab Noodle Soup', 'Rich Broth', 'Seafood Lover'],
    openNow: true,
    address: '34 Le Hong Phong, Hai Chau, Da Nang',
  },
  {
    id: '22',
    name: 'Bò Né 3 Ngon',
    category: 'street',
    rating: 4.5,
    reviews: 332,
    priceLevel: 1,
    latitude: 16.0582,
    longitude: 108.2177,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    tags: ['Sizzling Steak', 'Breakfast Hit', 'Egg & Bread'],
    openNow: true,
    address: '12 Nguyen Van Linh, Hai Chau, Da Nang',
  },
  {
    id: '23',
    name: 'Trà Sữa Bobapop',
    category: 'dessert',
    rating: 4.2,
    reviews: 167,
    priceLevel: 1,
    latitude: 16.0619,
    longitude: 108.2208,
    image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400',
    tags: ['Bubble Tea', 'Refreshing', 'Youth Hangout'],
    openNow: true,
    address: '82 Nguyen Van Linh, Hai Chau, Da Nang',
  },
  {
    id: '24',
    name: 'Hải Sản Phố',
    category: 'local',
    rating: 4.6,
    reviews: 523,
    priceLevel: 3,
    latitude: 16.0456,
    longitude: 108.2412,
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
    tags: ['Seafood Feast', 'Beach Front', 'Group Dining'],
    openNow: true,
    address: '88 Vo Nguyen Giap, Son Tra, Da Nang',
  },
  {
    id: '25',
    name: 'Gỏi Cuốn Bà Tám',
    category: 'street',
    rating: 4.4,
    reviews: 211,
    priceLevel: 1,
    latitude: 16.0573,
    longitude: 108.2055,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
    tags: ['Spring Rolls', 'Fresh & Light', 'Healthy Snack'],
    openNow: true,
    address: '91 Ong Ich Khiem, Hai Chau, Da Nang',
  },
  {
    id: '26',
    name: 'Pizza 4P\'s Da Nang',
    category: 'local',
    rating: 4.7,
    reviews: 687,
    priceLevel: 3,
    latitude: 16.0481,
    longitude: 108.2278,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    tags: ['Japanese-Italian', 'Farm to Table', 'Date Night'],
    openNow: true,
    address: '8 An Thuong 1, Ngu Hanh Son, Da Nang',
  },
  {
    id: '27',
    name: 'Bún Bò Huế Ông Tạ',
    category: 'soup',
    rating: 4.8,
    reviews: 378,
    priceLevel: 1,
    latitude: 16.0608,
    longitude: 108.2121,
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    tags: ['Bun Bo Hue', 'Spicy Beef Noodle', '3 Generations'],
    openNow: true,
    address: '7 Thai Phien, Hai Chau, Da Nang',
  },
  {
    id: '28',
    name: 'Highlands Coffee Bach Dang',
    category: 'cafe',
    rating: 4.1,
    reviews: 612,
    priceLevel: 2,
    latitude: 16.0598,
    longitude: 108.2189,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
    tags: ['River View', 'Reliable', 'Work Friendly'],
    openNow: true,
    address: '46 Bach Dang, Hai Chau, Da Nang',
  },
  {
    id: '29',
    name: 'Chè Cung Đình Huế',
    category: 'dessert',
    rating: 4.5,
    reviews: 143,
    priceLevel: 1,
    latitude: 16.0562,
    longitude: 108.2098,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    tags: ['Royal Desserts', 'Hue-Style Chè', 'Colorful'],
    openNow: true,
    address: '22 Phan Chau Trinh, Hai Chau, Da Nang',
  },
  {
    id: '30',
    name: 'Salad Bowl Da Nang',
    category: 'healthy',
    rating: 4.4,
    reviews: 109,
    priceLevel: 2,
    latitude: 16.0492,
    longitude: 108.2265,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    tags: ['Build Your Bowl', 'High Protein', 'Gym Friendly'],
    openNow: true,
    address: '20 An Thuong 4, Ngu Hanh Son, Da Nang',
  },
  {
    id: '31',
    name: 'Cơm Tấm Sài Gòn',
    category: 'local',
    rating: 4.5,
    reviews: 267,
    priceLevel: 1,
    latitude: 16.0644,
    longitude: 108.2143,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    tags: ['Broken Rice', 'Southern Style', 'Big Portions'],
    openNow: true,
    address: '58 Le Duan, Hai Chau, Da Nang',
  },
  {
    id: '32',
    name: 'Xôi Gà Bà Chiểu',
    category: 'street',
    rating: 4.3,
    reviews: 188,
    priceLevel: 1,
    latitude: 16.0556,
    longitude: 108.2032,
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400',
    tags: ['Sticky Rice', 'Chicken', 'Morning Only'],
    openNow: true,
    address: '14 Hoang Dieu, Hai Chau, Da Nang',
  },
  {
    id: '33',
    name: 'Lẩu Dê Hương Sơn',
    category: 'local',
    rating: 4.3,
    reviews: 201,
    priceLevel: 2,
    latitude: 16.0587,
    longitude: 108.2231,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    tags: ['Goat Hot Pot', 'Group Meal', 'Beer Garden'],
    openNow: true,
    address: '45 Le Thanh Nghi, Hai Chau, Da Nang',
  },
  {
    id: '34',
    name: 'Phúc Long Da Nang',
    category: 'cafe',
    rating: 4.2,
    reviews: 534,
    priceLevel: 2,
    latitude: 16.0618,
    longitude: 108.2175,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    tags: ['Milk Tea', 'Pastries', 'Quick Stop'],
    openNow: true,
    address: '35 Nguyen Van Linh, Hai Chau, Da Nang',
  },
  {
    id: '35',
    name: 'Súp Cua Thiên Hạ',
    category: 'soup',
    rating: 4.4,
    reviews: 176,
    priceLevel: 1,
    latitude: 16.0571,
    longitude: 108.2146,
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400',
    tags: ['Crab Soup', 'Street Cart', 'Evening Snack'],
    openNow: true,
    address: '17 Dong Da, Hai Chau, Da Nang',
  },
  {
    id: '36',
    name: 'Nướng Ngói Đà Thành',
    category: 'street',
    rating: 4.6,
    reviews: 312,
    priceLevel: 2,
    latitude: 16.0553,
    longitude: 108.2087,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    tags: ['Tile-Grilled Meat', 'Da Nang Specialty', 'Smoky'],
    openNow: true,
    address: '103 Nguyen Chi Thanh, Hai Chau, Da Nang',
  },
  {
    id: '37',
    name: 'Smoothie Garden',
    category: 'healthy',
    rating: 4.3,
    reviews: 95,
    priceLevel: 2,
    latitude: 16.0487,
    longitude: 108.2293,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    tags: ['Fresh Juice', 'Acai Bowls', 'Tropical'],
    openNow: true,
    address: '25 An Thuong 2, Ngu Hanh Son, Da Nang',
  },
  {
    id: '38',
    name: 'Hủ Tiếu Nam Vang',
    category: 'soup',
    rating: 4.4,
    reviews: 223,
    priceLevel: 1,
    latitude: 16.0639,
    longitude: 108.2118,
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    tags: ['Phnom Penh Noodles', 'Clear Broth', 'Pork & Shrimp'],
    openNow: true,
    address: '29 Thai Phien, Hai Chau, Da Nang',
  },
  {
    id: '39',
    name: 'Trà Viên',
    category: 'cafe',
    rating: 4.6,
    reviews: 321,
    priceLevel: 2,
    latitude: 16.0509,
    longitude: 108.2253,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
    tags: ['Tea House', 'Traditional', 'Zen Garden'],
    openNow: true,
    address: '19 Le Quang Dao, Ngu Hanh Son, Da Nang',
  },
  {
    id: '40',
    name: 'Nem Lụi Bà Hường',
    category: 'street',
    rating: 4.7,
    reviews: 256,
    priceLevel: 1,
    latitude: 16.0564,
    longitude: 108.2063,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
    tags: ['Grilled Pork Skewers', 'Wrap & Roll', 'Smoky Flavor'],
    openNow: true,
    address: '44 Le Hong Phong, Hai Chau, Da Nang',
  },
  {
    id: '41',
    name: 'Chay Bình An',
    category: 'healthy',
    rating: 4.3,
    reviews: 134,
    priceLevel: 1,
    latitude: 16.0603,
    longitude: 108.2109,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    tags: ['Vegetarian', 'Buddhist Kitchen', 'Peaceful'],
    openNow: true,
    address: '52 Phan Chau Trinh, Hai Chau, Da Nang',
  },
  {
    id: '42',
    name: 'Bạch Đằng Grilled Corn',
    category: 'street',
    rating: 4.2,
    reviews: 189,
    priceLevel: 1,
    latitude: 16.0607,
    longitude: 108.2195,
    image: 'https://images.unsplash.com/photo-1600454309261-3dc64d79c6a4?w=400',
    tags: ['Street Snack', 'Riverside', 'Late Night'],
    openNow: true,
    address: 'Bach Dang Riverfront, Hai Chau, Da Nang',
  },
  {
    id: '43',
    name: 'Nhà Hàng Ông Bếp',
    category: 'local',
    rating: 4.5,
    reviews: 334,
    priceLevel: 2,
    latitude: 16.0525,
    longitude: 108.2312,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    tags: ['Chef Special', 'Modern Vietnamese', 'Plating Art'],
    openNow: true,
    address: '12 Tran Bach Dang, Ngu Hanh Son, Da Nang',
  },
  {
    id: '44',
    name: 'Mì Quảng Ông Hai',
    category: 'local',
    rating: 4.7,
    reviews: 398,
    priceLevel: 1,
    latitude: 16.0651,
    longitude: 108.2127,
    image: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=400',
    tags: ['Mì Quảng', 'Turmeric Noodles', 'Peanut Crunch'],
    openNow: true,
    address: '88 Le Dinh Duong, Hai Chau, Da Nang',
  },
  {
    id: '45',
    name: 'Trung Nguyên E-Coffee',
    category: 'cafe',
    rating: 4.1,
    reviews: 278,
    priceLevel: 2,
    latitude: 16.0586,
    longitude: 108.2168,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
    tags: ['Vietnamese Drip', 'Strong Coffee', 'Classic'],
    openNow: true,
    address: '60 Le Duan, Hai Chau, Da Nang',
  },
  {
    id: '46',
    name: 'Sinh Tố Bờ Kè',
    category: 'dessert',
    rating: 4.3,
    reviews: 167,
    priceLevel: 1,
    latitude: 16.0600,
    longitude: 108.2201,
    image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400',
    tags: ['Fruit Smoothies', 'Cheap', 'Riverside Cart'],
    openNow: true,
    address: 'Bach Dang River Walk, Hai Chau, Da Nang',
  },
  {
    id: '47',
    name: 'Lẩu Thái Sawadee',
    category: 'local',
    rating: 4.4,
    reviews: 245,
    priceLevel: 2,
    latitude: 16.0572,
    longitude: 108.2243,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    tags: ['Thai Hot Pot', 'Tom Yum', 'Spicy Lovers'],
    openNow: true,
    address: '33 Ngo Quyen, Son Tra, Da Nang',
  },
  {
    id: '48',
    name: 'Green Box',
    category: 'healthy',
    rating: 4.5,
    reviews: 112,
    priceLevel: 2,
    latitude: 16.0498,
    longitude: 108.2281,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    tags: ['Meal Prep', 'Low Carb', 'Fitness Meals'],
    openNow: true,
    address: '10 An Thuong 3, Ngu Hanh Son, Da Nang',
  },
  {
    id: '49',
    name: 'Chả Bò Đà Nẵng A Sáu',
    category: 'street',
    rating: 4.6,
    reviews: 301,
    priceLevel: 1,
    latitude: 16.0559,
    longitude: 108.2079,
    image: 'https://images.unsplash.com/photo-1600454309261-3dc64d79c6a4?w=400',
    tags: ['Beef Sausage', 'Da Nang Famous', 'Gift Box'],
    openNow: true,
    address: '9 Le Hong Phong, Hai Chau, Da Nang',
  },
  {
    id: '50',
    name: 'Cà Phê Muối',
    category: 'cafe',
    rating: 4.6,
    reviews: 389,
    priceLevel: 1,
    latitude: 16.0628,
    longitude: 108.2153,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    tags: ['Salt Coffee', 'Hue Original', 'Unique Flavor'],
    openNow: true,
    address: '28 Tran Quoc Toan, Hai Chau, Da Nang',
  },
  {
    id: '51',
    name: 'Bún Mắm Nêm Cô Ba',
    category: 'soup',
    rating: 4.5,
    reviews: 234,
    priceLevel: 1,
    latitude: 16.0613,
    longitude: 108.2102,
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400',
    tags: ['Fermented Fish Noodle', 'Bold Flavor', 'Central Specialty'],
    openNow: true,
    address: '67 Hai Phong, Thanh Khe, Da Nang',
  },
  {
    id: '52',
    name: 'Sữa Chua Dẻo',
    category: 'dessert',
    rating: 4.2,
    reviews: 145,
    priceLevel: 1,
    latitude: 16.0545,
    longitude: 108.2128,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    tags: ['Yogurt Jelly', 'Cool Treat', 'Student Favorite'],
    openNow: true,
    address: '40 Phan Dinh Phung, Hai Chau, Da Nang',
  },
  {
    id: '53',
    name: 'Gà Nướng Gia Lai',
    category: 'local',
    rating: 4.5,
    reviews: 276,
    priceLevel: 2,
    latitude: 16.0579,
    longitude: 108.2214,
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400',
    tags: ['Grilled Chicken', 'Highland Style', 'Charcoal Fire'],
    openNow: true,
    address: '71 Ngo Quyen, Son Tra, Da Nang',
  },
  {
    id: '54',
    name: 'Bánh Đập Mẹt',
    category: 'street',
    rating: 4.4,
    reviews: 198,
    priceLevel: 1,
    latitude: 16.0536,
    longitude: 108.2041,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
    tags: ['Smashed Rice Cake', 'Dipping Sauce', 'Crunchy'],
    openNow: true,
    address: '125 Hoang Dieu, Hai Chau, Da Nang',
  },
  {
    id: '55',
    name: 'An Trưa Healthy',
    category: 'healthy',
    rating: 4.4,
    reviews: 87,
    priceLevel: 2,
    latitude: 16.0505,
    longitude: 108.2273,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    tags: ['Lunch Box', 'Calorie Counted', 'Office Delivery'],
    openNow: true,
    address: '5 An Thuong 6, Ngu Hanh Son, Da Nang',
  },
  {
    id: '56',
    name: 'Tàu Hũ Đêm',
    category: 'dessert',
    rating: 4.1,
    reviews: 156,
    priceLevel: 1,
    latitude: 16.0592,
    longitude: 108.2161,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    tags: ['Tofu Pudding', 'Night Street', 'Ginger Syrup'],
    openNow: true,
    address: '55 Dong Da, Hai Chau, Da Nang',
  },
  {
    id: '57',
    name: 'Quán Hến Xào',
    category: 'local',
    rating: 4.3,
    reviews: 212,
    priceLevel: 1,
    latitude: 16.0648,
    longitude: 108.2098,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    tags: ['Stir-Fried Clams', 'River Clam', 'Quick & Tasty'],
    openNow: true,
    address: '30 Le Dinh Duong, Hai Chau, Da Nang',
  },
  {
    id: '58',
    name: 'Ông Tây Coffee',
    category: 'cafe',
    rating: 4.5,
    reviews: 198,
    priceLevel: 2,
    latitude: 16.0483,
    longitude: 108.2298,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
    tags: ['Expat Favorite', 'Western Brunch', 'Good Wifi'],
    openNow: true,
    address: '38 An Thuong 1, Ngu Hanh Son, Da Nang',
  },
  {
    id: '59',
    name: 'Bún Thịt Nướng Bà Hoa',
    category: 'local',
    rating: 4.6,
    reviews: 345,
    priceLevel: 1,
    latitude: 16.0569,
    longitude: 108.2072,
    image: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=400',
    tags: ['Grilled Pork Noodle', 'Fresh Herbs', 'Fish Sauce'],
    openNow: true,
    address: '16 Hoang Dieu, Hai Chau, Da Nang',
  },
  {
    id: '60',
    name: 'Cháo Vịt Thanh Đa',
    category: 'soup',
    rating: 4.3,
    reviews: 189,
    priceLevel: 1,
    latitude: 16.0641,
    longitude: 108.2135,
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400',
    tags: ['Duck Porridge', 'Comfort Food', 'Night Owl'],
    openNow: true,
    address: '80 Le Duan, Hai Chau, Da Nang',
  },
  {
    id: '61',
    name: 'Mango Mango Dessert',
    category: 'dessert',
    rating: 4.4,
    reviews: 234,
    priceLevel: 2,
    latitude: 16.0496,
    longitude: 108.2259,
    image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400',
    tags: ['Mango Everything', 'HK-Style', 'Tropical Sweet'],
    openNow: true,
    address: '15 An Thuong 4, Ngu Hanh Son, Da Nang',
  },
  {
    id: '62',
    name: 'Quán Ăn Dân Dã',
    category: 'local',
    rating: 4.4,
    reviews: 267,
    priceLevel: 1,
    latitude: 16.0615,
    longitude: 108.2116,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    tags: ['Countryside Cooking', 'Clay Pot', 'Nostalgic'],
    openNow: true,
    address: '48 Tran Quoc Toan, Hai Chau, Da Nang',
  },
  {
    id: '63',
    name: 'Bánh Cuốn Nóng',
    category: 'street',
    rating: 4.5,
    reviews: 223,
    priceLevel: 1,
    latitude: 16.0583,
    longitude: 108.2046,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
    tags: ['Steamed Rice Rolls', 'Made to Order', 'Breakfast Classic'],
    openNow: true,
    address: '33 Ong Ich Khiem, Hai Chau, Da Nang',
  },
  {
    id: '64',
    name: 'Nước Ép Bà Năm',
    category: 'healthy',
    rating: 4.2,
    reviews: 78,
    priceLevel: 1,
    latitude: 16.0561,
    longitude: 108.2138,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    tags: ['Fresh Pressed Juice', 'Sugar Cane', 'Sidewalk Stand'],
    openNow: true,
    address: '65 Phan Chau Trinh, Hai Chau, Da Nang',
  },
  {
    id: '65',
    name: 'Lương Sơn BBQ',
    category: 'local',
    rating: 4.3,
    reviews: 312,
    priceLevel: 2,
    latitude: 16.0531,
    longitude: 108.2325,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    tags: ['Korean BBQ', 'All You Can Eat', 'Night Out'],
    openNow: true,
    address: '56 Le Van Hien, Ngu Hanh Son, Da Nang',
  },
  {
    id: '66',
    name: 'Bánh Tráng Cuốn Thịt Heo',
    category: 'street',
    rating: 4.7,
    reviews: 401,
    priceLevel: 1,
    latitude: 16.0594,
    longitude: 108.2059,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
    tags: ['Rice Paper Wraps', 'Boiled Pork', 'Iconic Da Nang'],
    openNow: true,
    address: '99 Le Hong Phong, Hai Chau, Da Nang',
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

// POST /food/chat - Chat with AI food assistant powered by NVIDIA NIM
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as {
      messages: { role: 'user' | 'assistant'; content: string }[];
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'messages array is required' });
    }

    const apiKey = process.env.NVIDIA_NIM_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'NVIDIA NIM API key not configured' });
    }

    const spotsContext = mockFoodSpots
      .map(s => `- ${s.name} (${s.category}): ${s.tags.join(', ')}, Rating: ${s.rating}, Price: ${'$'.repeat(s.priceLevel)}, ${s.openNow ? 'Open' : 'Closed'}, Address: ${s.address}`)
      .join('\n');

    const systemMessage = {
      role: 'system',
      content: `You are Anvago's friendly AI food assistant for Da Nang, Vietnam. You help travelers discover the best food spots, answer questions about local cuisine, and give personalized recommendations.

Here are the current food spots in our database:
${spotsContext}

Guidelines:
- Be concise, friendly, and enthusiastic about Da Nang food
- Use 1-2 emojis per response
- If asked about a specific dish, relate it to the available spots when possible
- Give honest, helpful recommendations
- Keep responses to 2-4 sentences unless the user asks for detail`,
    };

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [systemMessage, ...messages],
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[NVIDIA NIM] API error:', response.status, errorText);
      return res.status(502).json({ success: false, error: 'AI service unavailable' });
    }

    const data = await response.json() as {
      choices: { message: { content: string } }[];
    };
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    return res.json({ success: true, data: { reply } });
  } catch (error) {
    console.error('Error in food chat:', error);
    return res.status(500).json({ success: false, error: 'Failed to process chat message' });
  }
});

// GET /food/comments/:spotId - Get comments for a food spot
router.get('/comments/:spotId', (req: Request, res: Response) => {
  const { spotId } = req.params;
  const comments = commentStore.get(spotId) || [];
  res.json({ success: true, data: comments });
});

// POST /food/comments - Submit a comment for a food spot
router.post('/comments', (req: Request, res: Response) => {
  const { spotId, text, author } = req.body;

  if (!spotId || !text || typeof text !== 'string') {
    return res.status(400).json({ success: false, error: 'spotId and text are required' });
  }

  const trimmed = text.trim();

  if (trimmed.length < 5) {
    return res.status(400).json({ success: false, error: 'Comment is too short.' });
  }

  if (looksAIGenerated(trimmed)) {
    return res.status(422).json({
      success: false,
      aiDetected: true,
      error: 'Your comment sounds AI-generated. Please write it in your own words and try again!',
    });
  }

  const comment: Comment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    spotId,
    text: trimmed,
    author: (author as string)?.trim() || 'Anonymous',
    createdAt: new Date().toISOString(),
  };

  const existing = commentStore.get(spotId) || [];
  commentStore.set(spotId, [comment, ...existing]);

  return res.status(201).json({ success: true, data: comment });
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
