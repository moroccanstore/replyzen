import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

async function main() {
  console.log(
    'DEBUG: DATABASE_URL =',
    process.env.DATABASE_URL ? 'PRESENT' : 'MISSING'
  );
  const prisma = new PrismaClient();

  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connection successful!');

    console.log('Running test query...');
    const workspaceCount = await prisma.workspace.count();
    console.log(`✅ Found ${workspaceCount} workspaces.`);
  } catch (err) {
    console.error('❌ Connection failed:');
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
