import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, corsOptionsResponse } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptionsResponse();
}

interface TopicItem {
  title: string;
  description: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
}

function generateSubTopics(topic: string): TopicItem[] {
  const templates = [
    { suffix: 'pour les débutants', desc: `Introduction complète au ${topic} pour ceux qui débutent.`, difficulty: 'facile' as const },
    { suffix: 'avancé', desc: `Techniques avancées et stratégies professionnelles en ${topic}.`, difficulty: 'difficile' as const },
    { suffix: 'local', desc: `Comment adapter le ${topic} à une stratégie locale et de proximité.`, difficulty: 'moyen' as const },
    { suffix: 'international', desc: `Déployer une stratégie de ${topic} à l'échelle internationale.`, difficulty: 'difficile' as const },
    { suffix: 'tendances 2026', desc: `Les dernières tendances et évolutions du ${topic} en 2026.`, difficulty: 'moyen' as const },
  ];
  return templates.map(t => ({
    title: `${topic} ${t.suffix}`,
    description: t.desc,
    difficulty: t.difficulty,
  }));
}

function generateQuestions(topic: string): TopicItem[] {
  const templates = [
    { q: `Comment améliorer son ${topic} ?`, desc: `Guide pratique pour optimiser votre stratégie de ${topic} étape par étape.`, difficulty: 'moyen' as const },
    { q: `Quels sont les outils indispensables pour le ${topic} ?`, desc: `Comparatif des meilleurs outils et logiciels pour le ${topic}.`, difficulty: 'facile' as const },
    { q: `Combien de temps faut-il pour voir des résultats en ${topic} ?`, desc: `Calendrier réaliste et facteurs qui influencent la vitesse des résultats.`, difficulty: 'facile' as const },
    { q: `Quelles erreurs éviter en ${topic} ?`, desc: `Les pièges courants et comment les contourner pour maximiser vos résultats.`, difficulty: 'moyen' as const },
    { q: `Le ${topic} est-il toujours pertinent en 2026 ?`, desc: `Analyse de l'évolution du ${topic} face aux nouvelles technologies et tendances.`, difficulty: 'difficile' as const },
  ];
  return templates.map(t => ({
    title: t.q,
    description: t.desc,
    difficulty: t.difficulty,
  }));
}

function generateAngles(topic: string): TopicItem[] {
  const templates = [
    { title: `Guide complet du ${topic} en 2026`, desc: `Article pilier couvrant tous les aspects du ${topic} de manière exhaustive.`, difficulty: 'difficile' as const },
    { title: `${topic} : étude de cas avec résultats concrets`, desc: `Présentation d'un cas réel avec métriques avant/après et leçons apprises.`, difficulty: 'moyen' as const },
    { title: `${topic} vs méthodes traditionnelles`, desc: `Comparaison objective entre le ${topic} et les approches classiques.`, difficulty: 'moyen' as const },
    { title: `Checklist ${topic} : les 20 points essentiels`, desc: `Liste actionnable et vérifiable pour ne rien oublier dans votre stratégie.`, difficulty: 'facile' as const },
    { title: `ROI du ${topic} : comment le mesurer`, desc: `Méthodologie pour calculer et démontrer le retour sur investissement.`, difficulty: 'difficile' as const },
  ];
  return templates.map(t => ({
    title: t.title,
    description: t.desc,
    difficulty: t.difficulty,
  }));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'Le champ "topic" est requis.' }, { status: 400, headers: corsHeaders() });
    }

    const trimmed = topic.trim();
    const subTopics = generateSubTopics(trimmed);
    const questions = generateQuestions(trimmed);
    const angles = generateAngles(trimmed);

    return NextResponse.json({
      topic: trimmed,
      subTopics,
      questions,
      angles,
    }, { headers: corsHeaders() });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers: corsHeaders() });
  }
}
