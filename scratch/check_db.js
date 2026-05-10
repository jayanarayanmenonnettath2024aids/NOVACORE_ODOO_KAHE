const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const tripCount = await prisma.trip.count();
    const latestTrip = await prisma.trip.findFirst({ orderBy: { createdAt: 'desc' } });
    console.log('Trip Count:', tripCount);
    console.log('Latest Trip ID:', latestTrip ? latestTrip.id : 'None');
    console.log('Latest Trip UserID:', latestTrip ? latestTrip.userId : 'None');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
