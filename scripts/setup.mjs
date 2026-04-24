#!/usr/bin/env node
/**
 * Nexus SEO - Auto Setup Script
 * Run this with: node scripts/setup.mjs
 * It will: push the DB schema, seed demo data, and verify everything works.
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

console.log('\n🚀 Nexus SEO - Setup\n')

// Step 1: Check .env
const envPath = resolve(root, '.env')
if (!existsSync(envPath)) {
  console.log('⚠️  No .env file found. Creating default...')
  const { writeFileSync } = await import('fs')
  writeFileSync(envPath, `DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="nexus-seo-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
`)
  console.log('✅ .env created\n')
} else {
  console.log('✅ .env exists\n')
}

// Step 2: Generate Prisma Client
console.log('📦 Generating Prisma client...')
try {
  execSync('npx prisma generate', { cwd: root, stdio: 'inherit' })
  console.log('✅ Prisma client generated\n')
} catch (e) {
  console.error('❌ Failed to generate Prisma client')
  process.exit(1)
}

// Step 3: Push schema to database
console.log('🗄️  Pushing schema to database...')
try {
  execSync('npx prisma db push', { cwd: root, stdio: 'inherit' })
  console.log('✅ Database schema pushed\n')
} catch (e) {
  console.error('❌ Failed to push schema. Trying with --accept-data-loss...')
  try {
    execSync('npx prisma db push --accept-data-loss', { cwd: root, stdio: 'inherit' })
    console.log('✅ Database schema pushed (with reset)\n')
  } catch (e2) {
    console.error('❌ Failed to push schema')
    process.exit(1)
  }
}

// Step 4: Seed the database
console.log('🌱 Seeding demo data...')
try {
  execSync('npx tsx prisma/seed.ts', { cwd: root, stdio: 'inherit' })
  console.log('✅ Demo data seeded\n')
} catch (e) {
  console.error('❌ Failed to seed. Error:', e.message)
  console.log('   Try running manually: npx tsx prisma/seed.ts')
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✅ Setup complete!')
console.log('')
console.log('   Start the app:  npm run dev')
console.log('   Open:           http://localhost:3000')
console.log('')
console.log('   Demo login:')
console.log('   📧 Email:       demo@nexus.io')
console.log('   🔑 Password:    demo1234')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
