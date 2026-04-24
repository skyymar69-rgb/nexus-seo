# Nexus SEO - Setup Guide

## Quick Start (2 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Setup database (creates SQLite + seeds demo data)
npm run setup

# 3. Start the app
npm run dev
```

Open http://localhost:3000

## Demo Login

- **Email:** demo@nexus.io
- **Password:** demo1234
- **Plan:** Pro (all features unlocked)

## What's included

### Functional Tools
- **Audit SEO** - Real HTML analysis with cheerio (enter any URL)
- **Crawl & Logs** - Multi-page BFS crawler with issue detection
- **Performance Web** - Core Web Vitals estimation + optimization recommendations
- **Analyse Semantique** - NLP-based content analysis with TF-IDF
- **Recherche de mots-cles** - Keyword idea generation with French variations
- **AI Visibility** - Track brand mentions in LLM responses (OpenAI integration)
- **Contenu IA** - AI-powered content generation
- **Backlinks** - Backlink profile analysis
- **Suivi de positionnement** - Keyword rank tracking
- **Analytics** - Traffic analytics dashboard
- **Achats de liens** - Link marketplace

### Architecture
- **Frontend:** Next.js 14 + React + TypeScript + Tailwind CSS
- **Database:** SQLite via Prisma ORM (zero config)
- **Auth:** NextAuth.js with JWT sessions
- **Parsing:** cheerio for HTML analysis
- **AI:** OpenAI API (optional, works without it)

## Optional: Enable AI Features

Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY="sk-your-key-here"
```

This enables real LLM querying in the AI Visibility module.

## Database Commands

```bash
npm run db:push      # Push schema changes
npm run db:generate  # Regenerate Prisma client
npm run db:studio    # Open Prisma Studio (DB browser)
npm run db:seed      # Re-seed demo data
npm run db:reset     # Reset DB + re-seed
```
