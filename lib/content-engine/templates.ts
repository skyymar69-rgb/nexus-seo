/**
 * Content template banks for multi-language SEO content generation.
 * Each template uses {keyword} and {Keyword} placeholders for insertion.
 */

export interface TemplateBank {
  titlePatterns: string[]
  h2Patterns: string[]
  introPatterns: string[]
  bodyParagraphs: string[]
  conclusionPatterns: string[]
  transitions: string[]
  bulletPoints: string[]
  ctaPatterns: string[]
  faqQuestions: string[]
  faqAnswerPatterns: string[]
  metaDescPatterns: string[]
  productFeatures: string[]
  toneModifiers: Record<string, { connectors: string[]; openers: string[]; closers: string[] }>
}

const fr: TemplateBank = {
  titlePatterns: [
    '{Keyword} : Le Guide Complet pour Reussir en {year}',
    'Tout Savoir sur {Keyword} — Strategies et Bonnes Pratiques',
    '{Keyword} : 7 Strategies Eprouvees pour Optimiser Vos Resultats',
    'Comment Maitriser {Keyword} : Guide Pratique et Conseils d\'Experts',
    '{Keyword} — Les Meilleures Pratiques pour Booster Votre Performance',
    'Pourquoi {Keyword} Est Essentiel : Analyse Complete et Recommandations',
    '{Keyword} de A a Z : Tout Ce Que Vous Devez Savoir',
    'Les Secrets de {Keyword} : Comment les Experts Optimisent Leurs Resultats',
    '{Keyword} : Comparatif, Conseils et Strategies Gagnantes',
    'Guide Ultime de {Keyword} : Methodes Testees et Approuvees',
  ],

  h2Patterns: [
    'Qu\'est-ce que {keyword} et pourquoi est-ce important ?',
    'Les avantages cles de {keyword}',
    'Comment mettre en place {keyword} efficacement',
    'Les meilleures pratiques pour {keyword}',
    'Les erreurs courantes a eviter avec {keyword}',
    '{Keyword} : les tendances actuelles a connaitre',
    'Comment mesurer les resultats de {keyword}',
    'Outils et ressources recommandes pour {keyword}',
    'Etude de cas : {keyword} en action',
    '{Keyword} vs les alternatives : comparatif detaille',
    'Les etapes cles pour reussir avec {keyword}',
    'FAQ sur {keyword}',
    'Conseils d\'experts pour optimiser {keyword}',
    'L\'avenir de {keyword} : ce qui va changer',
    'Comment integrer {keyword} dans votre strategie globale',
  ],

  introPatterns: [
    'Dans un environnement numerique en constante evolution, {keyword} est devenu un element incontournable pour toute strategie performante. Que vous soyez debutant ou expert, comprendre les fondamentaux de {keyword} vous permettra d\'obtenir des resultats concrets et mesurables. Ce guide vous presente les meilleures approches pour tirer le meilleur parti de {keyword}.',
    '{Keyword} represente aujourd\'hui un levier strategique majeur. De nombreuses entreprises et professionnels reconnaissent l\'importance de {keyword} dans l\'atteinte de leurs objectifs. Dans cet article, nous explorons en detail les methodes les plus efficaces pour exploiter tout le potentiel de {keyword}.',
    'Vous cherchez a ameliorer vos performances grace a {keyword} ? Vous etes au bon endroit. {Keyword} offre des opportunites considerables pour ceux qui savent l\'utiliser correctement. Decouvrez dans ce guide complet les strategies, outils et bonnes pratiques qui font la difference.',
    'Le monde du digital evolue rapidement, et {keyword} s\'impose comme une composante essentielle du succes. Que vous souhaitiez optimiser votre visibilite, ameliorer votre ROI ou renforcer votre positionnement, {keyword} est la cle. Voici tout ce que vous devez savoir pour passer a l\'action.',
    'La maitrise de {keyword} n\'est plus optionnelle — c\'est un avantage competitif decisif. Les professionnels qui investissent dans {keyword} constatent des ameliorations significatives de leurs performances. Ce guide detaille vous accompagne pas a pas dans la mise en oeuvre d\'une strategie {keyword} efficace.',
  ],

  bodyParagraphs: [
    'L\'un des aspects les plus importants de {keyword} reside dans sa capacite a generer des resultats durables. Contrairement aux approches a court terme, une strategie bien pensee autour de {keyword} permet de construire une base solide pour une croissance continue.',
    'Pour tirer le meilleur parti de {keyword}, il est essentiel d\'adopter une approche methodique. Commencez par definir vos objectifs clairement, identifiez les indicateurs de performance pertinents, puis mettez en place un plan d\'action structure.',
    'Les donnees montrent que les entreprises qui investissent dans {keyword} obtiennent en moyenne de meilleurs resultats que celles qui negligent cet aspect. L\'optimisation de {keyword} n\'est pas un luxe — c\'est un investissement strategique a fort retour.',
    'Il est crucial de comprendre que {keyword} ne fonctionne pas de maniere isolee. Pour maximiser son impact, integrez {keyword} dans une strategie globale qui prend en compte l\'ensemble de vos canaux et points de contact.',
    'L\'une des erreurs les plus frequentes est de sous-estimer la complexite de {keyword}. Une approche superficielle donne rarement des resultats satisfaisants. Prenez le temps d\'analyser en profondeur votre situation et d\'adapter votre strategie en consequence.',
    'La cle du succes avec {keyword} repose sur la constance et l\'iteration. Les meilleurs resultats ne viennent pas du jour au lendemain, mais d\'un effort soutenu et d\'une optimisation continue basee sur les donnees.',
    'Parmi les facteurs de succes de {keyword}, on retrouve la qualite du contenu, la pertinence de l\'approche et la capacite a s\'adapter aux evolutions du marche. Chacun de ces elements merite une attention particuliere.',
    'Les outils disponibles aujourd\'hui facilitent grandement la mise en oeuvre de {keyword}. Qu\'il s\'agisse de solutions d\'analyse, d\'automatisation ou de suivi, vous disposez d\'un ecosysteme riche pour soutenir vos efforts.',
    'Un aspect souvent neglige de {keyword} est l\'importance de l\'experience utilisateur. Vos efforts seront d\'autant plus efficaces qu\'ils s\'inscrivent dans une demarche centree sur les besoins de votre audience cible.',
    'Le benchmarking est une etape importante dans toute strategie liee a {keyword}. Analysez ce que font vos concurrents, identifiez les bonnes pratiques du secteur, et trouvez votre propre angle de differenciation.',
    'La formation et la veille constituent des piliers essentiels pour rester performant en matiere de {keyword}. Le domaine evolue rapidement, et les professionnels qui se forment en continu gardent une longueur d\'avance.',
    'N\'oubliez pas que {keyword} doit toujours etre aligne avec vos objectifs business. Chaque action entreprise doit contribuer a un resultat mesurable et significatif pour votre activite.',
    'Pour une mise en oeuvre reussie de {keyword}, constituez une equipe dediee ou designez un referent interne. La coherence et la continuite sont des facteurs determinants dans la reussite a long terme.',
    'Les retours d\'experience montrent que la personnalisation est un facteur cle de succes avec {keyword}. Adaptez votre approche a votre contexte specifique plutot que d\'appliquer des recettes generiques.',
    'Enfin, n\'hesitez pas a tester differentes approches de {keyword}. L\'experimentation methodique vous permettra d\'identifier les leviers les plus efficaces pour votre situation particuliere.',
  ],

  conclusionPatterns: [
    '{Keyword} est un levier puissant qui merite toute votre attention. En appliquant les strategies et bonnes pratiques presentees dans ce guide, vous disposez de toutes les cles pour obtenir des resultats concrets. N\'attendez plus pour passer a l\'action et transformer votre approche de {keyword}.',
    'En resume, la maitrise de {keyword} repose sur une combinaison de strategie, d\'outils adaptes et de perseverance. Les conseils partages dans cet article vous donnent une feuille de route claire pour progresser. Commencez des maintenant et mesurez vos resultats pour ajuster votre approche.',
    '{Keyword} represente une opportunite considerable pour quiconque souhaite ameliorer ses performances. Avec les bonnes methodes et un engagement constant, les resultats ne tarderont pas a se manifester. Mettez en pratique ces recommandations et construisez votre avantage competitif.',
    'Nous avons explore les differentes facettes de {keyword}, des fondamentaux aux strategies avancees. L\'essentiel est de passer a l\'action avec methode et de mesurer vos progres regulierement. {Keyword} est un investissement qui, bien mene, genere un retour significatif.',
  ],

  transitions: [
    'De plus,', 'En outre,', 'Par ailleurs,', 'Il est important de noter que',
    'Dans cette optique,', 'A cet egard,', 'En effet,', 'Qui plus est,',
    'D\'autre part,', 'Ajoutons que', 'Notons egalement que', 'Il convient de souligner que',
    'Sur ce point,', 'A titre d\'exemple,', 'Concretement,', 'Plus precisement,',
  ],

  bulletPoints: [
    'Amelioration significative des performances globales',
    'Optimisation du retour sur investissement (ROI)',
    'Renforcement de la visibilite et de la notoriete',
    'Gain de temps grace a l\'automatisation des processus',
    'Meilleure comprehension de votre audience cible',
    'Avantage concurrentiel durable sur votre marche',
    'Reduction des couts d\'acquisition',
    'Augmentation du taux de conversion',
    'Amelioration de l\'experience utilisateur',
    'Acces a des donnees exploitables pour la prise de decision',
    'Scalabilite et flexibilite de votre strategie',
    'Renforcement de la confiance et de la credibilite',
  ],

  ctaPatterns: [
    'Pret a passer a l\'action ? Commencez des maintenant a optimiser votre strategie {keyword}.',
    'Ne laissez pas vos concurrents prendre l\'avantage. Mettez en oeuvre ces conseils sur {keyword} des aujourd\'hui.',
    'Vous souhaitez aller plus loin avec {keyword} ? Contactez nos experts pour un accompagnement personnalise.',
    'Lancez-vous : appliquez ces strategies {keyword} et mesurez la difference sur vos resultats.',
  ],

  faqQuestions: [
    'Qu\'est-ce que {keyword} exactement ?',
    'Pourquoi {keyword} est-il important ?',
    'Comment debuter avec {keyword} ?',
    'Quels sont les avantages principaux de {keyword} ?',
    'Combien de temps faut-il pour voir des resultats avec {keyword} ?',
    'Quels outils utiliser pour {keyword} ?',
    'Quelles sont les erreurs a eviter avec {keyword} ?',
    '{Keyword} est-il adapte aux petites entreprises ?',
    'Comment mesurer l\'efficacite de {keyword} ?',
    'Quelles sont les tendances actuelles de {keyword} ?',
    'Quel budget prevoir pour {keyword} ?',
    'Comment {keyword} se compare-t-il aux autres approches ?',
  ],

  faqAnswerPatterns: [
    '{Keyword} designe l\'ensemble des pratiques et strategies visant a optimiser vos resultats dans ce domaine. Il s\'agit d\'une approche structuree qui combine analyse, planification et execution pour atteindre des objectifs mesurables.',
    'L\'importance de {keyword} ne cesse de croitre. Dans un marche de plus en plus concurrentiel, maitriser {keyword} vous permet de vous demarquer, d\'ameliorer votre visibilite et d\'atteindre vos objectifs de croissance.',
    'Pour debuter avec {keyword}, commencez par un audit de votre situation actuelle. Identifiez vos forces et faiblesses, definissez des objectifs SMART, puis elaborez un plan d\'action progressif. L\'accompagnement d\'un expert peut accelerer vos premiers resultats.',
    'Les avantages de {keyword} sont nombreux : meilleure visibilite, ROI optimise, avantage concurrentiel, amelioration continue des performances et une meilleure comprehension de votre marche cible.',
    'Les premiers resultats de {keyword} sont generalement visibles entre 3 et 6 mois, selon votre secteur et votre niveau de depart. La cle est la constance : les efforts cumules produisent des resultats exponentiels sur le long terme.',
    'Plusieurs outils facilitent la mise en oeuvre de {keyword}. Des solutions d\'analyse aux plateformes d\'automatisation, l\'ecosysteme est riche. Choisissez vos outils en fonction de vos besoins specifiques et de votre budget.',
    'Les erreurs les plus courantes incluent le manque de strategie claire, l\'impatience face aux resultats, la negligence de l\'analyse des donnees et le fait de copier les concurrents sans adapter l\'approche a son propre contexte.',
    'Absolument. {Keyword} est parfaitement adapte aux petites entreprises et peut meme representer un avantage disproportionne. Avec des ressources limitees, une strategie bien ciblee permet d\'obtenir d\'excellents resultats.',
    'La mesure de l\'efficacite de {keyword} passe par la definition de KPIs pertinents : taux de conversion, trafic organique, positions dans les resultats de recherche, engagement et retour sur investissement.',
    'Les tendances actuelles de {keyword} incluent l\'utilisation de l\'intelligence artificielle, la personnalisation avancee, l\'approche mobile-first et l\'integration de donnees multi-canal pour une vision a 360 degres.',
    'Le budget pour {keyword} varie selon l\'envergure de votre projet. Il est possible de commencer avec un investissement modeste et d\'augmenter progressivement en fonction des resultats obtenus.',
    '{Keyword} se distingue par sa capacite a generer des resultats durables et mesurables. Comparee a d\'autres approches, cette methode offre un meilleur equilibre entre investissement initial et retour a long terme.',
  ],

  metaDescPatterns: [
    'Decouvrez {keyword} : guide complet avec strategies, conseils d\'experts et bonnes pratiques pour optimiser vos resultats.',
    '{Keyword} — tout ce que vous devez savoir pour reussir. Methodes eprouvees, outils recommandes et erreurs a eviter.',
    'Guide pratique sur {keyword}. Apprenez les meilleures strategies et boostez vos performances des maintenant.',
    'Maitrisez {keyword} avec notre guide expert. Conseils actionnables, etudes de cas et ressources pour passer au niveau superieur.',
    '{Keyword} : strategies gagnantes et bonnes pratiques pour ameliorer votre visibilite et vos conversions.',
  ],

  productFeatures: [
    'Performance optimisee pour {keyword}',
    'Interface intuitive et facile a prendre en main',
    'Resultats mesurables et rapports detailles',
    'Compatible avec vos outils existants',
    'Support reactif et documentation complete',
    'Mises a jour regulieres et nouvelles fonctionnalites',
    'Securite des donnees et conformite RGPD',
    'Personnalisation avancee selon vos besoins',
  ],

  toneModifiers: {
    professional: {
      connectors: ['Par consequent,', 'En effet,', 'Il convient de noter que', 'A cet egard,'],
      openers: ['Dans le cadre de', 'Il est recommande de', 'Les analyses montrent que'],
      closers: ['pour des resultats optimaux.', 'dans une perspective d\'amelioration continue.', 'afin d\'atteindre vos objectifs strategiques.'],
    },
    casual: {
      connectors: ['En fait,', 'Bon,', 'Bref,', 'Du coup,'],
      openers: ['Si tu veux mon avis,', 'Le truc c\'est que', 'Concretement,'],
      closers: ['et ca fait vraiment la difference !', 'ca vaut le coup d\'essayer.', 'tu verras, les resultats suivent.'],
    },
    academic: {
      connectors: ['Neanmoins,', 'Il est a noter que', 'Selon les recherches,', 'D\'un point de vue methodologique,'],
      openers: ['Les etudes demontrent que', 'L\'analyse revele que', 'D\'apres la litterature,'],
      closers: ['ce qui corrobore les hypotheses initiales.', 'comme le confirment les donnees empiriques.', 'dans le cadre d\'une approche evidence-based.'],
    },
    persuasive: {
      connectors: ['Imaginez :', 'Le resultat ?', 'Et ce n\'est pas tout :', 'Voici pourquoi :'],
      openers: ['Ne manquez pas cette opportunite :', 'Les leaders du marche l\'ont compris :', 'Transformez vos resultats :'],
      closers: ['et depassez vos objectifs.', 'pour des resultats qui parlent d\'eux-memes.', '— le moment d\'agir, c\'est maintenant.'],
    },
  },
}

