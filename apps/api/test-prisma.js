require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('DEBUG: DATABASE_URL:', process.env.DATABASE_URL);
  console.log('DEBUG: Creating PrismaClient...');
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  console.log('DEBUG: PrismaClient created.');
  
  try {
    console.log('DEBUG: Connecting to database...');
    await prisma.$connect();
    console.log('DEBUG: Connected successfully.');
    
    console.log('DEBUG: Fetching first license...');
    const license = await prisma.license.findFirst();
    console.log('DEBUG: License:', license);
  } catch (e) {
    console.error('DEBUG: Error!', e);
  } finally {
    await prisma.$disconnect();
    console.log('DEBUG: Disconnected.');
  }
}

main();
