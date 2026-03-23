import { PrismaClient } from '@prisma/client';
import "dotenv/config";

async function main() {
  console.log('Testing Prisma connection with DATABASE_URL:', process.env.DATABASE_URL ? 'PRESENT' : 'MISSING');
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log('✅ Connected successfully!');
    const count = await prisma.user.count();
    console.log('User count:', count);
  } catch (e) {
    console.error('❌ Connection failed:');
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
