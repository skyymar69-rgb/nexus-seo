'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  MessageSquare,
  Globe,
  Gauge,
  Search,
  CheckCircle2,
  Loader2,
  Circle,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────

interface ScanData {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  totalSteps: number
  currentStep: string | null
  auditScore: number | null
  aeoScore: number | null
  geoScore: number | null
  perfScore: number | null
  crawlPages: number | null
  error: string | null
  website: { domain: string; name: string | null }
}

// ── Steps Config ─────────────────────────────────────────────

const SCAN_STEPS = [
  { id: 1, name: 'Audit technique SEO', description: '25+ vérifications techniques', icon: Shield, color: 'text-blue-400' },
  { id: 2, name: 'Score AEO', description: 'Optimisation moteurs de réponses', icon: MessageSquare, color: 'text-violet-400' },
  { id: 3, name: 'Audit GEO', description: 'Optimisation moteurs génératifs', icon: Globe, color: 'text-emerald-400' },
  { id: 4, name: 'Analyse E-E-A-T', description: 'Expérience, Expertise, Autorité, Fiabilité', icon: Sparkles, color: 'text-amber-400' },
  { id: 5, name: 'Performance web', description: 'Core Web Vitals & PageSpeed', icon: Gauge, color: 'text-cyan-400' },
  { id: 6, name: 'Crawl du site', description: 'Exploration des pages du site', icon: Search, color: 'text-rose-400' },
]

// ── Score Circle ─────────────────────────────────────────────

function MiniScore({ score, label }: { score: number | null; label: string }) {
  if (score === null) return null
  const color = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-1"
    >
      <span className={`text-2xl font-bold ${color}`}>{score}</span>
      <span className="text-xs text-white/50">{label}</span>
    </motion.div>
  )
}

// ── Main Component ───────────────────────────────────────────

export default function ScanProgressPage() {
  const router = useRouter()
  const params = useParams()
  const scanId = params.scanId as string

  const [scan, setScan] = useState<ScanData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Poll scan status
  const fetchScan = useCallback(async () => {
    try {
      const res = await fetch(`/api/scan/${scanId}`)
      if (!res.ok) throw new Error('Scan introuvable')
      const json = await res.json()
      if (json.success) {
        setScan(json.data)
      } else {
        setError(json.error || 'Erreur inconnue')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau')
    }
  }, [scanId])

  // Initial fetch + polling
  useEffect(() => {
    fetchScan()
    const interval = setInterval(fetchScan, 3000)
    return () => clearInterval(interval)
  }, [fetchScan])

  // Elapsed time counter
  useEffect(() => {
    const timer = setInterval(() => setElapsedTime(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  // Redirect when complete
  useEffect(() => {
    if (scan?.status === 'completed') {
      const timer = setTimeout(() => router.push('/dashboard'), 2000)
      return () => clearTimeout(timer)
    }
  }, [scan?.status, router])

  // ── Render ───────────────────────────────────────────────

  const progress = scan ? Math.round((scan.progress / scan.totalSteps) * 100) : 0
  const isComplete = scan?.status === 'completed'
  const isFailed = scan?.status === 'failed'

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-4"
          >
            {isComplete ? (
              <><CheckCircle2 className="w-4 h-4" /> Analyse terminee</>
            ) : isFailed ? (
              <><AlertCircle className="w-4 h-4" /> Erreur</>
            ) : (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyse en cours</>
            )}
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {isComplete ? 'Votre rapport est pret !' : isFailed ? 'Erreur lors du scan' : 'Scan complet en cours...'}
          </h1>
          <p className="text-white/50 text-sm">
            {scan?.website?.domain || 'Chargement...'}
            {!isComplete && !isFailed && ` — ${Math.floor(elapsedTime / 60)}:${String(elapsedTime % 60).padStart(2, '0')}`}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-label="Progression du scan" aria-valuenow={isComplete ? 100 : progress} aria-valuemin={0} aria-valuemax={100}>
            <motion.div
              className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : isFailed ? 'bg-rose-500' : 'bg-brand-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${isComplete ? 100 : progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-8">
          <AnimatePresence>
            {SCAN_STEPS.map((step) => {
              const isDone = scan ? scan.progress >= step.id : false
              const isCurrent = scan ? scan.progress === step.id - 1 && scan.status === 'running' : false
              const Icon = step.icon

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: step.id * 0.05 }}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : isCurrent
                      ? 'bg-brand-500/5 border-brand-500/30'
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  {/* Status icon */}
                  <div className="flex-shrink-0">
                    {isDone ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </motion.div>
                    ) : isCurrent ? (
                      <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
                    ) : (
                      <Circle className="w-5 h-5 text-white/20" />
                    )}
                  </div>

                  {/* Step info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isDone ? 'text-emerald-400' : isCurrent ? step.color : 'text-white/30'}`} />
                      <span className={`text-sm font-medium ${isDone ? 'text-white' : isCurrent ? 'text-white' : 'text-white/40'}`}>
                        {step.name}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isDone || isCurrent ? 'text-white/40' : 'text-white/20'}`}>
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Scores preview (appears as they come in) */}
        {scan && (scan.auditScore !== null || scan.aeoScore !== null || scan.geoScore !== null) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-8 mb-8 p-4 rounded-xl bg-white/[0.02] border border-white/5"
          >
            <MiniScore score={scan.auditScore} label="SEO" />
            <MiniScore score={scan.aeoScore} label="AEO" />
            <MiniScore score={scan.geoScore} label="GEO" />
            <MiniScore score={scan.perfScore} label="Perf" />
          </motion.div>
        )}

        {/* Complete state — redirect CTA */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-400 transition-colors"
            >
              Voir mon rapport complet
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-white/30 text-xs mt-3">Redirection automatique...</p>
          </motion.div>
        )}

        {/* Error state */}
        {isFailed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-rose-400 text-sm mb-4">{scan?.error || 'Une erreur est survenue'}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Retour au dashboard
            </button>
          </motion.div>
        )}

        {/* Network error */}
        {error && !scan && (
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
            <p className="text-rose-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
