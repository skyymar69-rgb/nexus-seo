'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  FileText,
  Download,
  FileJson,
  Printer,
  ChevronDown,
  Loader,
  Check,
  AlertCircle,
  File,
  Table2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ExportData, ExportOptions } from '@/lib/export'
import {
  exportToPDF,
  exportToCSV,
  exportToMarkdown,
  exportToText,
  exportToJSON,
  generatePrintView,
} from '@/lib/export'

export interface ExportMenuProps {
  data: ExportData
  options?: ExportOptions
  className?: string
  variant?: 'default' | 'compact' | 'icon-only'
  label?: string
}

type ExportFormat = 'pdf' | 'csv' | 'markdown' | 'text' | 'json' | 'print'

export function ExportMenu({
  data,
  options,
  className = '',
  variant = 'default',
  label = 'Exporter',
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState<ExportFormat | null>(null)
  const [success, setSuccess] = useState<ExportFormat | null>(null)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExport = async (format: ExportFormat) => {
    try {
      setLoading(format)
      setError(null)

      switch (format) {
        case 'pdf':
          await exportToPDF(data, options)
          break
        case 'csv':
          exportToCSV(data, options)
          break
        case 'markdown':
          exportToMarkdown(data, options)
          break
        case 'text':
          exportToText(data, options)
          break
        case 'json':
          exportToJSON(data, options)
          break
        case 'print':
          generatePrintView(data, options)
          break
      }

      setSuccess(format)
      setIsOpen(false)

      // Clear success message after 2 seconds
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(errorMessage)
      console.error(`Export to ${format} failed:`, err)
    } finally {
      setLoading(null)
    }
  }

  const exportOptions: Array<{
    format: ExportFormat
    label: string
    icon: React.ReactNode
    description: string
    color: string
  }> = [
    {
      format: 'pdf',
      label: 'PDF',
      icon: <FileText className="w-4 h-4" />,
      description: 'Rapport formaté prêt à imprimer',
      color: 'text-red-600',
    },
    {
      format: 'csv',
      label: 'CSV',
      icon: <Table2 className="w-4 h-4" />,
      description: 'Données tabulaires pour Excel',
      color: 'text-green-600',
    },
    {
      format: 'markdown',
      label: 'Markdown',
      icon: <File className="w-4 h-4" />,
      description: 'Format texte balisé',
      color: 'text-blue-600',
    },
    {
      format: 'text',
      label: 'Texte',
      icon: <FileText className="w-4 h-4" />,
      description: 'Texte brut sans mise en forme',
      color: 'text-gray-600',
    },
    {
      format: 'json',
      label: 'JSON',
      icon: <FileJson className="w-4 h-4" />,
      description: 'Données brutes structurées',
      color: 'text-yellow-600',
    },
    {
      format: 'print',
      label: 'Imprimer',
      icon: <Printer className="w-4 h-4" />,
      description: 'Aperçu pour impression',
      color: 'text-purple-600',
    },
  ]

  const renderButton = () => {
    if (variant === 'icon-only') {
      return (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-surface-700 rounded-lg transition-colors duration-200 text-surface-400 hover:text-surface-200"
          title={label}
          aria-label={label}
        >
          <Download className="w-5 h-5" />
        </button>
      )
    }

    if (variant === 'compact') {
      return (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-surface-800 hover:bg-surface-700 rounded-lg transition-colors duration-200 text-sm font-medium text-surface-300 border border-surface-700"
        >
          <Download className="w-4 h-4" />
          {label}
          <ChevronDown
            className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
          />
        </button>
      )
    }

    // Default variant
    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-sm hover:shadow-md border border-indigo-500"
      >
        <Download className="w-4 h-4" />
        {label}
        <ChevronDown
          className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
        />
      </button>
    )
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      {renderButton()}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-surface-800 border border-surface-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-surface-900 border-b border-surface-700">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">
              Choisir un format d'export
            </p>
          </div>

          {/* Options */}
          <div className="py-2 max-h-96 overflow-y-auto">
            {exportOptions.map((option) => {
              const isLoading = loading === option.format
              const isSuccess = success === option.format

              return (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  disabled={loading !== null}
                  className={cn(
                    'w-full px-4 py-3 text-left hover:bg-surface-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 border-b border-surface-700 last:border-b-0 flex items-start justify-between group',
                    isSuccess && 'bg-surface-700'
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          option.color,
                          'group-hover:scale-110 transition-transform flex-shrink-0'
                        )}
                      >
                        {isLoading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : isSuccess ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          option.icon
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-surface-200 group-hover:text-indigo-400 transition-colors">
                          {option.label}
                        </p>
                        <p className="text-xs text-surface-500 group-hover:text-surface-400 transition-colors">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-surface-900 border-t border-surface-700 text-center">
            <p className="text-xs text-surface-600">
              Cliquez pour télécharger le fichier
            </p>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-950 border border-green-700 rounded-lg px-4 py-3 flex items-center gap-2 text-green-400 shadow-lg z-50">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Export en {getFormatLabel(success)} réussi</span>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-950 border border-red-700 rounded-lg px-4 py-3 flex items-center gap-2 text-red-400 shadow-lg z-50">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  )
}

function getFormatLabel(format: ExportFormat): string {
  const labels: Record<ExportFormat, string> = {
    pdf: 'PDF',
    csv: 'CSV',
    markdown: 'Markdown',
    text: 'Texte',
    json: 'JSON',
    print: 'Impression',
  }
  return labels[format]
}

export default ExportMenu
