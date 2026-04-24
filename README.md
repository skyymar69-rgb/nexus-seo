# Nexus SEO

La plateforme SEO nouvelle generation qui combine analyse traditionnelle et optimisation pour les moteurs IA.

## Stack Technique

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Charts**: Recharts
- **Base de donnees**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (a configurer)
- **Paiement**: Stripe (a configurer)

## Demarrage rapide

### 1. Installer les dependances

```bash
npm install
```

### 2. Configurer l'environnement

Copie le fichier `.env.example` en `.env` et remplis les variables :

```bash
cp .env.example .env
```

Variables requises :
- `DATABASE_URL` : URL de ta base PostgreSQL
- `NEXTAUTH_SECRET` : Cle secrete pour NextAuth
- `NEXTAUTH_URL` : URL de ton app (http://localhost:3000 en dev)

### 3. Initialiser la base de donnees

```bash
npx prisma db push
npx prisma generate
```

### 4. Lancer le serveur de developpement

```bash
npm run dev
```

L'app sera disponible sur [http://localhost:3000](http://localhost:3000)

## Structure du projet

```
app/
  page.tsx              # Landing page (/)
  layout.tsx            # Layout racine + theme
  globals.css           # Styles globaux
  (auth)/
    login/page.tsx      # Page de connexion (/login)
    signup/page.tsx     # Page d'inscription (/signup)
  dashboard/
    layout.tsx          # Layout dashboard (sidebar + topbar)
    page.tsx            # Tableau de bord (/dashboard)
    audit/              # Audit SEO (/dashboard/audit)
    keywords/           # Recherche mots-cles (/dashboard/keywords)
    backlinks/          # Analyse backlinks (/dashboard/backlinks)
    rank-tracker/       # Suivi positionnement (/dashboard/rank-tracker)
    ai-visibility/      # Visibilite IA / GEO (/dashboard/ai-visibility)
    content-optimizer/  # Optimisation contenu (/dashboard/content-optimizer)
    competitors/        # Analyse concurrentielle (/dashboard/competitors)
    settings/           # Parametres (/dashboard/settings)
components/
  landing/              # Composants landing page
  ThemeProvider.tsx      # Provider theme clair/sombre
lib/
  utils.ts              # Utilitaires
  prisma.ts             # Client Prisma singleton
prisma/
  schema.prisma         # Schema base de donnees
types/
  index.ts              # Types TypeScript
```

## Fonctionnalites

- **Audit SEO** : Analyse technique complete de vos sites
- **Recherche de mots-cles** : Volume, difficulte, tendances, intentions
- **Analyse de backlinks** : Profil de liens, autorite, liens toxiques
- **Suivi de positionnement** : Positions quotidiennes sur Google
- **AI Visibility Score** : Suivez votre presence dans les reponses IA (ChatGPT, Perplexity, Claude, Gemini)
- **Optimisation de contenu** : Score SEO, suggestions, readabilite
- **Analyse concurrentielle** : Comparez-vous a vos concurrents
- **Theme personnalisable** : Mode clair, sombre, ou systeme

## Deploiement

### Vercel (recommande)

```bash
npm i -g vercel
vercel
```

### Docker

```bash
docker build -t nexus-seo .
docker run -p 3000:3000 nexus-seo
```
