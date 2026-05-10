import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Traveloop database...');

  // Admin user
  const adminPass = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@traveloop.com' },
    update: {},
    create: {
      email: 'admin@traveloop.com',
      passwordHash: adminPass,
      firstName: 'Traveloop',
      lastName: 'Admin',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  // Demo user
  const userPass = await bcrypt.hash('Demo@1234', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@traveloop.com' },
    update: {},
    create: {
      email: 'demo@traveloop.com',
      passwordHash: userPass,
      firstName: 'Alex',
      lastName: 'Traveler',
      city: 'San Francisco',
      country: 'USA',
      bio: 'Passionate traveler exploring the world one city at a time.',
      isVerified: true,
    },
  });

  // Demo trip
  const trip = await prisma.trip.upsert({
    where: { shareSlug: 'demo-paris-rome-2024' },
    update: {},
    create: {
      userId: demoUser.id,
      title: 'European Dream — Paris & Rome',
      description: 'An unforgettable journey through the most romantic cities in Europe.',
      type: 'CULTURAL',
      travelersCount: 2,
      budgetPreference: 'MODERATE',
      startDate: new Date('2024-07-10'),
      endDate: new Date('2024-07-20'),
      status: 'COMPLETED',
      isPublic: true,
      shareSlug: 'demo-paris-rome-2024',
      currency: 'EUR',
      totalBudgetGoal: 4000,
    },
  });

  // Budget
  await prisma.budget.upsert({
    where: { tripId: trip.id },
    update: {},
    create: {
      tripId: trip.id,
      totalBudget: 4000,
      accommodation: 1200,
      transport: 600,
      food: 900,
      activities: 800,
      miscellaneous: 500,
      currency: 'EUR',
    },
  });

  // Stops
  const paris = await prisma.tripStop.upsert({
    where: { id: 'stop-paris-demo' },
    update: {},
    create: {
      id: 'stop-paris-demo',
      tripId: trip.id,
      cityName: 'Paris',
      country: 'France',
      countryCode: 'FR',
      lat: 48.8566,
      lng: 2.3522,
      order: 0,
      arrivalDate: new Date('2024-07-10'),
      departureDate: new Date('2024-07-15'),
    },
  });

  const rome = await prisma.tripStop.upsert({
    where: { id: 'stop-rome-demo' },
    update: {},
    create: {
      id: 'stop-rome-demo',
      tripId: trip.id,
      cityName: 'Rome',
      country: 'Italy',
      countryCode: 'IT',
      lat: 41.9028,
      lng: 12.4964,
      order: 1,
      arrivalDate: new Date('2024-07-15'),
      departureDate: new Date('2024-07-20'),
    },
  });

  // Itinerary sections & activities
  const parisSection = await prisma.itinerarySection.create({
    data: {
      tripStopId: paris.id,
      title: 'Eiffel Tower & Champs-Elysées',
      type: 'ACTIVITY',
      estimatedBudget: 120,
      order: 0,
      activities: {
        create: [
          { name: 'Eiffel Tower Summit Visit', cost: 28, durationHours: 2, order: 0 },
          { name: 'Seine River Cruise', cost: 15, durationHours: 1, order: 1 },
          { name: 'Dinner at Le Jules Verne', cost: 80, durationHours: 2, order: 2 },
        ],
      },
    },
  });

  // Sample checklist
  const checklist = await prisma.packingChecklist.create({
    data: {
      tripId: trip.id,
      userId: demoUser.id,
      items: {
        create: [
          { category: 'Documents', name: 'Passport', isPacked: true },
          { category: 'Documents', name: 'Travel Insurance', isPacked: true },
          { category: 'Clothing', name: 'Formal Shirts', isPacked: false },
          { category: 'Electronics', name: 'Phone Charger', isPacked: true },
        ],
      },
    },
  });

  // Shared itinerary
  await prisma.sharedItinerary.upsert({
    where: { tripId: trip.id },
    update: {},
    create: {
      tripId: trip.id,
      userId: demoUser.id,
      shareSlug: 'demo-paris-rome-2024',
      viewCount: 42,
    },
  });

  // Sample expenses
  await prisma.expense.createMany({
    data: [
      { tripId: trip.id, category: 'ACCOMMODATION', amount: 320, currency: 'EUR', description: 'Hotel Lumière Paris - 5 nights', date: new Date('2024-07-10') },
      { tripId: trip.id, category: 'TRANSPORT', amount: 180, currency: 'EUR', description: 'Eurostar Paris to Rome', date: new Date('2024-07-15') },
      { tripId: trip.id, category: 'FOOD', amount: 65, currency: 'EUR', description: 'Le Jules Verne dinner', date: new Date('2024-07-11') },
      { tripId: trip.id, category: 'ACTIVITY', amount: 43, currency: 'EUR', description: 'Eiffel Tower + River Cruise', date: new Date('2024-07-12') },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed complete!');
  console.log('');
  console.log('👤 Demo accounts:');
  console.log('   Admin: admin@traveloop.com / Admin@1234');
  console.log('   User:  demo@traveloop.com  / Demo@1234');
  console.log('');
  console.log('🔗 Public itinerary: /share/demo-paris-rome-2024');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
