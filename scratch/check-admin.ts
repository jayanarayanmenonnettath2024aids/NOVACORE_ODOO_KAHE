import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAdmin() {
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@travelloop.com' }
  });
  console.log('Admin User:', admin);
  process.exit(0);
}

checkAdmin();
