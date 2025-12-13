import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.tripEvent.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.mockBooking.deleteMany();
  await prisma.itineraryTemplate.deleteMany();
  await prisma.itineraryItem.deleteMany();
  await prisma.itinerary.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.location.deleteMany();
  await prisma.demoState.deleteMany();

  // Create admin user
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || 'admin@anvago.com',
      passwordHash: adminPassword,
      name: 'Anvago Admin',
      isAdmin: true,
      isPremium: true,
    },
  });

  // Create demo user
  console.log('👤 Creating demo user...');
  const demoPassword = await bcrypt.hash('demo123', 12);
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@anvago.com',
      passwordHash: demoPassword,
      name: 'Demo Traveler',
      isPremium: true,
      preferences: {
        create: {
          personas: ['foodie', 'photographer'],
          vibePreferences: ['beach', 'culture'],
          interests: ['street_food', 'temples', 'photography'],
          budgetLevel: 'moderate',
          mobilityLevel: 'moderate',
          groupSize: 2,
        },
      },
    },
  });

  // Create Danang locations
  console.log('📍 Creating Danang locations...');
  const locations = await Promise.all([
    // BEACHES
    prisma.location.create({
      data: {
        name: 'My Khe Beach',
        nameLocal: 'Bãi biển Mỹ Khê',
        description: 'One of the most stunning beaches in Vietnam, My Khe Beach stretches for miles along the coast with soft white sand and crystal clear waters. Perfect for swimming, surfing, and watching the sunrise.',
        descriptionShort: 'Stunning white sand beach, perfect for sunrise',
        latitude: 16.0544,
        longitude: 108.2478,
        address: 'Phuoc My Ward, Son Tra District, Da Nang',
        city: 'Danang',
        category: 'beach',
        tags: ['beach', 'sunrise', 'swimming', 'surfing', 'photography', 'relaxation'],
        imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
        images: [],
        priceLevel: 1,
        rating: 4.7,
        reviewCount: 3456,
        avgDurationMins: 120,
        isPopular: true,
        isAnvaVerified: true,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Non Nuoc Beach',
        nameLocal: 'Bãi biển Non Nước',
        description: 'A peaceful and less crowded beach located at the foot of Marble Mountains. Known for its calm waters and beautiful scenery, it\'s perfect for a relaxing day away from the crowds.',
        descriptionShort: 'Peaceful beach near Marble Mountains',
        latitude: 16.0012,
        longitude: 108.2678,
        address: 'Hoa Hai Ward, Ngu Hanh Son District, Da Nang',
        city: 'Danang',
        category: 'beach',
        tags: ['beach', 'peaceful', 'nature', 'hidden_gem', 'swimming'],
        imageUrl: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=800',
        images: [],
        priceLevel: 1,
        rating: 4.5,
        reviewCount: 876,
        avgDurationMins: 90,
        isHiddenGem: true,
        isAnvaVerified: true,
      },
    }),

    // ATTRACTIONS
    prisma.location.create({
      data: {
        name: 'Dragon Bridge',
        nameLocal: 'Cầu Rồng',
        description: 'An iconic 666-meter bridge shaped like a dragon that breathes fire and water every weekend night. A symbol of Da Nang\'s modernization and a must-see spectacle.',
        descriptionShort: 'Iconic dragon-shaped bridge with fire shows',
        latitude: 16.0612,
        longitude: 108.2278,
        address: 'Nguyen Van Linh Street, Hai Chau District, Da Nang',
        city: 'Danang',
        category: 'attraction',
        tags: ['iconic', 'photography', 'nightlife', 'architecture', 'free'],
        imageUrl: 'https://images.unsplash.com/photo-1555921015-5532091f6026?w=800',
        images: [],
        priceLevel: 1,
        rating: 4.8,
        reviewCount: 5678,
        avgDurationMins: 60,
        openingHours: {
          saturday: { open: '21:00', close: '21:15' },
          sunday: { open: '21:00', close: '21:15' },
        },
        isPopular: true,
        isAnvaVerified: true,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Marble Mountains',
        nameLocal: 'Ngũ Hành Sơn',
        description: 'Five marble and limestone hills named after the five elements. Features caves, tunnels, Buddhist sanctuaries, and panoramic views of Da Nang and the coastline.',
        descriptionShort: 'Sacred mountains with caves and stunning views',
        latitude: 16.0034,
        longitude: 108.2631,
        address: 'Hoa Hai Ward, Ngu Hanh Son District, Da Nang',
        city: 'Danang',
        category: 'attraction',
        tags: ['spiritual', 'nature', 'photography', 'adventure', 'views', 'history'],
        imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
        images: [],
        priceLevel: 2,
        rating: 4.6,
        reviewCount: 4321,
        avgDurationMins: 150,
        openingHours: {
          monday: { open: '07:00', close: '17:30' },
          tuesday: { open: '07:00', close: '17:30' },
          wednesday: { open: '07:00', close: '17:30' },
          thursday: { open: '07:00', close: '17:30' },
          friday: { open: '07:00', close: '17:30' },
          saturday: { open: '07:00', close: '17:30' },
          sunday: { open: '07:00', close: '17:30' },
        },
        isPopular: true,
        isAnvaVerified: true,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Ba Na Hills',
        nameLocal: 'Bà Nà Hills',
        description: 'A French-themed resort and amusement park featuring the famous Golden Bridge held by giant stone hands. Includes cable car rides, gardens, and entertainment.',
        descriptionShort: 'Famous Golden Bridge and French village',
        latitude: 15.9977,
        longitude: 107.9923,
        address: 'Hoa Ninh Commune, Hoa Vang District, Da Nang',
        city: 'Danang',
        category: 'attraction',
        tags: ['iconic', 'photography', 'adventure', 'family_friendly', 'instagram'],
        imageUrl: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=800',
        images: [],
        priceLevel: 4,
        rating: 4.5,
        reviewCount: 8765,
        avgDurationMins: 360,
        openingHours: {
          monday: { open: '07:30', close: '21:00' },
          tuesday: { open: '07:30', close: '21:00' },
          wednesday: { open: '07:30', close: '21:00' },
          thursday: { open: '07:30', close: '21:00' },
          friday: { open: '07:30', close: '21:00' },
          saturday: { open: '07:30', close: '21:00' },
          sunday: { open: '07:30', close: '21:00' },
        },
        isPopular: true,
      },
    }),

    // TEMPLES
    prisma.location.create({
      data: {
        name: 'Linh Ung Pagoda',
        nameLocal: 'Chùa Linh Ứng',
        description: 'A stunning Buddhist pagoda on Son Tra Peninsula featuring a 67-meter tall Lady Buddha statue, the tallest in Vietnam. Offers breathtaking views of Da Nang.',
        descriptionShort: 'Beautiful pagoda with 67m Lady Buddha statue',
        latitude: 16.1002,
        longitude: 108.2778,
        address: 'Son Tra Peninsula, Da Nang',
        city: 'Danang',
        category: 'temple',
        tags: ['spiritual', 'photography', 'views', 'peaceful', 'architecture', 'free'],
        imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
        images: [],
        priceLevel: 1,
        rating: 4.7,
        reviewCount: 2345,
        avgDurationMins: 90,
        isPopular: true,
        isAnvaVerified: true,
      },
    }),

    // MARKETS
    prisma.location.create({
      data: {
        name: 'Han Market',
        nameLocal: 'Chợ Hàn',
        description: 'The largest and most famous market in Da Nang, offering everything from local food to souvenirs. A great place to experience local culture and try authentic Vietnamese snacks.',
        descriptionShort: 'Famous local market with food and souvenirs',
        latitude: 16.0678,
        longitude: 108.2238,
        address: '119 Tran Phu, Hai Chau District, Da Nang',
        city: 'Danang',
        category: 'market',
        tags: ['local', 'food', 'shopping', 'culture', 'authentic'],
        imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
        images: [],
        priceLevel: 1,
        rating: 4.3,
        reviewCount: 3456,
        avgDurationMins: 90,
        openingHours: {
          monday: { open: '06:00', close: '19:00' },
          tuesday: { open: '06:00', close: '19:00' },
          wednesday: { open: '06:00', close: '19:00' },
          thursday: { open: '06:00', close: '19:00' },
          friday: { open: '06:00', close: '19:00' },
          saturday: { open: '06:00', close: '19:00' },
          sunday: { open: '06:00', close: '19:00' },
        },
        isPopular: true,
        isAnvaVerified: true,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Con Market',
        nameLocal: 'Chợ Cồn',
        description: 'A large local market known for fresh seafood and authentic Vietnamese goods. Less touristy than Han Market, offering a more genuine local experience.',
        descriptionShort: 'Authentic local market, less touristy',
        latitude: 16.0712,
        longitude: 108.2145,
        address: 'Ong Ich Khiem Street, Hai Chau District, Da Nang',
        city: 'Danang',
        category: 'market',
        tags: ['local', 'food', 'authentic', 'hidden_gem', 'seafood'],
        imageUrl: 'https://images.unsplash.com/photo-1504457047772-27faf1c00561?w=800',
        images: [],
        priceLevel: 1,
        rating: 4.4,
        reviewCount: 876,
        avgDurationMins: 60,
        isHiddenGem: true,
        isAnvaVerified: true,
      },
    }),

    // RESTAURANTS
    prisma.location.create({
      data: {
        name: 'Madame Lan Restaurant',
        nameLocal: 'Nhà hàng Madame Lân',
        description: 'An upscale Vietnamese restaurant in a beautiful colonial building. Famous for its Mi Quang (Quang noodles) and authentic Central Vietnamese cuisine.',
        descriptionShort: 'Upscale Vietnamese cuisine in colonial setting',
        latitude: 16.0589,
        longitude: 108.2234,
        address: '4 Bach Dang Street, Hai Chau District, Da Nang',
        city: 'Danang',
        category: 'restaurant',
        tags: ['food', 'local', 'upscale', 'traditional', 'mi_quang'],
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        images: [],
        priceLevel: 3,
        rating: 4.5,
        reviewCount: 1234,
        avgDurationMins: 75,
        isAnvaVerified: true,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Banh Mi Ba Lan',
        nameLocal: 'Bánh Mì Bà Lan',
        description: 'A legendary street food stall serving some of the best banh mi in Da Nang. The secret family recipe has been passed down for generations.',
        descriptionShort: 'Legendary banh mi street food stall',
        latitude: 16.0634,
        longitude: 108.2198,
        address: 'K280/23 Hoang Dieu Street, Da Nang',
        city: 'Danang',
        category: 'restaurant',
        tags: ['street_food', 'local', 'cheap', 'authentic', 'banh_mi', 'hidden_gem'],
        imageUrl: 'https://images.unsplash.com/photo-1600850056064-a8b380df8395?w=800',
        images: [],
        priceLevel: 1,
        rating: 4.8,
        reviewCount: 2345,
        avgDurationMins: 30,
        isHiddenGem: true,
        isAnvaVerified: true,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Be Man Seafood',
        nameLocal: 'Bé Mặn Seafood',
        description: 'Popular beachside seafood restaurant where you can pick your own fresh catch. Known for grilled seafood and local beer, with tables right on the sand.',
        descriptionShort: 'Pick your fresh seafood on the beach',
        latitude: 16.0489,
        longitude: 108.2456,
        address: 'My Khe Beach, Son Tra District, Da Nang',
        city: 'Danang',
        category: 'restaurant',
        tags: ['seafood', 'beach', 'local', 'dinner', 'views'],
        imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
        images: [],
        priceLevel: 2,
        rating: 4.4,
        reviewCount: 1876,
        avgDurationMins: 90,
        isPopular: true,
        isAnvaVerified: true,
      },
    }),

    // CAFES
    prisma.location.create({
      data: {
        name: 'The Espresso Station',
        nameLocal: 'The Espresso Station',
        description: 'A trendy specialty coffee shop with industrial design and excellent Vietnamese and international coffee. Perfect for digital nomads and coffee enthusiasts.',
        descriptionShort: 'Trendy specialty coffee shop',
        latitude: 16.0623,
        longitude: 108.2189,
        address: '30 Thai Phien Street, Hai Chau District, Da Nang',
        city: 'Danang',
        category: 'cafe',
        tags: ['coffee', 'work_friendly', 'instagram', 'specialty_coffee'],
        imageUrl: 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=800',
        images: [],
        priceLevel: 2,
        rating: 4.6,
        reviewCount: 567,
        avgDurationMins: 60,
        isAnvaVerified: true,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Cong Caphe',
        nameLocal: 'Cộng Cà Phê',
        description: 'Iconic Vietnamese coffee chain with communist-era themed decor. Famous for its coconut coffee and nostalgic atmosphere.',
        descriptionShort: 'Famous Vietnamese coffee chain',
        latitude: 16.0678,
        longitude: 108.2234,
        address: '96 Bach Dang Street, Hai Chau District, Da Nang',
        city: 'Danang',
        category: 'cafe',
        tags: ['coffee', 'local', 'instagram', 'coconut_coffee', 'vietnamese'],
        imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
        images: [],
        priceLevel: 2,
        rating: 4.4,
        reviewCount: 2345,
        avgDurationMins: 45,
        isPopular: true,
      },
    }),

    // NATURE
    prisma.location.create({
      data: {
        name: 'Son Tra Peninsula',
        nameLocal: 'Bán đảo Sơn Trà',
        description: 'A protected nature reserve with lush forests, wildlife including rare langurs, and stunning viewpoints. Perfect for hiking, motorbike tours, and nature photography.',
        descriptionShort: 'Nature reserve with wildlife and views',
        latitude: 16.1123,
        longitude: 108.2934,
        address: 'Son Tra Peninsula, Da Nang',
        city: 'Danang',
        category: 'nature',
        tags: ['nature', 'adventure', 'photography', 'wildlife', 'hiking', 'views'],
        imageUrl: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800',
        images: [],
        priceLevel: 1,
        rating: 4.6,
        reviewCount: 1876,
        avgDurationMins: 180,
        isPopular: true,
        isAnvaVerified: true,
      },
    }),

    // NIGHTLIFE
    prisma.location.create({
      data: {
        name: 'Sky36 Bar',
        nameLocal: 'Sky36 Bar',
        description: 'The highest rooftop bar in Vietnam on the 36th floor of Novotel Danang. Offers stunning 360-degree views of the city, mountains, and sea.',
        descriptionShort: 'Highest rooftop bar in Vietnam',
        latitude: 16.0678,
        longitude: 108.2208,
        address: '36 Bach Dang Street, Hai Chau District, Da Nang',
        city: 'Danang',
        category: 'nightlife',
        tags: ['rooftop', 'views', 'nightlife', 'cocktails', 'instagram'],
        imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
        images: [],
        priceLevel: 4,
        rating: 4.5,
        reviewCount: 987,
        avgDurationMins: 120,
        openingHours: {
          monday: { open: '17:00', close: '02:00' },
          tuesday: { open: '17:00', close: '02:00' },
          wednesday: { open: '17:00', close: '02:00' },
          thursday: { open: '17:00', close: '02:00' },
          friday: { open: '17:00', close: '02:00' },
          saturday: { open: '17:00', close: '02:00' },
          sunday: { open: '17:00', close: '02:00' },
        },
        isPopular: true,
      },
    }),

    // MUSEUMS
    prisma.location.create({
      data: {
        name: 'Museum of Cham Sculpture',
        nameLocal: 'Bảo tàng Điêu khắc Chăm',
        description: 'World\'s largest collection of Cham sculpture and artifacts, showcasing the rich history of the Cham civilization that once thrived in central Vietnam.',
        descriptionShort: 'World\'s largest Cham sculpture collection',
        latitude: 16.0612,
        longitude: 108.2234,
        address: '02 2 Thang 9 Street, Hai Chau District, Da Nang',
        city: 'Danang',
        category: 'museum',
        tags: ['history', 'culture', 'museum', 'art', 'educational'],
        imageUrl: 'https://images.unsplash.com/photo-1584037281505-64a89a6c6c5c?w=800',
        images: [],
        priceLevel: 1,
        rating: 4.4,
        reviewCount: 1234,
        avgDurationMins: 90,
        openingHours: {
          monday: { open: '07:00', close: '17:00' },
          tuesday: { open: '07:00', close: '17:00' },
          wednesday: { open: '07:00', close: '17:00' },
          thursday: { open: '07:00', close: '17:00' },
          friday: { open: '07:00', close: '17:00' },
          saturday: { open: '07:00', close: '17:00' },
          sunday: { open: '07:00', close: '17:00' },
        },
        isAnvaVerified: true,
      },
    }),

    // ADDITIONAL RESTAURANTS
    prisma.location.create({
      data: {
        name: 'Mi Quang Ba Mua',
        nameLocal: 'Mì Quảng Bà Mùa',
        description: 'A legendary Mi Quang spot known for its authentic Quang-style noodles. The broth is made from family recipe passed down for generations.',
        descriptionShort: 'Legendary authentic Mi Quang noodles',
        latitude: 16.0567,
        longitude: 108.2145,
        address: '19 Tran Binh Trong, Hai Chau, Da Nang',
        city: 'Danang',
        category: 'restaurant',
        tags: ['street_food', 'local', 'authentic', 'mi_quang', 'budget', 'hidden_gem'],
        imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
        images: [],
        priceLevel: 1,
        rating: 4.7,
        reviewCount: 1456,
        avgDurationMins: 45,
        isHiddenGem: true,
        isAnvaVerified: true,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Hai San Pho',
        nameLocal: 'Hải Sản Phố',
        description: 'Modern seafood restaurant with live tanks where you pick your own seafood. Known for grilled lobster and garlic butter clams.',
        descriptionShort: 'Modern seafood with live selection',
        latitude: 16.0534,
        longitude: 108.2389,
        address: '45 Vo Nguyen Giap, Son Tra, Da Nang',
        city: 'Danang',
        category: 'restaurant',
        tags: ['seafood', 'dinner', 'modern', 'views', 'romantic'],
        imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
        images: [],
        priceLevel: 3,
        rating: 4.5,
        reviewCount: 987,
        avgDurationMins: 90,
        isPopular: true,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Bun Cha Ca 109',
        nameLocal: 'Bún Chả Cá 109',
        description: 'Famous for its Danang-style fish cake noodle soup. A must-try local breakfast staple loved by both locals and tourists.',
        descriptionShort: 'Famous Danang fish cake noodles',
        latitude: 16.0645,
        longitude: 108.2201,
        address: '109 Nguyen Chi Thanh, Hai Chau, Da Nang',
        city: 'Danang',
        category: 'restaurant',
        tags: ['breakfast', 'local', 'authentic', 'noodles', 'budget'],
        imageUrl: 'https://images.unsplash.com/photo-1583224994076-351606896a78?w=800',
        images: [],
        priceLevel: 1,
        rating: 4.6,
        reviewCount: 2345,
        avgDurationMins: 30,
        isAnvaVerified: true,
        isPopular: true,
      },
    }),

    // MORE CAFES
    prisma.location.create({
      data: {
        name: '43 Factory Coffee',
        nameLocal: '43 Factory Coffee Roaster',
        description: 'Award-winning specialty coffee roastery and cafe. Known for single-origin beans and precise brewing methods. A paradise for coffee enthusiasts.',
        descriptionShort: 'Award-winning specialty coffee',
        latitude: 16.0567,
        longitude: 108.2234,
        address: 'K32/20 Tran Quoc Toan, Hai Chau, Da Nang',
        city: 'Danang',
        category: 'cafe',
        tags: ['coffee', 'specialty_coffee', 'instagram', 'work_friendly', 'hidden_gem'],
        imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
        images: [],
        priceLevel: 2,
        rating: 4.9,
        reviewCount: 876,
        avgDurationMins: 75,
        isHiddenGem: true,
        isAnvaVerified: true,
      },
    }),
    prisma.location.create({
      data: {
        name: 'La Pensée Coffee',
        nameLocal: 'La Pensée Coffee',
        description: 'French-Vietnamese fusion cafe with stunning rooftop terrace overlooking the Han River. Famous for egg coffee and croissants.',
        descriptionShort: 'Rooftop cafe with river views',
        latitude: 16.0623,
        longitude: 108.2278,
        address: '88 Bach Dang, Hai Chau, Da Nang',
        city: 'Danang',
        category: 'cafe',
        tags: ['rooftop', 'views', 'instagram', 'egg_coffee', 'romantic'],
        imageUrl: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800',
        images: [],
        priceLevel: 2,
        rating: 4.5,
        reviewCount: 654,
        avgDurationMins: 60,
        isPopular: true,
      },
    }),

    // MORE ATTRACTIONS & ACTIVITIES
    prisma.location.create({
      data: {
        name: 'Ban Co Peak',
        nameLocal: 'Đỉnh Bàn Cờ',
        description: 'The highest point on Son Tra Peninsula with 360-degree panoramic views. Legend has it that immortals played chess here.',
        descriptionShort: 'Highest viewpoint with legendary history',
        latitude: 16.1178,
        longitude: 108.2845,
        address: 'Son Tra Peninsula, Da Nang',
        city: 'Danang',
        category: 'nature',
        tags: ['views', 'sunrise', 'photography', 'hiking', 'nature', 'spiritual'],
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        images: [],
        priceLevel: 1,
        rating: 4.8,
        reviewCount: 987,
        avgDurationMins: 90,
        isAnvaVerified: true,
        isHiddenGem: true,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Love Lock Bridge',
        nameLocal: 'Cầu Tình Yêu',
        description: 'A pedestrian bridge adorned with thousands of love locks. Beautiful at night with colorful lighting. Popular spot for couples.',
        descriptionShort: 'Romantic bridge with love locks',
        latitude: 16.0589,
        longitude: 108.2267,
        address: 'Tran Hung Dao Street, Son Tra, Da Nang',
        city: 'Danang',
        category: 'attraction',
        tags: ['romantic', 'photography', 'nightlife', 'free', 'instagram'],
        imageUrl: 'https://images.unsplash.com/photo-1516820612845-a13894592046?w=800',
        images: [],
        priceLevel: 1,
        rating: 4.3,
        reviewCount: 1567,
        avgDurationMins: 30,
        isPopular: true,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Sun World Danang Wonders',
        nameLocal: 'Asia Park',
        description: 'A large amusement park with the iconic Sun Wheel - one of the tallest Ferris wheels in Southeast Asia. Great for families.',
        descriptionShort: 'Amusement park with giant Sun Wheel',
        latitude: 16.0378,
        longitude: 108.2278,
        address: '1 Phan Dang Luu, Hai Chau, Da Nang',
        city: 'Danang',
        category: 'attraction',
        tags: ['family_friendly', 'entertainment', 'views', 'photography', 'nightlife'],
        imageUrl: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=800',
        images: [],
        priceLevel: 3,
        rating: 4.4,
        reviewCount: 2345,
        avgDurationMins: 180,
        isPopular: true,
      },
    }),

    // SPA & WELLNESS
    prisma.location.create({
      data: {
        name: 'Herbal Spa',
        nameLocal: 'Herbal Spa Da Nang',
        description: 'Traditional Vietnamese spa using local herbal remedies. Known for hot stone massage and herbal steam treatments.',
        descriptionShort: 'Traditional herbal spa treatments',
        latitude: 16.0534,
        longitude: 108.2234,
        address: '67 Le Quang Dao, Son Tra, Da Nang',
        city: 'Danang',
        category: 'wellness',
        tags: ['spa', 'wellness', 'relaxation', 'traditional', 'massage'],
        imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
        images: [],
        priceLevel: 2,
        rating: 4.7,
        reviewCount: 654,
        avgDurationMins: 120,
        isAnvaVerified: true,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Naman Retreat Spa',
        nameLocal: 'Naman Retreat',
        description: 'Luxury beachfront spa at the famous Naman Retreat. World-class treatments with ocean views and traditional Vietnamese techniques.',
        descriptionShort: 'Luxury beachfront spa experience',
        latitude: 15.9934,
        longitude: 108.2678,
        address: 'Truong Sa Road, Ngu Hanh Son, Da Nang',
        city: 'Danang',
        category: 'wellness',
        tags: ['spa', 'luxury', 'beach', 'wellness', 'premium'],
        imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbec5d?w=800',
        images: [],
        priceLevel: 4,
        rating: 4.9,
        reviewCount: 432,
        avgDurationMins: 180,
        isPopular: true,
      },
    }),

    // WATER ACTIVITIES
    prisma.location.create({
      data: {
        name: 'Danang Surf School',
        nameLocal: 'Surf School Da Nang',
        description: 'Professional surfing lessons for all levels at My Khe Beach. Equipment rental and group or private sessions available.',
        descriptionShort: 'Learn to surf at My Khe Beach',
        latitude: 16.0512,
        longitude: 108.2445,
        address: 'My Khe Beach, Son Tra, Da Nang',
        city: 'Danang',
        category: 'activity',
        tags: ['surfing', 'adventure', 'beach', 'sports', 'beginner_friendly'],
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        images: [],
        priceLevel: 2,
        rating: 4.6,
        reviewCount: 345,
        avgDurationMins: 120,
        isAnvaVerified: true,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Cu Lao Cham Island Tour',
        nameLocal: 'Cù Lao Chàm',
        description: 'Day trip to the UNESCO Biosphere Reserve. Includes snorkeling, diving, beach time, and fresh seafood lunch.',
        descriptionShort: 'UNESCO island paradise day trip',
        latitude: 15.9523,
        longitude: 108.5123,
        address: 'Cham Islands, Hoi An (depart from Da Nang)',
        city: 'Danang',
        category: 'activity',
        tags: ['snorkeling', 'diving', 'nature', 'adventure', 'day_trip', 'unesco'],
        imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        images: [],
        priceLevel: 3,
        rating: 4.7,
        reviewCount: 876,
        avgDurationMins: 480,
        isPopular: true,
        isAnvaVerified: true,
      },
    }),

    // MORE NIGHTLIFE
    prisma.location.create({
      data: {
        name: 'Brilliant Top Bar',
        nameLocal: 'Brilliant Top Bar',
        description: 'Rooftop bar at Brilliant Hotel with stunning city and beach views. Popular for sunset cocktails and live music on weekends.',
        descriptionShort: 'Rooftop bar with city views',
        latitude: 16.0623,
        longitude: 108.2345,
        address: '162 Bach Dang, Hai Chau, Da Nang',
        city: 'Danang',
        category: 'nightlife',
        tags: ['rooftop', 'cocktails', 'views', 'live_music', 'sunset'],
        imageUrl: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800',
        images: [],
        priceLevel: 3,
        rating: 4.4,
        reviewCount: 543,
        avgDurationMins: 120,
        isPopular: true,
      },
    }),
    prisma.location.create({
      data: {
        name: 'OQ Lounge',
        nameLocal: 'OQ Lounge',
        description: 'Trendy beachside lounge bar popular with young locals. Great music, craft cocktails, and beach bonfires on weekends.',
        descriptionShort: 'Trendy beachside lounge bar',
        latitude: 16.0478,
        longitude: 108.2423,
        address: 'My Khe Beach, Son Tra, Da Nang',
        city: 'Danang',
        category: 'nightlife',
        tags: ['beach', 'nightlife', 'music', 'young', 'local'],
        imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
        images: [],
        priceLevel: 2,
        rating: 4.3,
        reviewCount: 432,
        avgDurationMins: 150,
        isHiddenGem: true,
        isAnvaVerified: true,
      },
    }),
  ]);

  console.log(`✅ Created ${locations.length} locations\n`);

  // Create a sample itinerary template
  console.log('📋 Creating itinerary template...');
  const itinerary = await prisma.itinerary.create({
    data: {
      title: 'Best of Danang in 3 Days',
      description: 'Experience the highlights of Da Nang - beaches, culture, cuisine, and nightlife.',
      city: 'Danang',
      durationDays: 3,
      coverImage: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
      isTemplate: true,
      isPublic: true,
      generatedBy: 'template',
      estimatedBudget: 3000000,
      totalDistance: 25,
      items: {
        create: [
          // Day 1
          { locationId: locations[0].id, dayNumber: 1, orderIndex: 0, startTime: '06:00', endTime: '08:00', transportMode: 'walk' },
          { locationId: locations[6].id, dayNumber: 1, orderIndex: 1, startTime: '09:00', endTime: '11:00', transportMode: 'grab_bike' },
          { locationId: locations[8].id, dayNumber: 1, orderIndex: 2, startTime: '12:00', endTime: '13:30', transportMode: 'grab_bike' },
          { locationId: locations[3].id, dayNumber: 1, orderIndex: 3, startTime: '14:30', endTime: '17:00', transportMode: 'grab_bike' },
          { locationId: locations[2].id, dayNumber: 1, orderIndex: 4, startTime: '21:00', endTime: '22:00', transportMode: 'grab_bike' },
          // Day 2
          { locationId: locations[5].id, dayNumber: 2, orderIndex: 0, startTime: '07:00', endTime: '09:00', transportMode: 'grab_bike' },
          { locationId: locations[13].id, dayNumber: 2, orderIndex: 1, startTime: '10:00', endTime: '13:00', transportMode: 'grab_bike' },
          { locationId: locations[10].id, dayNumber: 2, orderIndex: 2, startTime: '14:00', endTime: '16:00', transportMode: 'grab_bike' },
          { locationId: locations[14].id, dayNumber: 2, orderIndex: 3, startTime: '18:00', endTime: '20:00', transportMode: 'grab_bike' },
          // Day 3
          { locationId: locations[4].id, dayNumber: 3, orderIndex: 0, startTime: '08:00', endTime: '16:00', transportMode: 'grab_car' },
          { locationId: locations[11].id, dayNumber: 3, orderIndex: 1, startTime: '18:00', endTime: '20:00', transportMode: 'grab_bike' },
        ],
      },
    },
  });

  await prisma.itineraryTemplate.create({
    data: {
      name: 'Best of Danang in 3 Days',
      description: 'Experience the highlights of Da Nang - beaches, culture, cuisine, and nightlife.',
      coverImage: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
      tagline: 'The perfect introduction to Da Nang',
      city: 'Danang',
      durationDays: 3,
      targetPersonas: ['adventurer', 'photographer', 'culture_seeker'],
      targetVibes: ['beach', 'culture', 'nature'],
      targetBudget: 'moderate',
      targetInterests: ['temples', 'photography', 'street_food'],
      highlights: ['Marble Mountains sunrise', 'Dragon Bridge fire show', 'Local street food tour'],
      badges: ['popular', 'local_favorite', 'photography'],
      itineraryId: itinerary.id,
      displayOrder: 1,
    },
  });

  // Create demo state
  console.log('🎮 Creating demo state...');
  await prisma.demoState.create({
    data: {
      id: 'singleton',
      isActive: false,
      speed: 1,
    },
  });

  console.log('\n✨ Database seeding completed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Admin login: admin@anvago.com / admin123');
  console.log('📧 Demo login: demo@anvago.com / demo123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

