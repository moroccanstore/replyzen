import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('Testing connection to:', process.env.DATABASE_URL);
  try {
    await prisma.$connect();
    console.log('✅ Connection successful!');
    const count = await prisma.workspace.count();
    console.log('Workspace count:', count);
  } catch (e) {
    console.error('❌ Connection failed:');
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
