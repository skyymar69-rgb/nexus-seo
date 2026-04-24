import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, corsOptionsResponse } from '@/lib/cors'

/**
 * Google My Business Configuration Generator
 * POST /api/gmb-config { businessName, category, address, phone, email, website, hours, services, description }
 *
 * Genere une configuration optimisee pour Google My Business
 * avec recommandations SEO local + GEO
 */

interface GMBConfig {
  businessInfo: {
    name: string
    category: string
    subcategories: string[]
    description: string
    shortDescription: string
    website: string
    phone: string
    email: string
  }
  address: {
    street: string
    city: string
    postalCode: string
    country: string
    serviceArea?: string[]
  }
  hours: Array<{ day: string; open: string; close: string; closed: boolean }>
  attributes: string[]
  services: Array<{ name: string; description: string; price?: string }>
  posts: Array<{ type: string; title: string; content: string; cta: string }>
  seoRecommendations: string[]
  geoRecommendations: string[]
  schema: string
}

const CATEGORY_MAP: Record<string, { subcategories: string[]; attributes: string[]; services: string[] }> = {
  'restaurant': {
    subcategories: ['Restaurant', 'Brasserie', 'Traiteur'],
    attributes: ['Terrasse', 'Wi-Fi gratuit', 'Accessible PMR', 'Parking', 'Livraison', 'A emporter', 'Reservation en ligne'],
    services: ['Dejeuner', 'Diner', 'Brunch', 'Traiteur evenementiel', 'Plats a emporter'],
  },
  'agence-web': {
    subcategories: ['Agence web', 'Agence de marketing', 'Consultant SEO', 'Developpeur web'],
    attributes: ['Rendez-vous en ligne', 'Consultation gratuite', 'Devis gratuit', 'Travail a distance'],
    services: ['Creation de site web', 'Referencement SEO', 'Marketing digital', 'Maintenance web', 'Refonte de site', 'E-commerce'],
  },
  'commerce': {
    subcategories: ['Commerce de detail', 'Boutique', 'Magasin specialise'],
    attributes: ['Parking', 'Accessible PMR', 'Click & collect', 'Livraison', 'Paiement CB'],
    services: ['Vente en magasin', 'Vente en ligne', 'Click & collect', 'Livraison a domicile', 'Carte cadeau'],
  },
  'artisan': {
    subcategories: ['Artisan', 'Prestataire de services', 'Reparateur'],
    attributes: ['Devis gratuit', 'Intervention a domicile', 'Urgences', 'Garantie'],
    services: ['Depannage', 'Installation', 'Renovation', 'Entretien', 'Conseil'],
  },
  'sante': {
    subcategories: ['Cabinet medical', 'Praticien de sante', 'Centre de soins'],
    attributes: ['Rendez-vous en ligne', 'Teleconsultation', 'Accessible PMR', 'Parking'],
    services: ['Consultation', 'Bilan', 'Suivi', 'Teleconsultation', 'Urgences'],
  },
  'immobilier': {
    subcategories: ['Agence immobiliere', 'Agent immobilier', 'Gestion locative'],
    attributes: ['Estimation gratuite', 'Visite virtuelle', 'Rendez-vous en ligne'],
    services: ['Vente', 'Location', 'Gestion locative', 'Estimation', 'Conseil en investissement'],
  },
  'autre': {
    subcategories: ['Entreprise', 'Prestataire de services'],
    attributes: ['Rendez-vous en ligne', 'Accessible PMR'],
    services: ['Prestation sur mesure', 'Conseil', 'Formation'],
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessName, category, address, city, postalCode, phone, email, website, description, services } = body

    if (!businessName || !category) {
      return NextResponse.json({ error: 'Nom et categorie requis' }, { status: 400, headers: corsHeaders() })
    }

    const catConfig = CATEGORY_MAP[category] || CATEGORY_MAP['autre']

    // Generate optimized description (max 750 chars for GMB)
    const optimizedDesc = description
      ? description.slice(0, 750)
      : `${businessName} est ${catConfig.subcategories[0]?.toLowerCase() || 'une entreprise'} a ${city || 'votre ville'}. ${catConfig.services.slice(0, 3).join(', ')}. Contactez-nous pour un devis gratuit.`

    const shortDesc = optimizedDesc.slice(0, 250)

    // Generate opening hours (default: Mon-Fri 9-18, Sat 9-12)
    const defaultHours = [
      { day: 'Lundi', open: '09:00', close: '18:00', closed: false },
      { day: 'Mardi', open: '09:00', close: '18:00', closed: false },
      { day: 'Mercredi', open: '09:00', close: '18:00', closed: false },
      { day: 'Jeudi', open: '09:00', close: '18:00', closed: false },
      { day: 'Vendredi', open: '09:00', close: '18:00', closed: false },
      { day: 'Samedi', open: '09:00', close: '12:00', closed: false },
      { day: 'Dimanche', open: '', close: '', closed: true },
    ]

    // Generate GMB posts suggestions
    const posts = [
      {
        type: 'Nouveauté',
        title: `Découvrez ${businessName}`,
        content: `${businessName} vous accueille à ${city || 'votre ville'}. ${shortDesc}`,
        cta: 'En savoir plus',
      },
      {
        type: 'Offre',
        title: 'Offre spéciale nouveau client',
        content: `Bénéficiez d'une offre de bienvenue chez ${businessName}. ${catConfig.services[0] ? `${catConfig.services[0]} inclus.` : 'Contactez-nous.'}`,
        cta: 'Profiter de l\'offre',
      },
      {
        type: 'Événement',
        title: `${businessName} — Portes ouvertes`,
        content: `Venez découvrir nos services lors de nos portes ouvertes. ${catConfig.services.slice(0, 2).join(' et ')} en démonstration.`,
        cta: 'S\'inscrire',
      },
    ]

    // SEO Local recommendations
    const seoRecommendations = [
      `Utilisez le nom exact "${businessName}" partout (site web, réseaux sociaux, annuaires)`,
      `Ajoutez des photos de qualité : façade, intérieur, équipe, produits (minimum 10 photos)`,
      `Répondez à TOUS les avis Google (positifs et négatifs) dans les 24h`,
      `Publiez un Google Post au minimum chaque semaine`,
      `Complétez 100% des informations de votre fiche (description, horaires, services, attributs)`,
      `Ajoutez votre adresse exacte dans le footer de votre site web`,
      `Créez une page "Avis" sur votre site avec un lien vers votre fiche Google`,
      `Inscrivez-vous dans les annuaires locaux (PagesJaunes, Yelp, TripAdvisor si pertinent)`,
    ]

    // GEO recommendations
    const geoRecommendations = [
      `Créez un fichier llms.txt sur votre site (utilisez le générateur Nexus)`,
      `Ajoutez le schéma LocalBusiness JSON-LD sur votre site`,
      `Les LLMs citent les entreprises avec des avis positifs — visez 4.5+ étoiles`,
      `Mentionnez votre ville dans le title de votre page d'accueil`,
      `Créez du contenu "local" : articles sur votre ville, votre quartier, vos événements`,
    ]

    // Generate LocalBusiness schema
    const schema = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: businessName,
      description: shortDesc,
      url: website || '',
      telephone: phone || '',
      email: email || '',
      address: {
        '@type': 'PostalAddress',
        streetAddress: address || '',
        addressLocality: city || '',
        postalCode: postalCode || '',
        addressCountry: 'FR',
      },
      openingHoursSpecification: defaultHours.filter(h => !h.closed).map(h => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.day,
        opens: h.open,
        closes: h.close,
      })),
    }, null, 2)

    const config: GMBConfig = {
      businessInfo: {
        name: businessName,
        category: catConfig.subcategories[0] || category,
        subcategories: catConfig.subcategories,
        description: optimizedDesc,
        shortDescription: shortDesc,
        website: website || '',
        phone: phone || '',
        email: email || '',
      },
      address: {
        street: address || '',
        city: city || '',
        postalCode: postalCode || '',
        country: 'France',
      },
      hours: defaultHours,
      attributes: catConfig.attributes,
      services: (services ? services.split(',').map((s: string) => s.trim()) : catConfig.services).map((s: string) => ({
        name: s,
        description: `${s} par ${businessName}`,
      })),
      posts,
      seoRecommendations,
      geoRecommendations,
      schema,
    }

    return NextResponse.json({ success: true, config }, { headers: corsHeaders() })
  } catch (error) {
    return NextResponse.json(
      { error: `Erreur: ${error instanceof Error ? error.message : 'Inconnue'}` },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return corsOptionsResponse()
}
