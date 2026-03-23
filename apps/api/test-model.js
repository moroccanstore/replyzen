require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing model access...');
    const workspace = await prisma.workspace.findFirst();
    console.log('Workspace found:', workspace ? workspace.id : 'NONE');
  } catch (e) {
    console.error('Model access failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
