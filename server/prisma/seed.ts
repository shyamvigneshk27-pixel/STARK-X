import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CITIES_DATA = [
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, costIndex: 2.5, popularity: 100 },
  { name: 'Kyoto', country: 'Japan', lat: 35.0116, lng: 135.7681, costIndex: 2.0, popularity: 90 },
  { name: 'Osaka', country: 'Japan', lat: 34.6937, lng: 135.5023, costIndex: 1.8, popularity: 85 },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, costIndex: 3.5, popularity: 98 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, costIndex: 2.8, popularity: 92 },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734, costIndex: 2.2, popularity: 88 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, costIndex: 1.2, popularity: 87 },
  { name: 'Bali', country: 'Indonesia', lat: -8.3405, lng: 115.0920, costIndex: 1.0, popularity: 91 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, costIndex: 3.0, popularity: 86 },
  { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, costIndex: 4.0, popularity: 99 },
  { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, costIndex: 3.8, popularity: 97 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, costIndex: 3.2, popularity: 89 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, costIndex: 3.3, popularity: 88 },
  { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lng: 14.4378, costIndex: 1.5, popularity: 82 },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041, costIndex: 3.0, popularity: 84 },
];

async function main() {
  console.log('Starting seed...');

  // Upsert all cities
  const cityMap: Record<string, string> = {};
  for (const city of CITIES_DATA) {
    const c = await prisma.city.upsert({
      where: { name: city.name },
      update: city,
      create: city,
    });
    cityMap[city.name] = c.id;
  }

  console.log(`✅ Seeded ${CITIES_DATA.length} cities`);

  // ── Demo User ─────────────────────────────────────────────────────────────
  const demoPassword = await bcrypt.hash('Demo@1234', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@traveloop.com' },
    update: { isAdmin: true, name: 'Alex Rivera' },
    create: {
      email: 'demo@traveloop.com',
      password: demoPassword,
      name: 'Alex Rivera',
      isAdmin: true,
    },
  });

  console.log(`✅ Demo account: demo@traveloop.com / Demo@1234`);

  // Skip demo trips if already created
  const existingTrips = await prisma.trip.count({ where: { userId: demoUser.id } });
  if (existingTrips > 0) {
    console.log('Demo trips already exist — skipping.');
    console.log('Seeded successfully');
    return;
  }

  // ── Trip 1: Japan Cherry Blossom Tour ────────────────────────────────────
  const japanTrip = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      name: 'Japan Cherry Blossom Tour',
      description: 'Experiencing the magical sakura season across Japan\'s most iconic cities.',
      startDate: new Date('2025-03-28'),
      endDate: new Date('2025-04-08'),
      totalBudget: 3000,
      isPublic: true,
      stops: {
        create: [
          {
            cityId: cityMap['Tokyo'],
            arrivalDate: new Date('2025-03-28'),
            departureDate: new Date('2025-04-01'),
            order: 0,
            activities: {
              create: [
                { name: 'Shinjuku Gyoen Cherry Blossoms', type: 'sightseeing', estimatedCost: 5, durationHrs: 3, startTime: '10:00', notes: 'Best sakura viewing spot in Tokyo' },
                { name: 'Ramen at Ichiran Shibuya', type: 'food', estimatedCost: 18, durationHrs: 1, startTime: '13:00', notes: 'Famous solo ramen experience' },
                { name: 'Senso-ji Temple & Asakusa', type: 'culture', estimatedCost: 0, durationHrs: 2.5, startTime: '16:00' },
                { name: 'Tokyo Skytree Observation', type: 'sightseeing', estimatedCost: 32, durationHrs: 2, startTime: '19:00' },
                { name: 'Tsukiji Outer Market Breakfast', type: 'food', estimatedCost: 25, durationHrs: 1.5, startTime: '07:30', notes: 'Fresh sushi and seafood' },
              ],
            },
          },
          {
            cityId: cityMap['Kyoto'],
            arrivalDate: new Date('2025-04-01'),
            departureDate: new Date('2025-04-04'),
            order: 1,
            activities: {
              create: [
                { name: 'Fushimi Inari-Taisha Gates', type: 'sightseeing', estimatedCost: 0, durationHrs: 3, startTime: '08:00', notes: 'Go early to avoid crowds' },
                { name: 'Arashiyama Bamboo Grove', type: 'sightseeing', estimatedCost: 0, durationHrs: 2, startTime: '07:00' },
                { name: 'Traditional Kaiseki Dinner', type: 'food', estimatedCost: 85, durationHrs: 2, startTime: '19:00', notes: 'Multi-course Japanese cuisine' },
                { name: 'Nishiki Market Food Tour', type: 'food', estimatedCost: 40, durationHrs: 2.5, startTime: '12:00' },
              ],
            },
          },
          {
            cityId: cityMap['Osaka'],
            arrivalDate: new Date('2025-04-04'),
            departureDate: new Date('2025-04-08'),
            order: 2,
            activities: {
              create: [
                { name: 'Osaka Castle & Park', type: 'sightseeing', estimatedCost: 8, durationHrs: 3, startTime: '09:00' },
                { name: 'Dotonbori Street Food Walk', type: 'food', estimatedCost: 35, durationHrs: 3, startTime: '18:00', notes: 'Takoyaki, ramen, and more' },
                { name: 'Universal Studios Japan', type: 'adventure', estimatedCost: 95, durationHrs: 10, startTime: '09:00' },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Japan trip: ${japanTrip.id}`);

  // ── Trip 2: Europe Highlights ─────────────────────────────────────────────
  const europeTrip = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      name: 'Europe Highlights',
      description: 'A whirlwind tour of Europe\'s most iconic capitals.',
      startDate: new Date('2025-06-15'),
      endDate: new Date('2025-06-23'),
      totalBudget: 4500,
      isPublic: false,
      stops: {
        create: [
          {
            cityId: cityMap['Paris'],
            arrivalDate: new Date('2025-06-15'),
            departureDate: new Date('2025-06-18'),
            order: 0,
            activities: {
              create: [
                { name: 'Eiffel Tower at Sunset', type: 'sightseeing', estimatedCost: 28, durationHrs: 2, startTime: '19:00' },
                { name: 'Louvre Museum', type: 'culture', estimatedCost: 17, durationHrs: 4, startTime: '10:00' },
                { name: 'French Pastry Workshop', type: 'food', estimatedCost: 65, durationHrs: 3, startTime: '14:00' },
                { name: 'Seine River Cruise', type: 'sightseeing', estimatedCost: 20, durationHrs: 1.5, startTime: '20:30' },
              ],
            },
          },
          {
            cityId: cityMap['Rome'],
            arrivalDate: new Date('2025-06-18'),
            departureDate: new Date('2025-06-21'),
            order: 1,
            activities: {
              create: [
                { name: 'Colosseum & Roman Forum', type: 'culture', estimatedCost: 18, durationHrs: 3.5, startTime: '09:00' },
                { name: 'Vatican Museums & Sistine Chapel', type: 'culture', estimatedCost: 25, durationHrs: 4, startTime: '08:00', notes: 'Book in advance!' },
                { name: 'Trastevere Food Tour', type: 'food', estimatedCost: 55, durationHrs: 3, startTime: '18:30' },
              ],
            },
          },
          {
            cityId: cityMap['Barcelona'],
            arrivalDate: new Date('2025-06-21'),
            departureDate: new Date('2025-06-23'),
            order: 2,
            activities: {
              create: [
                { name: 'Sagrada Familia', type: 'sightseeing', estimatedCost: 35, durationHrs: 2.5, startTime: '10:00' },
                { name: 'La Boqueria Market', type: 'food', estimatedCost: 20, durationHrs: 1.5, startTime: '12:00' },
                { name: 'Gothic Quarter Walk', type: 'culture', estimatedCost: 0, durationHrs: 2, startTime: '16:00' },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Europe trip: ${europeTrip.id}`);

  // ── Trip 3: Southeast Asia ────────────────────────────────────────────────
  const seaTrip = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      name: 'Southeast Asia Budget Adventure',
      description: 'Backpacking through the best of Southeast Asia on a budget.',
      startDate: new Date('2025-11-01'),
      endDate: new Date('2025-11-11'),
      totalBudget: 1800,
      isPublic: true,
      stops: {
        create: [
          {
            cityId: cityMap['Bangkok'],
            arrivalDate: new Date('2025-11-01'),
            departureDate: new Date('2025-11-04'),
            order: 0,
            activities: {
              create: [
                { name: 'Grand Palace & Wat Phra Kaew', type: 'culture', estimatedCost: 15, durationHrs: 3, startTime: '09:00' },
                { name: 'Chatuchak Weekend Market', type: 'sightseeing', estimatedCost: 30, durationHrs: 4, startTime: '10:00', notes: 'Bargain hard!' },
                { name: 'Street Food Tour Chinatown', type: 'food', estimatedCost: 15, durationHrs: 2.5, startTime: '18:00' },
              ],
            },
          },
          {
            cityId: cityMap['Bali'],
            arrivalDate: new Date('2025-11-04'),
            departureDate: new Date('2025-11-08'),
            order: 1,
            activities: {
              create: [
                { name: 'Ubud Monkey Forest', type: 'adventure', estimatedCost: 5, durationHrs: 2, startTime: '09:00' },
                { name: 'Tegalalang Rice Terrace', type: 'sightseeing', estimatedCost: 2, durationHrs: 2.5, startTime: '07:00' },
                { name: 'Balinese Cooking Class', type: 'food', estimatedCost: 35, durationHrs: 4, startTime: '10:00' },
              ],
            },
          },
          {
            cityId: cityMap['Singapore'],
            arrivalDate: new Date('2025-11-08'),
            departureDate: new Date('2025-11-11'),
            order: 2,
            activities: {
              create: [
                { name: 'Gardens by the Bay', type: 'sightseeing', estimatedCost: 16, durationHrs: 3, startTime: '18:00', notes: 'Light show at 7:45pm and 8:45pm' },
                { name: 'Hawker Centre Eating Tour', type: 'food', estimatedCost: 20, durationHrs: 2, startTime: '12:00', notes: 'Lau Pa Sat or Maxwell Food Centre' },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Southeast Asia trip: ${seaTrip.id}`);
  console.log('Seeded successfully');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
