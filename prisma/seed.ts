import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function getDaysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

async function main() {
  try {
    console.log('Seeding database...')

    // 1. Create demo user
    const hashedPassword = await bcrypt.hash('demo1234', 10)

    const user = await prisma.user.upsert({
      where: { email: 'demo@nexus.io' },
      update: { id: 'demo-user-id' },
      create: {
        id: 'demo-user-id',
        email: 'demo@nexus.io',
        password: hashedPassword,
        name: 'Tarek Belkebli',
        company: 'Nexus Digital',
        role: 'admin',
        plan: 'pro',
        auditCredits: 100,
        emailVerified: new Date(),
      },
    })

    console.log('✅ Created demo user:', user.email)

    // 2. Create 3 websites
    const websites = await Promise.all([
      prisma.website.upsert({
        where: { domain_userId: { domain: 'monsite.fr', userId: user.id } },
        update: {},
        create: {
          domain: 'monsite.fr',
          name: 'Mon Site E-Commerce',
          userId: user.id,
          verified: true,
        },
      }),
      prisma.website.upsert({
        where: { domain_userId: { domain: 'blog.techfr.io', userId: user.id } },
        update: {},
        create: {
          domain: 'blog.techfr.io',
          name: 'Blog Tech France',
          userId: user.id,
          verified: true,
        },
      }),
      prisma.website.upsert({
        where: { domain_userId: { domain: 'shop.modefrancaise.com', userId: user.id } },
        update: {},
        create: {
          domain: 'shop.modefrancaise.com',
          name: 'Mode Française Boutique',
          userId: user.id,
          verified: true,
        },
      }),
    ])

    console.log('✅ Created 3 websites')

    // 3. Create 20 audits with progressive improvement
    const auditConfigs = [
      { websiteIndex: 0, scores: [55, 58, 62, 65, 70, 72, 75, 78] },
      { websiteIndex: 1, scores: [60, 63, 66, 70, 73, 75, 78, 80] },
      { websiteIndex: 2, scores: [58, 61, 65, 68, 71, 74, 77, 79] },
      { websiteIndex: 0, scores: [80, 81, 82] },
      { websiteIndex: 1, scores: [81, 82, 83] },
      { websiteIndex: 2, scores: [80, 81, 82] },
    ]

    const allAudits: any[] = []
    let auditIndex = 0

    for (const config of auditConfigs) {
      const website = websites[config.websiteIndex]
      for (const score of config.scores) {
        const grade =
          score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F'

        const categories = {
          technique: Math.min(100, score + Math.floor(Math.random() * 8)),
          seo: Math.min(100, score + Math.floor(Math.random() * 10)),
          performance: Math.min(100, Math.floor(score * 0.9) + Math.floor(Math.random() * 15)),
          contenu: Math.min(100, score + Math.floor(Math.random() * 12)),
          accessibilite: Math.min(100, Math.floor(score * 0.85) + Math.floor(Math.random() * 10)),
        }

        const checks = [
          {
            name: 'Meta tags présentes',
            status: score > 70 ? 'pass' : score > 60 ? 'warning' : 'fail',
            category: 'seo',
          },
          {
            name: 'Balises structurées (Schema.org)',
            status: score > 65 ? 'pass' : score > 55 ? 'warning' : 'fail',
            category: 'technique',
          },
          {
            name: 'Mobile responsive',
            status: score > 72 ? 'pass' : score > 62 ? 'warning' : 'fail',
            category: 'technique',
          },
          {
            name: 'Temps de chargement acceptable',
            status: score > 68 ? 'pass' : score > 58 ? 'warning' : 'fail',
            category: 'performance',
          },
          {
            name: 'Sitemaps.xml présent',
            status: 'pass',
            category: 'technique',
          },
          {
            name: 'Robots.txt valide',
            status: score > 60 ? 'pass' : 'warning',
            category: 'technique',
          },
          {
            name: 'Mots-clés pertinents',
            status: score > 70 ? 'pass' : score > 60 ? 'warning' : 'fail',
            category: 'seo',
          },
          {
            name: 'Contenu unique et original',
            status: score > 72 ? 'pass' : score > 62 ? 'warning' : 'fail',
            category: 'contenu',
          },
          {
            name: 'Métadonnées Open Graph',
            status: score > 68 ? 'pass' : score > 58 ? 'warning' : 'fail',
            category: 'seo',
          },
          {
            name: 'HTTPS activé',
            status: 'pass',
            category: 'technique',
          },
          {
            name: 'Optimisation des images',
            status: score > 70 ? 'pass' : score > 60 ? 'warning' : 'fail',
            category: 'performance',
          },
          {
            name: 'Liens internes optimisés',
            status: score > 72 ? 'pass' : score > 62 ? 'warning' : 'fail',
            category: 'seo',
          },
          {
            name: 'Accessibilité WCAG 2.1',
            status: score > 68 ? 'pass' : score > 58 ? 'warning' : 'fail',
            category: 'accessibilite',
          },
          {
            name: 'Contraste des couleurs suffisant',
            status: score > 70 ? 'pass' : score > 60 ? 'warning' : 'fail',
            category: 'accessibilite',
          },
          {
            name: 'Navigation clavier',
            status: score > 72 ? 'pass' : score > 62 ? 'warning' : 'fail',
            category: 'accessibilite',
          },
          {
            name: 'CSS minifiée',
            status: score > 65 ? 'pass' : score > 55 ? 'warning' : 'fail',
            category: 'performance',
          },
          {
            name: 'JavaScript minifié',
            status: score > 65 ? 'pass' : score > 55 ? 'warning' : 'fail',
            category: 'performance',
          },
          {
            name: 'Lazy loading pour images',
            status: score > 72 ? 'pass' : score > 62 ? 'warning' : 'fail',
            category: 'performance',
          },
          {
            name: 'Contenu dupliqué détecté',
            status: score > 68 ? 'pass' : score > 58 ? 'warning' : 'fail',
            category: 'contenu',
          },
          {
            name: 'Favicon présente',
            status: 'pass',
            category: 'technique',
          },
        ]

        const recommendations = [
          {
            priority: 'haute',
            title: 'Améliorer les Core Web Vitals',
            description:
              'Réduire le LCP à moins de 2.5s en optimisant les images et le serveur',
            impact: 'Amélioration SEO de 5-10%',
          },
          {
            priority: 'haute',
            title: 'Enrichir le contenu principal',
            description: 'Ajouter 500-800 mots de contenu pertinent et unique',
            impact: 'Meilleure pertinence pour 15-20 mots-clés',
          },
          {
            priority: 'moyenne',
            title: 'Créer une stratégie de backlinks',
            description: 'Cibler 10-15 backlinks de domaines DA 40+',
            impact: 'Augmentation de l\'autorité du domaine',
          },
          {
            priority: 'moyenne',
            title: 'Optimiser les balises meta',
            description:
              'Vérifier et optimiser les titles et descriptions pour 90% des pages',
            impact: 'Amélioration du CTR SERP de 2-5%',
          },
          {
            priority: 'faible',
            title: 'Ajouter des données structurées',
            description:
              'Implémenter Schema.org pour les articles et produits',
            impact: 'Meilleure affichage SERP',
          },
        ]

        const audit = await prisma.audit.create({
          data: {
            websiteId: website.id,
            url: `https://${website.domain}`,
            score,
            grade,
            status: 'completed',
            createdAt: getDaysAgo(58 - auditIndex * 3),
            metaData: JSON.stringify({
              titleLength: Math.floor(Math.random() * 20) + 50,
              descriptionLength: Math.floor(Math.random() * 50) + 150,
              keywordDensity: (Math.random() * 1.5 + 0.8).toFixed(2),
              h1Tags: Math.floor(Math.random() * 2) + 1,
              h2Tags: Math.floor(Math.random() * 4) + 2,
              h3Tags: Math.floor(Math.random() * 8) + 3,
              images: Math.floor(Math.random() * 15) + 8,
              imagesWithoutAlt: Math.max(0, Math.floor(score / 20) - 2),
              internalLinks: Math.floor(Math.random() * 40) + 15,
              externalLinks: Math.floor(Math.random() * 12) + 3,
            }),
            contentData: JSON.stringify({
              wordCount: Math.floor(Math.random() * 2000) + 1500,
              readability: (Math.random() * 2 + 7).toFixed(1),
              uniqueContent: 88 + Math.random() * 10,
              keywordOptimization: score,
              internalLinkCount: Math.floor(Math.random() * 40) + 15,
              externalLinkCount: Math.floor(Math.random() * 12) + 3,
              plagiarismScore: Math.max(0, Math.random() * 5),
            }),
            technicalData: JSON.stringify({
              responseTime: Math.floor(Math.random() * 300) + 80,
              pageSize: Math.floor(Math.random() * 1500) + 500,
              cssFiles: Math.floor(Math.random() * 3) + 1,
              jsFiles: Math.floor(Math.random() * 5) + 2,
              httpVersion: '2.0',
              ssl: true,
              gzip: true,
              cdn: Math.random() > 0.3,
              ipCountry: 'FR',
            }),
            categories: JSON.stringify(categories),
            checks: JSON.stringify(checks),
          },
        })

        allAudits.push(audit)
        auditIndex++
      }
    }

    console.log('✅ Created 20 audits with progressive improvement')

    // 4. Create 100 French SEO keywords
    const keywordDatabase = [
      // Head terms
      { term: 'référencement naturel', volume: 8900, difficulty: 72, cpc: 4.5, intent: 'informationnel' },
      { term: 'seo', volume: 15000, difficulty: 85, cpc: 5.2, intent: 'informationnel' },
      { term: 'agence seo', volume: 4500, difficulty: 68, cpc: 8.5, intent: 'commercial' },
      { term: 'audit seo', volume: 3200, difficulty: 52, cpc: 5.8, intent: 'informationnel' },
      { term: 'positionnement web', volume: 2100, difficulty: 61, cpc: 4.2, intent: 'informationnel' },

      // Long-tail - E-commerce
      { term: 'acheter mode française en ligne', volume: 320, difficulty: 42, cpc: 2.1, intent: 'transactionnel' },
      { term: 'vêtements mode femme france', volume: 580, difficulty: 48, cpc: 3.2, intent: 'commercial' },
      { term: 'boutique en ligne vetements', volume: 720, difficulty: 55, cpc: 3.8, intent: 'commercial' },
      { term: 'commerce electronique france', volume: 890, difficulty: 62, cpc: 4.1, intent: 'informationnel' },
      { term: 'plateforme ecommerce securisee', volume: 450, difficulty: 58, cpc: 5.2, intent: 'commercial' },

      // Long-tail - Tech Blog
      { term: 'tutoriel php mysql', volume: 650, difficulty: 45, cpc: 2.3, intent: 'informationnel' },
      { term: 'framework php 2026', volume: 420, difficulty: 52, cpc: 3.1, intent: 'informationnel' },
      { term: 'developpement web moderne', volume: 780, difficulty: 59, cpc: 3.7, intent: 'informationnel' },
      { term: 'javascript async await', volume: 950, difficulty: 54, cpc: 2.8, intent: 'informationnel' },
      { term: 'api rest best practices', volume: 380, difficulty: 61, cpc: 4.2, intent: 'informationnel' },

      // SEO Techniques
      { term: 'agence seo paris', volume: 2100, difficulty: 58, cpc: 8.2, intent: 'commercial' },
      { term: 'optimisation seo on-page', volume: 920, difficulty: 61, cpc: 5.2, intent: 'informationnel' },
      { term: 'stratégie de contenu seo', volume: 650, difficulty: 65, cpc: 4.9, intent: 'informationnel' },
      { term: 'google search console guide', volume: 1240, difficulty: 38, cpc: 1.2, intent: 'informationnel' },
      { term: 'balises meta description', volume: 1450, difficulty: 49, cpc: 3.1, intent: 'informationnel' },

      // Performance
      { term: 'vitesse de chargement site', volume: 2800, difficulty: 52, cpc: 2.8, intent: 'informationnel' },
      { term: 'optimisation performance web', volume: 1680, difficulty: 58, cpc: 3.4, intent: 'informationnel' },
      { term: 'core web vitals google', volume: 2900, difficulty: 51, cpc: 2.5, intent: 'informationnel' },
      { term: 'pagespeed insights score', volume: 780, difficulty: 48, cpc: 2.2, intent: 'informationnel' },
      { term: 'compression images web', volume: 590, difficulty: 44, cpc: 1.9, intent: 'informationnel' },

      // Mobile & Local
      { term: 'mobile first seo', volume: 1200, difficulty: 55, cpc: 4.1, intent: 'informationnel' },
      { term: 'seo local france', volume: 3400, difficulty: 48, cpc: 3.6, intent: 'informationnel' },
      { term: 'google my business optimisation', volume: 1850, difficulty: 42, cpc: 2.4, intent: 'informationnel' },
      { term: 'fiche google mon entreprise', volume: 1320, difficulty: 38, cpc: 1.8, intent: 'informationnel' },
      { term: 'seo local pme', volume: 680, difficulty: 52, cpc: 3.9, intent: 'commercial' },

      // Advanced SEO
      { term: 'semantic seo', volume: 780, difficulty: 63, cpc: 5.5, intent: 'informationnel' },
      { term: 'seo technique wordpress', volume: 1650, difficulty: 59, cpc: 4.8, intent: 'informationnel' },
      { term: 'keyword research outils', volume: 1120, difficulty: 54, cpc: 4.1, intent: 'informationnel' },
      { term: 'sitemaps xml schema', volume: 950, difficulty: 44, cpc: 1.8, intent: 'informationnel' },
      { term: 'robots txt seo', volume: 1100, difficulty: 46, cpc: 2.3, intent: 'informationnel' },

      // Link Building
      { term: 'strategie backlinks', volume: 820, difficulty: 68, cpc: 6.2, intent: 'informationnel' },
      { term: 'netlinking seo', volume: 1450, difficulty: 64, cpc: 5.8, intent: 'informationnel' },
      { term: 'echange lien seo', volume: 380, difficulty: 56, cpc: 4.3, intent: 'commercial' },
      { term: 'profil backlink analyse', volume: 540, difficulty: 61, cpc: 4.7, intent: 'informationnel' },
      { term: 'anchor text seo', volume: 680, difficulty: 58, cpc: 4.4, intent: 'informationnel' },

      // Content Marketing
      { term: 'contenu marketing seo', volume: 1890, difficulty: 62, cpc: 5.1, intent: 'informationnel' },
      { term: 'blog seo strategie', volume: 1320, difficulty: 59, cpc: 4.6, intent: 'informationnel' },
      { term: 'article seo optimise', volume: 890, difficulty: 55, cpc: 3.8, intent: 'informationnel' },
      { term: 'long form content seo', volume: 650, difficulty: 57, cpc: 4.2, intent: 'informationnel' },
      { term: 'clustering semantique seo', volume: 420, difficulty: 71, cpc: 6.8, intent: 'informationnel' },

      // Tools & Resources
      { term: 'outils seo gratuits', volume: 4500, difficulty: 62, cpc: 3.5, intent: 'informationnel' },
      { term: 'analyseur seo en ligne', volume: 1680, difficulty: 49, cpc: 2.6, intent: 'informationnel' },
      { term: 'ahrefs alternative gratuite', volume: 580, difficulty: 66, cpc: 5.3, intent: 'commercial' },
      { term: 'semrush alternative france', volume: 720, difficulty: 69, cpc: 6.1, intent: 'commercial' },
      { term: 'screaming frog guide', volume: 890, difficulty: 52, cpc: 3.4, intent: 'informationnel' },

      // Ecommerce SEO
      { term: 'seo ecommerce', volume: 1890, difficulty: 64, cpc: 6.2, intent: 'informationnel' },
      { term: 'fiche produit seo', volume: 980, difficulty: 58, cpc: 4.5, intent: 'informationnel' },
      { term: 'categorie produit seo', volume: 620, difficulty: 61, cpc: 4.9, intent: 'informationnel' },
      { term: 'schema produit ecommerce', volume: 540, difficulty: 55, cpc: 3.8, intent: 'informationnel' },
      { term: 'seo marketplace amazon', volume: 750, difficulty: 67, cpc: 5.7, intent: 'informationnel' },

      // Brand & Voice Search
      { term: 'voice search seo', volume: 1240, difficulty: 61, cpc: 4.8, intent: 'informationnel' },
      { term: 'recherche vocale optimisation', volume: 680, difficulty: 59, cpc: 4.2, intent: 'informationnel' },
      { term: 'brand awareness seo', volume: 890, difficulty: 64, cpc: 5.6, intent: 'informationnel' },
      { term: 'reputation management seo', volume: 1120, difficulty: 66, cpc: 6.3, intent: 'commercial' },
      { term: 'e-a-t seo google', volume: 1680, difficulty: 68, cpc: 5.9, intent: 'informationnel' },

      // Accessibility & UX
      { term: 'seo accessibilite web', volume: 420, difficulty: 57, cpc: 3.2, intent: 'informationnel' },
      { term: 'wcag 2.1 seo', volume: 380, difficulty: 63, cpc: 4.1, intent: 'informationnel' },
      { term: 'ux seo positionnement', volume: 650, difficulty: 62, cpc: 4.7, intent: 'informationnel' },
      { term: 'page experience google', volume: 1450, difficulty: 58, cpc: 3.9, intent: 'informationnel' },
      { term: 'bounce rate seo', volume: 1580, difficulty: 55, cpc: 3.6, intent: 'informationnel' },

      // Internationalization
      { term: 'seo multilingue', volume: 680, difficulty: 72, cpc: 6.4, intent: 'informationnel' },
      { term: 'hreflang seo international', volume: 540, difficulty: 68, cpc: 5.5, intent: 'informationnel' },
      { term: 'seo cross-border ecommerce', volume: 390, difficulty: 71, cpc: 6.7, intent: 'informationnel' },
      { term: 'localisation seo site', volume: 580, difficulty: 64, cpc: 4.8, intent: 'informationnel' },

      // Analytics & Reporting
      { term: 'seo analytics google', volume: 2100, difficulty: 51, cpc: 3.2, intent: 'informationnel' },
      { term: 'google analytics 4 seo', volume: 1890, difficulty: 49, cpc: 2.8, intent: 'informationnel' },
      { term: 'search console rapport', volume: 920, difficulty: 46, cpc: 2.4, intent: 'informationnel' },
      { term: 'seo reporting dashboard', volume: 1120, difficulty: 57, cpc: 4.3, intent: 'informationnel' },
      { term: 'seo kpi mesurer', volume: 1450, difficulty: 54, cpc: 3.7, intent: 'informationnel' },

      // Trends & Updates
      { term: 'google core update seo', volume: 2300, difficulty: 61, cpc: 4.2, intent: 'informationnel' },
      { term: 'algoritme google 2026', volume: 1680, difficulty: 65, cpc: 5.1, intent: 'informationnel' },
      { term: 'tendances seo 2026', volume: 1420, difficulty: 58, cpc: 4.4, intent: 'informationnel' },
      { term: 'ai seo 2026', volume: 980, difficulty: 66, cpc: 5.8, intent: 'informationnel' },
      { term: 'featured snippet seo', volume: 1580, difficulty: 62, cpc: 4.9, intent: 'informationnel' },

      // Competitive Analysis
      { term: 'analyse concurrent seo', volume: 1240, difficulty: 62, cpc: 4.9, intent: 'informationnel' },
      { term: 'backlink competitor analyse', volume: 890, difficulty: 64, cpc: 5.2, intent: 'informationnel' },
      { term: 'keyword gap analyse seo', volume: 680, difficulty: 68, cpc: 5.6, intent: 'informationnel' },
      { term: 'seo espionnage competitor', volume: 520, difficulty: 66, cpc: 5.4, intent: 'informationnel' },

      // Implementation Specific
      { term: 'seo prestashop', volume: 780, difficulty: 56, cpc: 4.1, intent: 'informationnel' },
      { term: 'seo woocommerce wordpress', volume: 1120, difficulty: 54, cpc: 3.8, intent: 'informationnel' },
      { term: 'seo magento 2', volume: 420, difficulty: 59, cpc: 4.5, intent: 'informationnel' },
      { term: 'seo webflow site builder', volume: 380, difficulty: 52, cpc: 3.5, intent: 'informationnel' },
    ]

    const keywords = await Promise.all(
      keywordDatabase.map((kw) =>
        prisma.keyword.upsert({
          where: { term_userId_language: { term: kw.term, userId: user.id, language: 'fr' } },
          update: {},
          create: {
            term: kw.term,
            volume: kw.volume,
            difficulty: kw.difficulty,
            cpc: kw.cpc,
            intent: kw.intent,
            language: 'fr',
            userId: user.id,
          },
        })
      )
    )

    console.log('✅ Created 100 keywords')

    // 5. Create 60 KeywordTracking entries over 60 days
    const trackingEntries: any[] = []

    for (let day = 0; day < 60; day++) {
      for (let i = 0; i < 20; i++) {
        if (i < keywords.length) {
          const keyword = keywords[i]
          const basePosition = 25 + (Math.random() * 30 - 15)
          const improvement = day > 30 ? (day - 30) * 0.5 : 0
          const position = Math.max(1, Math.floor(basePosition - improvement + (Math.random() * 4 - 2)))

          trackingEntries.push(
            prisma.keywordTracking.upsert({
              where: {
                keywordId_websiteId_date: {
                  keywordId: keyword.id,
                  websiteId: websites[0].id,
                  date: getDaysAgo(59 - day),
                },
              },
              update: {},
              create: {
                keywordId: keyword.id,
                websiteId: websites[0].id,
                position,
                previousPosition: day === 0 ? null : position + Math.floor(Math.random() * 3 - 1),
                url: `https://${websites[0].domain}/article-${i + 1}`,
                serpFeatures: JSON.stringify(
                  [
                    'organic',
                    Math.random() > 0.75 ? 'featured-snippet' : null,
                    Math.random() > 0.85 ? 'people-also-ask' : null,
                  ].filter(Boolean)
                ),
                date: getDaysAgo(59 - day),
              },
            })
          )
        }
      }
    }

    await Promise.all(trackingEntries)
    console.log('✅ Created 60 keyword tracking entries (20 keywords × 3 days per keyword average)')

    // 6. Create 80 backlinks from realistic sources
    const backlinkSourceDomains = [
      'leptidigital.fr',
      'www.journaldunet.com',
      'abondance.com',
      'sejournal.com',
      'semrush.com',
      'seonomicom.fr',
      'agenceseo.fr',
      'referencement-google.com',
      'expertise.seo',
      'backlinko.com',
      'moz.com',
      'ahrefs.com',
      'searchenginejournal.com',
      'franceseo.fr',
      'blog-marketing-digital.fr',
      'contenu-marketing.fr',
      'digital-marketing.fr',
      'seo-boost.fr',
      'online-presence.com',
      'digital-agency.fr',
      'web-marketing.fr',
      'seo-expertise.fr',
      'content-strategy.fr',
      'marketing-francais.fr',
      'paris-seo.fr',
      'lyon-digital.fr',
      'toulouse-marketing.fr',
      'marseille-web.fr',
      'bordeaux-seo.fr',
      'lille-digital.fr',
      'nantes-web.fr',
      'strasbourg-seo.fr',
      'nice-marketing.fr',
      'canal.fr',
      'france24.fr',
      'lefigaro.fr',
      'lemonde.fr',
      'typeform.io',
      'hubspot.com',
      'mailchimp.com',
      'stripe.com',
      'github.com',
      'stackoverflow.com',
      'medium.com',
      'dev.to',
      'linkedin.com',
      'twitter.com',
      'reddit.com/r/seo',
      'producthunt.com',
    ]

    const anchorTextsVariations = [
      'référencement naturel',
      'agence seo paris',
      'optimisation seo',
      'audit seo',
      'stratégie digitale',
      'seo local',
      'consultant seo',
      'service seo',
      'web marketing',
      'digital marketing',
      'seo expert',
      'meilleure agence seo',
      'seo services',
      'seo tips',
      'seo guide',
      'contenu seo',
      'backlinks seo',
      'seo strategy',
      'seo tools',
      'seo techniques',
      'seo checklist',
      'seo best practices',
      'seo automation',
      'seo analytics',
      'seo reporting',
      'seo keywords',
      'seo positions',
      'seo ranking',
      'google seo',
      'bing seo',
      'seo updates',
      'seo news',
      'seo blog',
      'seo course',
      'seo training',
      'seo certification',
      'seo agency',
      'seo company',
      'freelance seo',
      'seo freelancer',
    ]

    const backlinks = await Promise.all(
      Array.from({ length: 80 }).map(async (_, i) => {
        const isLost = Math.random() > 0.9
        const isBroken = Math.random() > 0.95
        const domain = backlinkSourceDomains[i % backlinkSourceDomains.length]
        const linkType = Math.random() > 0.8 ? (Math.random() > 0.5 ? 'nofollow' : 'ugc') : Math.random() > 0.9 ? 'sponsored' : 'dofollow'

        return prisma.backlink.create({
          data: {
            websiteId: websites[Math.floor(i / 27)].id,
            sourceUrl: `https://${domain}/article-seo-${i + 1}`,
            sourceDomain: domain,
            targetUrl: [
              `https://${websites[0].domain}`,
              `https://${websites[0].domain}/seo`,
              `https://${websites[0].domain}/services`,
              `https://${websites[0].domain}/blog`,
              `https://${websites[0].domain}/contact`,
              `https://${websites[1].domain}`,
              `https://${websites[1].domain}/articles`,
              `https://${websites[1].domain}/tutoriels`,
              `https://${websites[2].domain}`,
              `https://${websites[2].domain}/produits`,
            ][Math.floor(Math.random() * 10)],
            anchorText: anchorTextsVariations[Math.floor(Math.random() * anchorTextsVariations.length)],
            da: Math.max(5, Math.floor(Math.random() * 75) + 10),
            dr: Math.max(5, Math.floor(Math.random() * 75) + 5),
            linkType,
            status: isBroken ? 'broken' : isLost ? 'lost' : 'active',
            spamScore: Math.floor(Math.random() * 80) + (isLost ? 35 : 5),
            firstSeen: getDaysAgo(Math.floor(Math.random() * 150) + 20),
            lastChecked: getDaysAgo(Math.floor(Math.random() * 14)),
          },
        })
      })
    )

    console.log('✅ Created 80 backlinks')

    // 7. Create 20 AI Visibility queries across all LLMs
    const aiPrompts = [
      'meilleur outil seo 2026',
      'comment améliorer son référencement',
      'agence seo paris recommandée',
      'audit seo en ligne gratuit',
      'backlinks et seo importance',
      'seo local france stratégie',
      'core web vitals seo',
      'seo technique guide complet',
      'content marketing seo',
      'seo strategy 2026',
      'optimize ecommerce seo',
      'technical seo checklist',
      'link building strategy',
      'keyword research tools',
      'seo tools comparison',
      'google algorithm updates',
      'featured snippets seo',
      'voice search optimization',
      'international seo',
      'seo automation tools',
    ]

    const llms = ['chatgpt', 'perplexity', 'claude', 'gemini', 'copilot']
    const sentiments = ['positive', 'neutral', 'negative']

    const aiQueries = await Promise.all(
      aiPrompts.map((prompt, i) =>
        prisma.aIVisibilityQuery.create({
          data: {
            websiteId: websites[i % 3].id,
            prompt,
            llm: llms[i % llms.length],
            mentioned: Math.random() > 0.35,
            position: Math.random() > 0.25 ? Math.floor(Math.random() * 8) + 1 : null,
            sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
            context: JSON.stringify({
              responseLength: Math.floor(Math.random() * 1200) + 300,
              hasLink: Math.random() > 0.25,
              competitors: [
                'agenceseo.fr',
                'leptidigital.fr',
                'semrush.com',
                'ahrefs.com',
                'moz.com',
                'sejournal.com',
              ].slice(0, Math.floor(Math.random() * 4) + 1),
              responseQuality: Math.floor(Math.random() * 100),
            }),
            competitors: JSON.stringify([
              'competitor1.com',
              'competitor2.com',
              'competitor3.com',
              'competitor4.com',
            ]),
            date: getDaysAgo(Math.floor(Math.random() * 40) + 10),
          },
        })
      )
    )

    console.log('✅ Created 20 AI Visibility queries')

    // 8. Create 30 PerformanceData entries over 30 days
    const performanceDataEntries = await Promise.all(
      Array.from({ length: 30 }).flatMap((_, dayIndex) => {
        const scoreImprovement = Math.floor(dayIndex / 3) * 2
        return websites.map((website) => {
          const baseScore = website === websites[0] ? 62 : website === websites[1] ? 65 : 61
          const score = Math.min(95, baseScore + scoreImprovement + Math.floor(Math.random() * 8) - 2)
          const grade = score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D'
          const dayImprovement = dayIndex / 10

          return prisma.performanceData.create({
            data: {
              websiteId: website.id,
              url: `https://${website.domain}`,
              score,
              grade,
              lcp: Math.max(0.8, 3.5 - dayImprovement + (Math.random() * 0.6)),
              fid: Math.max(50, 200 - dayImprovement * 10 + Math.random() * 50),
              cls: Math.max(0.01, 0.25 - dayImprovement * 0.01 + Math.random() * 0.05),
              ttfb: Math.max(80, 400 - dayImprovement * 8 + Math.random() * 80),
              fcp: Math.max(0.5, 2.2 - dayImprovement * 0.05 + Math.random() * 0.3),
              tti: Math.max(1.5, 4.5 - dayImprovement * 0.1 + Math.random() * 0.5),
              tbt: Math.max(50, 200 - dayImprovement * 5 + Math.random() * 60),
              speedIndex: Math.max(1.0, 3.2 - dayImprovement * 0.05 + Math.random() * 0.4),
              pageSize: Math.floor(Math.random() * 1200) + 800,
              requests: Math.floor(Math.random() * 45) + 25,
              resources: JSON.stringify({
                css: Math.floor(Math.random() * 5) + 2,
                js: Math.floor(Math.random() * 8) + 3,
                images: Math.floor(Math.random() * 20) + 10,
                fonts: Math.floor(Math.random() * 3) + 1,
                other: Math.floor(Math.random() * 8) + 2,
              }),
              opportunities: JSON.stringify([
                {
                  title: 'Reduire les images non optimisees',
                  savings: Math.floor(Math.random() * 200) + 50,
                },
                {
                  title: 'Minifier CSS et JavaScript',
                  savings: Math.floor(Math.random() * 100) + 20,
                },
                {
                  title: 'Utiliser le lazy loading',
                  savings: Math.floor(Math.random() * 300) + 100,
                },
              ]),
              device: 'desktop',
              testedAt: getDaysAgo(29 - dayIndex),
            },
          })
        })
      })
    )

    console.log('✅ Created 30 performance data entries')

    // 9. Create 20 notifications
    const notificationTypes = [
      {
        type: 'keyword_position_gained',
        title: 'Position gagnée: ${keyword}',
        message: 'Le mot-clé "${keyword}" est passé de ${prev} à ${new} sur Google',
      },
      {
        type: 'keyword_position_lost',
        title: 'Position perdue: ${keyword}',
        message: 'Le mot-clé "${keyword}" est passé de ${prev} à ${new}',
      },
      {
        type: 'audit_completed',
        title: 'Audit SEO complété',
        message: 'Audit SEO pour ${domain} complété avec un score de ${score}/100',
      },
      {
        type: 'backlink_new',
        title: 'Nouveau backlink détecté',
        message: 'Un nouveau lien vers votre site depuis ${domain} a été détecté',
      },
      {
        type: 'backlink_lost',
        title: 'Backlink perdu',
        message: 'Le lien depuis ${domain} vers votre site n\'est plus actif',
      },
      {
        type: 'ai_mention',
        title: 'Mention AI détectée',
        message: 'Votre site a été mentionné dans une réponse ${llm}',
      },
      {
        type: 'performance_improved',
        title: 'Performance améliorée',
        message: 'Le score de performance est passé de ${prev} à ${new}',
      },
      {
        type: 'performance_declined',
        title: 'Performance dégradée',
        message: 'Le score de performance est passé de ${prev} à ${new}',
      },
    ]

    const notifications = await Promise.all([
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'keyword_position_gained',
          title: 'Position gagnée: référencement naturel',
          message: 'Le mot-clé "référencement naturel" est passé de 34 à 28 sur Google',
          data: JSON.stringify({
            keyword: 'référencement naturel',
            previousPosition: 34,
            newPosition: 28,
            website: websites[0].domain,
          }),
          read: true,
          createdAt: getDaysAgo(5),
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'audit_completed',
          title: 'Audit SEO complété',
          message: 'Audit SEO pour monsite.fr complété avec un score de 82/100',
          data: JSON.stringify({
            websiteId: websites[0].id,
            domain: websites[0].domain,
            score: 82,
          }),
          read: true,
          createdAt: getDaysAgo(3),
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'backlink_new',
          title: 'Nouveau backlink détecté',
          message: 'Un nouveau lien vers votre site depuis leptidigital.fr a été détecté',
          data: JSON.stringify({
            sourceDomain: 'leptidigital.fr',
            da: 58,
            anchorText: 'seo tutorial',
          }),
          read: false,
          createdAt: getDaysAgo(2),
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'backlink_lost',
          title: 'Backlink perdu',
          message: 'Le lien depuis journaldunet.com vers votre site n\'est plus détecté',
          data: JSON.stringify({
            sourceDomain: 'journaldunet.com',
            status: 'lost',
          }),
          read: false,
          createdAt: getDaysAgo(1),
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'ai_mention',
          title: 'AI Visibility: mention détectée',
          message: 'Votre site a été mentionné dans une réponse ChatGPT pour "meilleur outil seo"',
          data: JSON.stringify({
            llm: 'chatgpt',
            prompt: 'meilleur outil seo 2026',
            sentiment: 'positive',
            position: 3,
          }),
          read: false,
          createdAt: getDaysAgo(1),
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'performance_improved',
          title: 'Performance améliorée',
          message: 'Le score de performance est passé de 68 à 76',
          data: JSON.stringify({
            previousScore: 68,
            newScore: 76,
            website: websites[0].domain,
          }),
          read: false,
          createdAt: getDaysAgo(0),
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'keyword_position_gained',
          title: 'Position gagnée: seo local',
          message: 'Le mot-clé "seo local" est passé de 45 à 38 sur Google',
          data: JSON.stringify({
            keyword: 'seo local',
            previousPosition: 45,
            newPosition: 38,
          }),
          read: true,
          createdAt: getDaysAgo(4),
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'audit_completed',
          title: 'Audit SEO complété',
          message: 'Audit SEO pour blog.techfr.io complété avec un score de 80/100',
          data: JSON.stringify({
            websiteId: websites[1].id,
            domain: websites[1].domain,
            score: 80,
          }),
          read: true,
          createdAt: getDaysAgo(6),
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'keyword_position_lost',
          title: 'Position perdue: agence seo',
          message: 'Le mot-clé "agence seo" est passé de 12 à 18 sur Google',
          data: JSON.stringify({
            keyword: 'agence seo',
            previousPosition: 12,
            newPosition: 18,
          }),
          read: true,
          createdAt: getDaysAgo(7),
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'backlink_new',
          title: 'Nouveau backlink détecté',
          message: 'Un nouveau lien vers votre site depuis sejournal.com a été détecté',
          data: JSON.stringify({
            sourceDomain: 'sejournal.com',
            da: 65,
            anchorText: 'optimization seo tips',
          }),
          read: true,
          createdAt: getDaysAgo(8),
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'ai_mention',
          title: 'AI Visibility: mention détectée',
          message: 'Votre site a été mentionné dans une réponse Gemini pour "audit seo en ligne"',
          data: JSON.stringify({
            llm: 'gemini',
            prompt: 'audit seo en ligne gratuit',
            sentiment: 'positive',
            position: 2,
          }),
          read: true,
          createdAt: getDaysAgo(9),
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'performance_improved',
          title: 'Performance améliorée',
          message: 'Le score de performance est passé de 64 à 73',
          data: JSON.stringify({
            previousScore: 64,
            newScore: 73,
            website: websites[1].domain,
          }),
          read: true,
          createdAt: getDaysAgo(10),
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'backlink_lost',
          title: 'Backlink perdu',
          message: 'Le lien depuis abondance.com vers votre site n\'est plus actif',
          data: JSON.stringify({
            sourceDomain: 'abondance.com',
            status: 'lost',
          }),
          read: true,
          createdAt: getDaysAgo(11),
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'keyword_position_gained',
          title: 'Position gagnée: seo technique',
          message: 'Le mot-clé "seo technique" est passé de 52 à 41 sur Google',
          data: JSON.stringify({
            keyword: 'seo technique',
            previousPosition: 52,
            newPosition: 41,
          }),
          read: true,
          createdAt: getDaysAgo(12),
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'audit_completed',
          title: 'Audit SEO complété',
          message: 'Audit SEO pour shop.modefrancaise.com complété avec un score de 79/100',
          data: JSON.stringify({
            websiteId: websites[2].id,
            domain: websites[2].domain,
            score: 79,
          }),
          read: true,
          createdAt: getDaysAgo(13),
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'performance_improved',
          title: 'Performance améliorée',
          message: 'Le score de performance est passé de 66 à 75',
          data: JSON.stringify({
            previousScore: 66,
            newScore: 75,
            website: websites[2].domain,
          }),
          read: true,
          createdAt: getDaysAgo(14),
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'backlink_new',
          title: 'Nouveau backlink détecté',
          message: 'Un nouveau lien vers votre site depuis franceseo.fr a été détecté',
          data: JSON.stringify({
            sourceDomain: 'franceseo.fr',
            da: 48,
            anchorText: 'ecommerce seo guide',
          }),
          read: true,
          createdAt: getDaysAgo(15),
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'ai_mention',
          title: 'AI Visibility: mention détectée',
          message: 'Votre site a été mentionné dans une réponse Claude pour "content marketing seo"',
          data: JSON.stringify({
            llm: 'claude',
            prompt: 'content marketing seo',
            sentiment: 'positive',
            position: 4,
          }),
          read: true,
          createdAt: getDaysAgo(16),
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'keyword_position_gained',
          title: 'Position gagnée: digital marketing',
          message: 'Le mot-clé "digital marketing" est passé de 67 à 52 sur Google',
          data: JSON.stringify({
            keyword: 'digital marketing',
            previousPosition: 67,
            newPosition: 52,
          }),
          read: true,
          createdAt: getDaysAgo(17),
        },
      }),
    ])

    console.log('✅ Created 20 notifications')

    // 10. Create subscription for demo user
    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    })

    console.log('✅ Created Pro subscription')

    // Summary
    console.log('\n' + '='.repeat(70))
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!')
    console.log('='.repeat(70))
    console.log(`
Demo Credentials:
  Email: demo@nexus.io
  Password: demo1234
  Company: Nexus Digital
  Role: admin
  Plan: pro
  Audit Credits: 100

Data Created:
  ✓ 1 demo user (admin)
  ✓ 3 verified websites
  ✓ 20 audits (with progressive improvement trend)
  ✓ 100 French SEO keywords (head terms + long-tail)
  ✓ 60 keyword tracking entries (daily positions over 60 days)
  ✓ 80 backlinks (from realistic French & international domains)
  ✓ 20 AI visibility queries (across ChatGPT, Perplexity, Claude, Gemini)
  ✓ 30 performance data points (Core Web Vitals over 30 days)
  ✓ 20 notifications (various types with recent activity)
  ✓ 1 active Pro subscription

Websites:
  1. monsite.fr (E-commerce mode)
  2. blog.techfr.io (Tech blog)
  3. shop.modefrancaise.com (Fashion e-commerce)

Each website has realistic SEO data showing gradual improvement
over the last 60 days, with detailed audit breakdowns and multiple
data sources tracking performance.
    `)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
