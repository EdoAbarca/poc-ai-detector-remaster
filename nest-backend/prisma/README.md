# Database Seeding

This directory contains the database seed file for populating the database with sample data for development and testing.

## Overview

The seed script (`seed.ts`) creates:
- **2 demo users** with hashed passwords
- **5 tags** (Academic, Research, Business, Technical, Marketing)
- **6 sample scans** with various AI providers and tag combinations

## Usage

### Running the seed script

From the nest-backend directory:

```bash
pnpm seed
```

Or using Docker:

```bash
docker exec nest-backend pnpm seed
```

### Automatic seeding

Prisma can automatically run the seed script after migrations. The seed configuration is already set up in `package.json`:

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

To run migrations and seed together:

```bash
npx prisma migrate dev
```

## Demo Credentials

After seeding, you can login with:

- **Email:** demo@example.com  
- **Password:** password123

Or:

- **Email:** admin@example.com  
- **Password:** password123

## Seed Data Structure

### Users
- `demo_user` (demo@example.com) - Has 4 scans
- `admin_user` (admin@example.com) - Has 2 scans

### Tags
- Academic
- Research
- Business
- Technical
- Marketing

### Sample Scans
1. Research Paper Analysis - Machine Learning Applications (Academic, Research)
2. Business Proposal - Q4 Marketing Strategy (Business, Marketing)
3. Technical Documentation - API Integration Guide (Technical)
4. Academic Essay - Climate Change Impacts (Academic)
5. Product Requirements Document - Mobile App (Technical, Business)
6. Research Findings - User Behavior Study (Research, Marketing)

## Customization

To customize the seed data:

1. Edit `prisma/seed.ts`
2. Modify the data creation logic
3. Run `pnpm seed` to apply changes

## Important Notes

- ⚠️ **The seed script clears existing data** from Scan, Tag, and User tables before seeding
- Comment out the `deleteMany()` calls if you want to preserve existing data
- The script uses bcrypt to hash passwords securely
- All scans include AI provider arrays and tag relationships

## Troubleshooting

### Error: Cannot find module '@prisma/client'

Run:
```bash
pnpm install
npx prisma generate
```

### Connection errors

Ensure:
- PostgreSQL is running
- DATABASE_URL environment variable is set correctly
- Database exists (run migrations first)

## Development Workflow

Recommended workflow for a clean database state:

```bash
# Reset database and apply all migrations
npx prisma migrate reset

# Seed will run automatically, or manually:
pnpm seed
```
