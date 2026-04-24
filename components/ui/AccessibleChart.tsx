'use client'

import { ReactNode, useState } from 'react'

interface Column {
  key: string
  label: string
}

interface AccessibleChartProps {
  title: string
  description: string
  data: Record<string, unknown>[]
  columns: Column[]
  children: ReactNode
}

/**
 * Accessible wrapper for Recharts visualizations.
 * Provides text description + toggleable data table fallback.
 * RGAA 1.1 / WCAG 1.1.1, 1.3.1
 */
export function AccessibleChart({
  title,
  description,
  data,
  columns,
  children,
}: AccessibleChartProps) {
  const [showTable, setShowTable] = useState(false)

  return (
    <figure role="img" aria-label={`${title}. ${description}`}>
      <figcaption className="sr-only">{title} : {description}</figcaption>

      {/* Chart visual */}
      <div aria-hidden="true">{children}</div>

      {/* Toggle data table */}
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          aria-expanded={showTable}
          className="text-xs text-brand-600 dark:text-brand-400 hover:underline focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          {showTable ? 'Masquer les donnees' : 'Voir les donnees'}
        </button>
      </div>

      {/* Data table fallback */}
      {showTable && (
        <div className="mt-2 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-xs">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-300"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-t border-zinc-200 dark:border-zinc-700">
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-1.5 text-zinc-700 dark:text-zinc-300">
                      {String(row[col.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  )
}
