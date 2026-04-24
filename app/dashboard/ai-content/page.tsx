'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  Copy,
  Download,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  Link2,
  Sparkles,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const CONTENT_TYPES = [
  { id: 'blog', label: 'Article de blog', icon: '📝', apiValue: 'article' },
  { id: 'guide', label: 'Guide complet', icon: '📖', apiValue: 'guide' },
  { id: 'listicle', label: 'Article liste', icon: '📋', apiValue: 'listicle' },
  { id: 'comparison', label: 'Comparatif', icon: '⚖️', apiValue: 'comparison' },
  { id: 'product', label: 'Page produit', icon: '🛍️', apiValue: 'product-description' },
  { id: 'faq', label: 'FAQ', icon: '❓', apiValue: 'faq' },
  { id: 'landing', label: 'Landing page', icon: '🚀', apiValue: 'landing-page' },
  { id: 'category', label: 'Description categorie', icon: '📂', apiValue: 'category-description' },
];

const TONES = [
  { label: 'Professionnel', value: 'professional' },
  { label: 'Decontracte', value: 'casual' },
  { label: 'Technique', value: 'academic' },
  { label: 'Commercial', value: 'persuasive' },
];

const LANGUAGES = [
  { label: 'Francais', value: 'fr' },
  { label: 'English', value: 'en' },
  { label: 'Espanol', value: 'es' },
  { label: 'Deutsch', value: 'de' },
];

const HISTORY_ITEMS = [
  { id: 1, title: 'Guide complet du SEO 2024', date: "Aujourd'hui" },
  { id: 2, title: 'Optimisation des pages produit', date: 'Hier' },
  { id: 3, title: 'Stratégie de contenu pour e-commerce', date: '3 jours' },
  { id: 4, title: 'FAQ - Amélioration continue', date: '1 semaine' },
  { id: 5, title: 'Description landing page SaaS', date: '2 semaines' },
];

const RELATED_KEYWORDS = [
  'SEO technique',
  'stratégie de contenu',
  'optimisation des mots-clés',
  'backlinking',
  'expérience utilisateur',
  'mobile first indexing',
  'core web vitals',
  'schéma structuré',
];

