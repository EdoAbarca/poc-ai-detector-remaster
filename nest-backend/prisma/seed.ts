import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/pocaidb?schema=public',
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter (required for Prisma 7)
const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out if you want to preserve existing data)
  await prisma.scan.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      username: 'demo_user',
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin_user',
      password: hashedPassword,
    },
  });

  console.log('✅ Created demo users');

  // Create tags
  const tagAcademic = await prisma.tag.create({
    data: { name: 'Academic' },
  });

  const tagResearch = await prisma.tag.create({
    data: { name: 'Research' },
  });

  const tagBusiness = await prisma.tag.create({
    data: { name: 'Business' },
  });

  const tagTechnical = await prisma.tag.create({
    data: { name: 'Technical' },
  });

  const tagMarketing = await prisma.tag.create({
    data: { name: 'Marketing' },
  });

  console.log('✅ Created tags');

  // Create scans for user1
  const scan1 = await prisma.scan.create({
    data: {
      title: 'Research Paper Analysis - Machine Learning Applications',
      content: 'This comprehensive research paper explores the latest advancements in machine learning...',
      aiProviders: ['GPT-4', 'Claude'],
      userId: user1.id,
      tags: {
        connect: [{ id: tagAcademic.id }, { id: tagResearch.id }],
      },
    },
  });

  const scan2 = await prisma.scan.create({
    data: {
      title: 'Business Proposal - Q4 Marketing Strategy',
      content: 'Executive summary for the fourth quarter marketing initiatives targeting...',
      aiProviders: ['GPT-3.5'],
      userId: user1.id,
      tags: {
        connect: [{ id: tagBusiness.id }, { id: tagMarketing.id }],
      },
    },
  });

  const scan3 = await prisma.scan.create({
    data: {
      title: 'Technical Documentation - API Integration Guide',
      content: 'This document provides detailed instructions for integrating our REST API...',
      aiProviders: ['GPT-4', 'Gemini'],
      userId: user1.id,
      tags: {
        connect: [{ id: tagTechnical.id }],
      },
    },
  });

  const scan4 = await prisma.scan.create({
    data: {
      title: 'Academic Essay - Climate Change Impacts',
      content: 'Climate change represents one of the most significant challenges of our time...',
      aiProviders: ['Claude', 'GPT-3.5'],
      userId: user1.id,
      tags: {
        connect: [{ id: tagAcademic.id }],
      },
    },
  });

  // Create scans for user2
  const scan5 = await prisma.scan.create({
    data: {
      title: 'Product Requirements Document - Mobile App',
      content: 'Functional and non-functional requirements for the new mobile application...',
      aiProviders: ['GPT-4'],
      userId: user2.id,
      tags: {
        connect: [{ id: tagTechnical.id }, { id: tagBusiness.id }],
      },
    },
  });

  const scan6 = await prisma.scan.create({
    data: {
      title: 'Research Findings - User Behavior Study',
      content: 'Analysis of user engagement patterns across different demographics...',
      aiProviders: ['Claude'],
      userId: user2.id,
      tags: {
        connect: [{ id: tagResearch.id }, { id: tagMarketing.id }],
      },
    },
  });

  console.log('✅ Created sample scans');

  console.log('🎉 Seeding completed successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`   - Users created: 2`);
  console.log(`   - Tags created: 5`);
  console.log(`   - Scans created: 6`);
  console.log(`\n🔐 Demo credentials:`);
  console.log(`   Email: demo@example.com`);
  console.log(`   Password: password123`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