const en: TemplateBank = {
  titlePatterns: [
    '{Keyword}: The Complete Guide for {year}',
    'Everything You Need to Know About {Keyword}',
    '{Keyword}: 7 Proven Strategies to Boost Your Results',
    'How to Master {Keyword}: Expert Tips and Best Practices',
    'The Ultimate Guide to {Keyword}',
    'Why {Keyword} Matters: A Comprehensive Analysis',
  ],
  h2Patterns: [
    'What is {keyword} and why does it matter?',
    'Key benefits of {keyword}',
    'How to implement {keyword} effectively',
    'Best practices for {keyword}',
    'Common mistakes to avoid with {keyword}',
    'Current trends in {keyword}',
    'How to measure {keyword} results',
    'Recommended tools and resources for {keyword}',
    'Case study: {keyword} in action',
    '{Keyword} vs alternatives: detailed comparison',
    'Expert tips for optimizing {keyword}',
    'The future of {keyword}',
  ],
  introPatterns: [
    'In today\'s rapidly evolving digital landscape, {keyword} has become an essential component of any successful strategy. Whether you\'re just getting started or looking to refine your approach, understanding {keyword} will help you achieve measurable results. This guide covers the most effective methods for leveraging {keyword}.',
    '{Keyword} represents a major strategic lever for businesses of all sizes. In this article, we explore the most effective approaches to harnessing the full potential of {keyword}, from fundamentals to advanced techniques.',
    'Looking to improve your results with {keyword}? You\'re in the right place. This comprehensive guide walks you through the strategies, tools, and best practices that make a real difference.',
  ],
  bodyParagraphs: [
    'One of the most important aspects of {keyword} is its ability to generate lasting results. Unlike short-term approaches, a well-planned strategy around {keyword} builds a solid foundation for sustained growth.',
    'To get the most out of {keyword}, it\'s essential to adopt a methodical approach. Start by clearly defining your objectives, identify relevant KPIs, and then put together a structured action plan.',
    'Data shows that organizations investing in {keyword} consistently outperform those that neglect it. Optimizing {keyword} isn\'t a luxury — it\'s a strategic investment with strong returns.',
    'A common mistake is underestimating the complexity of {keyword}. A superficial approach rarely yields satisfying results. Take time to analyze your situation in depth and adapt accordingly.',
    'The key to success with {keyword} lies in consistency and iteration. The best results come from sustained effort and continuous, data-driven optimization.',
    'Among the success factors of {keyword}, content quality, approach relevance, and adaptability to market changes stand out. Each deserves careful attention.',
    'Don\'t forget that {keyword} should always align with your business objectives. Every action should contribute to a measurable, meaningful outcome.',
  ],
  conclusionPatterns: [
    '{Keyword} is a powerful lever that deserves your full attention. By applying the strategies outlined in this guide, you have everything you need to achieve concrete results. Start taking action today.',
    'In summary, mastering {keyword} requires a combination of strategy, the right tools, and persistence. Start implementing these recommendations now and measure your progress as you go.',
  ],
  transitions: [
    'Furthermore,', 'Additionally,', 'Moreover,', 'It\'s worth noting that',
    'In this regard,', 'Indeed,', 'On the other hand,', 'Specifically,',
  ],
  bulletPoints: [
    'Significant improvement in overall performance',
    'Optimized return on investment (ROI)',
    'Enhanced visibility and brand awareness',
    'Time savings through process automation',
    'Better understanding of your target audience',
    'Sustainable competitive advantage',
    'Reduced acquisition costs',
    'Increased conversion rates',
  ],
  ctaPatterns: [
    'Ready to take action? Start optimizing your {keyword} strategy today.',
    'Don\'t let your competitors get ahead. Implement these {keyword} tips right now.',
  ],
  faqQuestions: [
    'What exactly is {keyword}?',
    'Why is {keyword} important?',
    'How do I get started with {keyword}?',
    'What are the main benefits of {keyword}?',
    'How long does it take to see results with {keyword}?',
    'What tools should I use for {keyword}?',
    'What mistakes should I avoid with {keyword}?',
    'Is {keyword} suitable for small businesses?',
  ],
  faqAnswerPatterns: [
    '{Keyword} refers to the set of practices and strategies aimed at optimizing your results. It\'s a structured approach combining analysis, planning, and execution to achieve measurable goals.',
    'The importance of {keyword} continues to grow. In an increasingly competitive market, mastering {keyword} helps you stand out and reach your growth objectives.',
    'To get started with {keyword}, begin with an audit of your current situation. Identify strengths and weaknesses, set SMART goals, and create a progressive action plan.',
    'The benefits of {keyword} include better visibility, optimized ROI, competitive advantage, and a deeper understanding of your target market.',
    'Initial results typically appear within 3 to 6 months. Consistency is key: cumulative efforts produce exponential long-term results.',
    'Several tools facilitate {keyword} implementation, from analytics to automation platforms. Choose based on your specific needs and budget.',
    'Common mistakes include lacking a clear strategy, being impatient with results, neglecting data analysis, and copying competitors without adaptation.',
    'Absolutely. {Keyword} is well-suited for small businesses and can provide a disproportionate advantage with targeted, focused effort.',
  ],
  metaDescPatterns: [
    'Discover {keyword}: complete guide with expert strategies, tips, and best practices to optimize your results.',
    '{Keyword} — everything you need to know to succeed. Proven methods, recommended tools, and mistakes to avoid.',
    'Master {keyword} with our expert guide. Actionable tips, case studies, and resources to level up.',
  ],
  productFeatures: [
    'Optimized performance for {keyword}',
    'Intuitive, easy-to-use interface',
    'Measurable results and detailed reports',
    'Compatible with your existing tools',
    'Responsive support and comprehensive documentation',
    'Regular updates and new features',
    'Data security and compliance',
    'Advanced customization to fit your needs',
  ],
  toneModifiers: {
    professional: {
      connectors: ['Consequently,', 'Indeed,', 'It should be noted that', 'In this regard,'],
      openers: ['In the context of', 'It is recommended to', 'Analysis shows that'],
      closers: ['for optimal results.', 'in a continuous improvement perspective.', 'to achieve your strategic objectives.'],
    },
    casual: {
      connectors: ['So,', 'Basically,', 'Here\'s the thing:', 'Long story short,'],
      openers: ['If you ask me,', 'The thing is,', 'In practice,'],
      closers: ['and it really makes a difference!', 'it\'s totally worth trying.', 'trust me, the results follow.'],
    },
    academic: {
      connectors: ['Nevertheless,', 'It is noteworthy that', 'According to research,', 'From a methodological standpoint,'],
      openers: ['Studies demonstrate that', 'Analysis reveals that', 'According to the literature,'],
      closers: ['which corroborates initial hypotheses.', 'as empirical data confirms.', 'within an evidence-based framework.'],
    },
    persuasive: {
      connectors: ['Imagine:', 'The result?', 'And that\'s not all:', 'Here\'s why:'],
      openers: ['Don\'t miss this opportunity:', 'Market leaders have figured it out:', 'Transform your results:'],
      closers: ['and exceed your goals.', 'for results that speak for themselves.', '— the time to act is now.'],
    },
  },
}

