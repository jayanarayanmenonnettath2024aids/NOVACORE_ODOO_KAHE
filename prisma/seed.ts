import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed database...');

  // Clean up existing data (optional, but good for hackathons)
  await prisma.user.deleteMany();

  // Create mock user
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@traveloop.com',
      passwordHash,
      name: 'Demo Traveler',
      language: 'en',
    },
  });

  console.log(`Created user with id: ${user.id}`);

  // Create a Trip: "European Summer Tour"
  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      name: 'European Summer Tour',
      startDate: new Date('2026-07-01T00:00:00.000Z'),
      endDate: new Date('2026-07-15T00:00:00.000Z'),
      description: 'A two-week journey through France and Italy.',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
      isPublic: true,
      
      stops: {
        create: [
          {
            cityName: 'Paris',
            country: 'France',
            startDate: new Date('2026-07-01T10:00:00.000Z'),
            endDate: new Date('2026-07-05T10:00:00.000Z'),
            orderIndex: 0,
            activities: {
              create: [
                {
                  name: 'Eiffel Tower Visit',
                  description: 'Skip-the-line tickets for sunset.',
                  cost: 35.0,
                  duration: 120,
                  type: 'Sightseeing',
                  startTime: new Date('2026-07-01T18:00:00.000Z'),
                },
                {
                  name: 'Louvre Museum',
                  description: 'Art tour focusing on Renaissance pieces.',
                  cost: 25.0,
                  duration: 180,
                  type: 'Sightseeing',
                  startTime: new Date('2026-07-02T09:00:00.000Z'),
                }
              ]
            }
          },
          {
            cityName: 'Rome',
            country: 'Italy',
            startDate: new Date('2026-07-05T14:00:00.000Z'),
            endDate: new Date('2026-07-10T10:00:00.000Z'),
            orderIndex: 1,
            activities: {
              create: [
                {
                  name: 'Colosseum Underground Tour',
                  description: 'Guided tour of the gladiator arena.',
                  cost: 50.0,
                  duration: 150,
                  type: 'Sightseeing',
                  startTime: new Date('2026-07-06T10:00:00.000Z'),
                },
                {
                  name: 'Pasta Making Class',
                  description: 'Learn to make authentic Roman pasta.',
                  cost: 85.0,
                  duration: 240,
                  type: 'Food',
                  startTime: new Date('2026-07-07T17:00:00.000Z'),
                }
              ]
            }
          }
        ]
      },
      
      expenses: {
        create: [
          { category: 'Transport', amount: 450.00, currency: 'USD' },
          { category: 'Stay', amount: 1200.00, currency: 'USD' }
        ]
      },

      packingItems: {
        create: [
          { name: 'Passport', category: 'Documents', isPacked: false },
          { name: 'Universal Adapter', category: 'Electronics', isPacked: false },
          { name: 'Walking Shoes', category: 'Clothing', isPacked: false }
        ]
      },

      notes: {
        create: [
          { content: 'Remember to book train tickets from Paris to Rome in advance.' }
        ]
      }
    },
  });

  console.log(`Created trip with id: ${trip.id}`);
  
  // Create some Mock Cities for Search
  // Usually this would be an external API, but for the hackathon we can seed some.
  // Actually, we don't have a "City" model, the City Search can just be a mock route
  // returning JSON data.

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
