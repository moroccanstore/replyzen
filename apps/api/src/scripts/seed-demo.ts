import 'dotenv/config';
import { PrismaClient, Role, Plan, CampaignStatus } from '@prisma/client';

const prisma = new PrismaClient();


async function main() {
  console.log('🌱 Seeding demo data...');

  // 1. Create Workspace
  const workspace = await prisma.workspace.upsert({
    where: { id: 'demo-workspace-id' },
    update: {},
    create: {
      id: 'demo-workspace-id',
      name: 'Demo Workspace',
      plan: Plan.PRO,
      aiWeeklyLimit: 500,
    },
  });

  // 2. Create User
  const user = await prisma.user.upsert({
    where: { email: 'demo@autowhats.com' },
    update: {},
    create: {
      email: 'demo@autowhats.com',
      password: 'password123', // In a real scenario, this would be hashed
      name: 'Demo Admin',
      role: Role.OWNER,
    },
  });

  // 3. Create Membership
  await prisma.membership.upsert({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspace.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      workspaceId: workspace.id,
      role: Role.OWNER,
    },
  });

  // 4. Create Contacts
  const contactsData = [
    { name: 'John Doe', phone: '1234567890', tags: ['VIP', 'New'] },
    { name: 'Jane Smith', phone: '0987654321', tags: ['Interested'] },
    { name: 'Alice Johnson', phone: '1122334455', tags: ['VIP'] },
    { name: 'Bob Brown', phone: '5566778899', tags: ['Follow-up'] },
    { name: 'Charlie Davis', phone: '9988776655', tags: ['New'] },
  ];

  for (const c of contactsData) {
    await prisma.contact.upsert({
      where: {
        workspaceId_phone: { workspaceId: workspace.id, phone: c.phone },
      },
      update: { name: c.name, tags: c.tags },
      create: {
        workspaceId: workspace.id,
        name: c.name,
        phone: c.phone,
        tags: c.tags,
      },
    });
  }

  // 5. Create Automation Rule
  await prisma.automation.create({
    data: {
      workspaceId: workspace.id,
      keywords: ['hello', 'hi'],
      reply: 'Hi! Welcome to Autowhats CRM. How can we help you today?',
    },
  });

  // 6. Create Campaign
  await prisma.campaign.create({
    data: {
      workspaceId: workspace.id,
      name: 'Welcome Spring 2026',
      messageTemplate: 'Hello {{name}}! Check out our new spring offers.',
      status: CampaignStatus.DRAFT,
    },
  });

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