// Simplified ES/DE banks (core templates)
const es: TemplateBank = {
  ...fr,
  titlePatterns: [
    '{Keyword}: Guia Completa para {year}',
    'Todo sobre {Keyword} — Estrategias y Buenas Practicas',
    '{Keyword}: 7 Estrategias Probadas para Optimizar tus Resultados',
    'Como Dominar {Keyword}: Guia Practica y Consejos de Expertos',
  ],
  introPatterns: [
    'En un entorno digital en constante evolucion, {keyword} se ha convertido en un elemento imprescindible. Ya seas principiante o experto, comprender los fundamentos de {keyword} te permitira obtener resultados concretos. Esta guia te presenta las mejores estrategias.',
    '{Keyword} representa hoy un importante motor estrategico. Numerosas empresas reconocen la importancia de {keyword} para alcanzar sus objetivos. Descubre las metodologias mas eficaces para aprovechar todo su potencial.',
  ],
  transitions: [
    'Ademas,', 'Por otra parte,', 'Asimismo,', 'Es importante destacar que',
    'En este sentido,', 'En efecto,', 'Cabe senalar que', 'Concretamente,',
  ],
}

const de: TemplateBank = {
  ...fr,
  titlePatterns: [
    '{Keyword}: Der Komplette Leitfaden fur {year}',
    'Alles uber {Keyword} — Strategien und Best Practices',
    '{Keyword}: 7 Bewahrte Strategien zur Optimierung Ihrer Ergebnisse',
    'Wie Sie {Keyword} Meistern: Praktischer Leitfaden mit Expertentipps',
  ],
  introPatterns: [
    'In einer sich standig weiterentwickelnden digitalen Landschaft ist {keyword} zu einem unverzichtbaren Element jeder erfolgreichen Strategie geworden. Dieser Leitfaden zeigt Ihnen die besten Ansatze, um das volle Potenzial von {keyword} auszuschopfen.',
    '{Keyword} stellt heute einen wichtigen strategischen Hebel dar. Zahlreiche Unternehmen erkennen die Bedeutung von {keyword} fur das Erreichen ihrer Ziele. Entdecken Sie die effektivsten Methoden.',
  ],
  transitions: [
    'Daruber hinaus,', 'Ausserdem,', 'Ferner,', 'Es ist wichtig zu beachten, dass',
    'In diesem Zusammenhang,', 'Tatsachlich,', 'Hinzu kommt, dass', 'Konkret gesagt,',
  ],
}

export const templateBanks: Record<string, TemplateBank> = { fr, en, es, de }

export function getBank(lang: string): TemplateBank {
  return templateBanks[lang] || templateBanks.fr
}