export default function AIContentPage() {
  const [selectedType, setSelectedType] = useState('blog');
  const [keyword, setKeyword] = useState('');
  const [tone, setTone] = useState('professional');
  const [language, setLanguage] = useState('fr');
  const [wordCount, setWordCount] = useState(1500);
  const [instructions, setInstructions] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSEO, setShowSEO] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [charCount, setCharCount] = useState(0);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const wordCountValue = content.split(/\s+/).filter(w => w.length > 0).length;

  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  const handleGenerate = async () => {
    if (!keyword.trim()) {
      setError('Veuillez entrer un mot-clé');
      return;
    }

    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setIsGenerating(true);
    setContent('');
    setShowSEO(false);
    setError('');

    const contentType = CONTENT_TYPES.find(t => t.id === selectedType);

    try {
      const res = await fetch('/api/ai-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: contentType?.apiValue || 'article',
          keyword: keyword.trim(),
          tone,
          language,
          wordCount,
          instructions: instructions.trim() || undefined,
        }),
        signal: controller.signal,
      });

      // Handle JSON responses (errors)
      const contentTypeHeader = res.headers.get('content-type') || '';
      if (contentTypeHeader.includes('application/json')) {
        const data = await res.json();
        if (data.error) {
          setError(data.error);
          setIsGenerating(false);
          return;
        }
      }

      // Handle SSE stream
      if (!res.body) {
        setError('Pas de réponse du serveur');
        setIsGenerating(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep the last potentially incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const payload = JSON.parse(trimmed.slice(6));
            if (payload.done) {
              break;
            }
            if (payload.error) {
              setError(payload.error);
              break;
            }
            if (payload.text) {
              setContent(prev => prev + payload.text);
            }
          } catch {
            // Skip malformed lines
          }
        }
      }

      setShowSEO(true);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsGenerating(false);
    if (content.length > 0) {
      setShowSEO(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `contenu-${Date.now()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleKeyword = (kw: string) => {
    setSelectedKeywords(prev =>
      prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]
    );
  };

  const metaTitle = keyword ? `${keyword} - Guide Complet 2024` : '';
  const metaDesc = keyword ? `Découvrez comment optimiser votre ${keyword}. Guide pratique avec stratégies éprouvées et cas d'étude réels.` : '';

  return (
    <div className="min-h-screen bg-white/[0.02]">
      {/* Header */}
      <div className="border-b border-white/5 bg-white/[0.03]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-brand-600" />
            <h1 className="text-3xl font-bold text-white">
              Générateur de Contenu SEO
            </h1>
          </div>
          <p className="text-white/50">
            Créez du contenu SEO-optimisé en quelques secondes — 100% gratuit, sans clé API
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-rose-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Content Type Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            Choisissez le type de contenu
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {CONTENT_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all text-center',
                  selectedType === type.id
                    ? 'border-brand-600 bg-brand-500/10'
                    : 'border-white/5 bg-white/[0.03] hover:border-brand-300 '
                )}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <p className="text-sm font-medium text-white">
                  {type.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Configuration and Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Configuration Panel */}
            <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
              <h2 className="text-lg font-semibold text-white mb-5">
                Configuration
              </h2>

              {/* Keyword Input */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Mot-cle cible
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Ex: SEO, développement web, e-commerce..."
                  className="w-full px-4 py-2 rounded-lg border border-white/5 bg-white/[0.03] text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Tone Selector */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Ton de la voix
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        tone === t.value
                          ? 'bg-brand-600 text-white'
                          : 'bg-white/[0.03] text-white/70 hover:bg-white/[0.03]'
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selector */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Langue
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-white/5 bg-white/[0.03] text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>

              {/* Word Count Slider */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Nombre de mots: {wordCount}
                </label>
                <input
                  type="range"
                  min="300"
                  max="5000"
                  step="100"
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/[0.03] rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-xs text-surface-500 mt-1">
                  <span>300</span>
                  <span>5000</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Instructions supplementaires (optionnel)
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Ex: Inclure des statistiques recentes, mentionner des outils specifiques..."
                  rows={3}
                  maxLength={1000}
                  className="w-full px-4 py-2 rounded-lg border border-white/5 bg-white/[0.03] text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              {/* Generate / Stop Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 shadow-lg hover:shadow-xl"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Génération en cours...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Générer
                    </span>
                  )}
                </button>
                {isGenerating && (
                  <button
                    onClick={handleStop}
                    className="px-6 py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Arreter
                  </button>
                )}
              </div>
            </div>

            {/* Streaming skeleton / placeholder */}
            {isGenerating && !content && (
              <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                  <span className="text-sm font-medium text-white/50">
                    Génération de votre contenu en cours...
                  </span>
                </div>
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-white/[0.03] rounded w-3/4" />
                  <div className="h-4 bg-white/[0.03] rounded w-full" />
                  <div className="h-4 bg-white/[0.03] rounded w-5/6" />
                  <div className="h-4 bg-white/[0.03] rounded w-2/3" />
                  <div className="h-4 bg-white/[0.03] rounded w-full" />
                  <div className="h-4 bg-white/[0.03] rounded w-4/5" />
                </div>
              </div>
            )}

            {/* AI Editor */}
            {content && (
              <div className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden">
                {/* Toolbar */}
                <div className="bg-white/[0.02] border-b border-white/5 p-4 flex items-center gap-2 flex-wrap">
                  <button className="p-2 hover:bg-white/[0.03] rounded transition-colors" title="Gras">
                    <Bold className="w-4 h-4 text-white/50" />
                  </button>
                  <button className="p-2 hover:bg-white/[0.03] rounded transition-colors" title="Italique">
                    <Italic className="w-4 h-4 text-white/50" />
                  </button>
                  <button className="p-2 hover:bg-white/[0.03] rounded transition-colors" title="Titre 2">
                    <Heading2 className="w-4 h-4 text-white/50" />
                  </button>
                  <button className="p-2 hover:bg-white/[0.03] rounded transition-colors" title="Titre 3">
                    <Heading3 className="w-4 h-4 text-white/50" />
                  </button>
                  <button className="p-2 hover:bg-white/[0.03] rounded transition-colors" title="Liste">
                    <List className="w-4 h-4 text-white/50" />
                  </button>
                  <button className="p-2 hover:bg-white/[0.03] rounded transition-colors" title="Lien">
                    <Link2 className="w-4 h-4 text-white/50" />
                  </button>
                  <div className="flex-1"></div>
                  {isGenerating && (
                    <div className="flex items-center gap-2 mr-3">
                      <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                      <span className="text-xs text-brand-600 font-medium">En cours...</span>
                    </div>
                  )}
                  <div className="text-sm text-white/50">
                    {wordCountValue} mots | {charCount} caracteres
                  </div>
                </div>

                {/* Editor */}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-96 p-6 focus:outline-none bg-white/[0.03] text-white resize-none font-serif leading-relaxed"
                  placeholder="Le contenu généré apparaîtra ici..."
                />

                {/* Actions */}
                <div className="bg-white/[0.02] border-t border-white/5 p-4 flex gap-3">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-white/70 hover:bg-white/[0.03] transition-colors font-medium"
                  >
                    <Copy className="w-4 h-4" />
                    Copier
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-white/70 hover:bg-white/[0.03] transition-colors font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </button>
                </div>
              </div>
            )}

            {/* Content Templates */}
            {!content && !isGenerating && (
              <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Modeles disponibles
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Blog listicle', 'Guide complet', 'Etude de cas', 'Entrevue', 'Comparatif', 'Tutoriel'].map(template => (
                    <button
                      key={template}
                      className="p-4 text-left rounded-lg bg-white/[0.02] border border-white/5 hover:border-brand-500/30 transition-colors text-white/70 hover:text-white font-medium"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - SEO Sidebar */}
          <div className="space-y-6">
            {/* History */}
            <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-600" />
                Historique
              </h3>
              <div className="space-y-3">
                {HISTORY_ITEMS.map(item => (
                  <button
                    key={item.id}
                    className="w-full text-left p-3 rounded-lg hover:bg-white/[0.03] transition-colors group"
                  >
                    <p className="font-medium text-sm text-white group-hover:text-brand-600 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs text-surface-500 mt-1">{item.date}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* SEO Analysis */}
            {showSEO && content && (
              <>
                {/* SEO Score */}
                <div className="bg-gradient-to-br from-brand-500/10 to-accent-500/10 rounded-xl border border-brand-500/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brand-600" />
                    Score SEO
                  </h3>
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={`${282 * 0.78} 282`}
                        className="text-green-500"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                      />
                      <text x="50" y="55" textAnchor="middle" className="text-2xl font-bold fill-white">
                        78%
                      </text>
                    </svg>
                  </div>
                  <p className="text-center text-sm text-white/50">
                    Excellent! Votre contenu est bien optimisé.
                  </p>
                </div>

                {/* Keyword Density */}
                <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
                  <h3 className="font-semibold text-white mb-3">
                    Densité du mot-clé
                  </h3>
                  {keyword && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/50">{keyword}</span>
                        <span className="font-bold text-brand-600">2.1%</span>
                      </div>
                      <div className="w-full bg-white/[0.03] rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '2.1%' }}></div>
                      </div>
                      <p className="text-xs text-surface-500 mt-2">Optimal (1-3%)</p>
                    </div>
                  )}
                </div>

                {/* Readability */}
                <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Lisibilite
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">Score Flesch</span>
                      <span className="font-bold text-green-600">62/100</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">Longueur moyenne</span>
                      <span className="text-sm">18 mots/phrase</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">Titres</span>
                      <span className="text-sm text-green-600">Bien structure</span>
                    </div>
                  </div>
                </div>

                {/* Meta Title */}
                <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
                  <h3 className="font-semibold text-white mb-3">
                    Suggestion Meta Title
                  </h3>
                  <p className="text-sm text-white/70 mb-2 line-clamp-2">
                    {metaTitle}
                  </p>
                  <p className="text-xs text-surface-500">
                    {metaTitle.length}/60 caracteres
                  </p>
                  <p className={cn(
                    'text-xs mt-2',
                    metaTitle.length <= 60
                      ? 'text-green-600'
                      : 'text-amber-600'
                  )}>
                    {metaTitle.length <= 60 ? 'Optimal' : 'Trop long'}
                  </p>
                </div>

                {/* Meta Description */}
                <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
                  <h3 className="font-semibold text-white mb-3">
                    Suggestion Meta Description
                  </h3>
                  <p className="text-sm text-white/70 mb-2 line-clamp-3">
                    {metaDesc}
                  </p>
                  <p className="text-xs text-surface-500">
                    {metaDesc.length}/160 caracteres
                  </p>
                  <p className={cn(
                    'text-xs mt-2',
                    metaDesc.length > 120 && metaDesc.length <= 160
                      ? 'text-green-600'
                      : 'text-amber-600'
                  )}>
                    {metaDesc.length > 120 && metaDesc.length <= 160 ? 'Optimal' : 'A ajuster'}
                  </p>
                </div>

                {/* Related Keywords */}
                <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
                  <h3 className="font-semibold text-white mb-4">
                    Mots-clés connexes
                  </h3>
                  <div className="space-y-2">
                    {RELATED_KEYWORDS.map(kw => (
                      <label key={kw} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedKeywords.includes(kw)}
                          onChange={() => toggleKeyword(kw)}
                          className="w-4 h-4 rounded accent-brand-600 cursor-pointer"
                        />
                        <span className="text-sm text-white/70 group-hover:text-white">
                          {kw}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Structure Recommendations */}
                <div className="bg-blue-500/10 rounded-xl border border-blue-500/20 p-6">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    Recommandations
                  </h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li>Utilisez votre mot-clé dans le premier paragraphe</li>
                    <li>Ajoutez au moins 3-4 sous-titres H2/H3</li>
                    <li>Incluez des listes a puces</li>
                    <li>Intégrez les mots-clés LSI naturellement</li>
                    <li>Ajoutez une image avec alt-text optimisé</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
