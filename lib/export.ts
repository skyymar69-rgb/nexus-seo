// ============================================================================
// Comprehensive Export System for Nexus SEO Platform
// Supports: PDF, CSV, Markdown, Text, JSON, and Print
// ============================================================================

// ===== Types & Interfaces =====

export interface ExportColumn {
  key: string
  label: string
  format?: (value: any) => string
}

export interface ExportData {
  title: string
  description?: string
  date?: string
  website?: string
  columns?: ExportColumn[]
  rows?: Record<string, any>[]
  sections?: ExportSection[]
  summary?: Record<string, string | number>
  type?: 'audit' | 'keywords' | 'backlinks' | 'metrics' | 'visibility' | 'full-report' | 'evolution'
  charts?: ChartData[]
  recommendations?: string[]
}

export interface ExportSection {
  title: string
  content: string
  type?: 'text' | 'table' | 'list' | 'score'
  data?: any
}

export interface ChartData {
  title: string
  type: 'bar' | 'line' | 'pie'
  labels: string[]
  values: number[]
}

export interface ExportOptions {
  includeCharts?: boolean
  includeSummary?: boolean
  includeRecommendations?: boolean
  pageSize?: 'A4' | 'Letter'
  orientation?: 'portrait' | 'landscape'
}

// ===== PDF Export =====
export async function exportToPDF(data: ExportData, options?: ExportOptions): Promise<void> {
  const htmlContent = generatePrintableHTML(data, options)

  try {
    // For PDF generation, we create HTML and use browser's print-to-PDF
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      console.error('Could not open print window')
      return
    }

    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Auto-trigger print dialog with PDF save option
    setTimeout(() => {
      printWindow.print()
    }, 250)
  } catch (error) {
    console.error('PDF export failed:', error)
    throw error
  }
}

// ===== CSV Export =====
export function exportToCSV(data: ExportData, options?: ExportOptions): void {
  let csv = ''

  // Add BOM for Excel UTF-8 compatibility
  csv = '\ufeff'

  // Header info
  csv += `"${escapeCSVField(data.title)}"\n`
  if (data.website) csv += `"Site","${escapeCSVField(data.website)}"\n`
  if (data.date) csv += `"Date","${data.date}"\n`
  if (data.type) csv += `"Type","${data.type}"\n`
  csv += '\n'

  // Summary section with proper formatting
  if (data.summary && options?.includeSummary !== false) {
    csv += `"=== RESUME ==="\n`
    Object.entries(data.summary).forEach(([key, value]) => {
      csv += `"${escapeCSVField(key)}","${escapeCSVField(String(value))}"\n`
    })
    csv += '\n'
  }

  // Table data with headers
  if (data.columns && data.rows && data.rows.length > 0) {
    csv += `"=== DONNEES DETAILLEES ==="\n`
    csv += data.columns.map(c => `"${escapeCSVField(c.label)}"`).join(',') + '\n'

    data.rows.forEach(row => {
      csv += data.columns!.map(col => {
        const value = row[col.key]
        const formatted = col.format ? col.format(value) : String(value ?? '')
        return `"${escapeCSVField(formatted)}"`
      }).join(',') + '\n'
    })
    csv += '\n'
  }

  // Sections as separate sections
  if (data.sections && data.sections.length > 0) {
    data.sections.forEach((section, idx) => {
      csv += `\n"=== ${escapeCSVField(section.title.toUpperCase())} ==="\n`
      csv += `"${escapeCSVField(section.content)}"\n`
    })
  }

  // Recommendations if available
  if (data.recommendations && data.recommendations.length > 0 && options?.includeRecommendations !== false) {
    csv += `\n"=== RECOMMANDATIONS ==="\n`
    data.recommendations.forEach(rec => {
      csv += `"${escapeCSVField(rec)}"\n`
    })
  }

  // Footer
  csv += `\n"Généré par Nexus SEO Platform","${new Date().toLocaleString('fr-FR')}"\n`

  downloadFile(csv, `${slugify(data.title)}.csv`, 'text/csv;charset=utf-8;')
}

// ===== Markdown Export =====
export function exportToMarkdown(data: ExportData, options?: ExportOptions): void {
  let md = ''

  // Title and metadata
  md += `# ${data.title}\n\n`

  const metaLines: string[] = []
  if (data.website) metaLines.push(`**Site:** ${data.website}`)
  if (data.date) metaLines.push(`**Date:** ${data.date}`)
  if (data.type) metaLines.push(`**Type:** ${data.type}`)

  if (metaLines.length > 0) {
    md += metaLines.join(' | ') + '\n\n'
  }

  if (data.description) {
    md += `${data.description}\n\n`
  }

  md += '---\n\n'

  // Summary section
  if (data.summary && options?.includeSummary !== false) {
    md += '## Résumé\n\n'
    md += '| Métrique | Valeur |\n'
    md += '|---|---|\n'
    Object.entries(data.summary).forEach(([key, value]) => {
      md += `| ${key} | **${escapeMarkdown(String(value))}** |\n`
    })
    md += '\n'
  }

  // Table data
  if (data.columns && data.rows && data.rows.length > 0) {
    md += '## Données détaillées\n\n'
    md += '| ' + data.columns.map(c => c.label).join(' | ') + ' |\n'
    md += '| ' + data.columns.map(() => '---').join(' | ') + ' |\n'
    data.rows.forEach(row => {
      md += '| ' + data.columns!.map(col => {
        const value = row[col.key]
        const formatted = col.format ? col.format(value) : String(value ?? '-')
        return escapeMarkdown(formatted)
      }).join(' | ') + ' |\n'
    })
    md += '\n'
  }

  // Sections with proper markdown formatting
  if (data.sections && data.sections.length > 0) {
    data.sections.forEach(section => {
      md += `## ${section.title}\n\n`

      if (section.type === 'list') {
        // Format as bullet list
        const items = section.content.split('\n').filter(line => line.trim())
        items.forEach(item => {
          md += `- ${item.trim()}\n`
        })
        md += '\n'
      } else if (section.type === 'score') {
        // Format score with emphasis
        md += `**${escapeMarkdown(section.content)}**\n\n`
      } else {
        // Regular text
        md += `${escapeMarkdown(section.content)}\n\n`
      }
    })
  }

  // Recommendations
  if (data.recommendations && data.recommendations.length > 0 && options?.includeRecommendations !== false) {
    md += '## Recommandations\n\n'
    data.recommendations.forEach((rec, idx) => {
      md += `${idx + 1}. ${escapeMarkdown(rec)}\n`
    })
    md += '\n'
  }

  // Footer
  md += '---\n\n'
  md += `*Rapport généré par **Nexus SEO Platform** le ${new Date().toLocaleDateString('fr-FR')}*\n`

  downloadFile(md, `${slugify(data.title)}.md`, 'text/markdown;charset=utf-8;')
}

// ===== Text Export =====
export function exportToText(data: ExportData, options?: ExportOptions): void {
  let txt = ''
  const sep1 = '='.repeat(80)
  const sep2 = '-'.repeat(80)
  const sep3 = '*'.repeat(80)

  // Header
  txt += `${sep1}\n`
  txt += `${data.title.toUpperCase()}\n`
  txt += `${sep1}\n\n`

  // Metadata
  if (data.website) txt += `SITE: ${data.website}\n`
  if (data.date) txt += `DATE: ${data.date}\n`
  if (data.type) txt += `TYPE: ${data.type}\n`
  txt += `GENERE: ${new Date().toLocaleString('fr-FR')}\n`
  txt += '\n'

  if (data.description) {
    txt += `${data.description}\n\n`
  }

  // Summary
  if (data.summary && options?.includeSummary !== false) {
    txt += `${sep2}\n`
    txt += `RESUME\n`
    txt += `${sep2}\n\n`
    Object.entries(data.summary).forEach(([key, value]) => {
      txt += `  ${key.padEnd(30)} : ${value}\n`
    })
    txt += '\n'
  }

  // Table as formatted text
  if (data.columns && data.rows && data.rows.length > 0) {
    txt += `${sep2}\n`
    txt += `DONNEES DETAILLEES\n`
    txt += `${sep2}\n\n`

    // Calculate column widths
    const columnWidths = data.columns.map(col =>
      Math.max(col.label.length, ...data.rows!.map(row => {
        const value = row[col.key]
        const formatted = col.format ? col.format(value) : String(value ?? '')
        return formatted.length
      }))
    )

    // Print header
    let header = ''
    let headerDivider = ''
    data.columns.forEach((col, idx) => {
      const width = columnWidths[idx]
      header += col.label.padEnd(width) + '  '
      headerDivider += '-'.repeat(width) + '  '
    })
    txt += header + '\n' + headerDivider + '\n'

    // Print rows
    data.rows.forEach((row, rowIdx) => {
      let line = ''
      data.columns!.forEach((col, idx) => {
        const value = row[col.key]
        const formatted = col.format ? col.format(value) : String(value ?? '-')
        const width = columnWidths[idx]
        line += formatted.padEnd(width) + '  '
      })
      txt += line + '\n'
    })
    txt += '\n'
  }

  // Sections
  if (data.sections && data.sections.length > 0) {
    data.sections.forEach(section => {
      txt += `${sep2}\n`
      txt += `${section.title.toUpperCase()}\n`
      txt += `${sep2}\n\n`

      if (section.type === 'list') {
        const items = section.content.split('\n').filter(line => line.trim())
        items.forEach((item, idx) => {
          txt += `  ${idx + 1}. ${item.trim()}\n`
        })
      } else {
        txt += `${section.content}\n`
      }
      txt += '\n'
    })
  }

  // Recommendations
  if (data.recommendations && data.recommendations.length > 0 && options?.includeRecommendations !== false) {
    txt += `${sep2}\n`
    txt += `RECOMMANDATIONS\n`
    txt += `${sep2}\n\n`
    data.recommendations.forEach((rec, idx) => {
      txt += `  ${idx + 1}. ${rec}\n`
    })
    txt += '\n'
  }

  // Footer
  txt += `${sep1}\n`
  txt += `Genere par Nexus SEO Platform\n`
  txt += `${new Date().toLocaleString('fr-FR')}\n`
  txt += `${sep1}\n`

  downloadFile(txt, `${slugify(data.title)}.txt`, 'text/plain;charset=utf-8;')
}

// ===== JSON Export =====
export function exportToJSON(data: ExportData, options?: ExportOptions): void {
  const json = JSON.stringify({
    meta: {
      title: data.title,
      website: data.website,
      date: data.date,
      type: data.type || 'general',
      generatedAt: new Date().toISOString(),
      generatedBy: 'Nexus SEO Platform v2.0',
    },
    summary: data.summary || {},
    description: data.description,
    data: data.rows || [],
    sections: data.sections?.map(s => ({
      title: s.title,
      type: s.type || 'text',
      content: s.content,
      data: s.data || null,
    })) || [],
    charts: data.charts || [],
    recommendations: data.recommendations || [],
  }, null, 2)

  downloadFile(json, `${slugify(data.title)}.json`, 'application/json;charset=utf-8;')
}

// ===== Print View =====
export function generatePrintView(data: ExportData, options?: ExportOptions): void {
  const htmlContent = generatePrintableHTML(data, options)

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    console.error('Could not open print window')
    return
  }

  printWindow.document.write(htmlContent)
  printWindow.document.close()

  // Auto-trigger print dialog
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

// ===== Helper: Generate Printable HTML =====
function generatePrintableHTML(data: ExportData, options?: ExportOptions): string {
  const pageSize = options?.pageSize || 'A4'
  const orientation = options?.orientation || 'portrait'

  let html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(data.title)} - Nexus SEO</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: ${pageSize} ${orientation};
      margin: 2cm;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
      background: white;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0;
    }

    .header {
      border-bottom: 3px solid #6366f1;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .logo {
      font-size: 12px;
      font-weight: 800;
      color: #6366f1;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }

    h1 {
      font-size: 32px;
      font-weight: 700;
      color: #111;
      margin-bottom: 10px;
    }

    .header-meta {
      display: flex;
      gap: 20px;
      font-size: 13px;
      color: #666;
      margin-top: 15px;
    }

    .header-meta span {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .header-meta strong {
      color: #333;
      font-weight: 600;
    }

    .description {
      font-size: 14px;
      color: #555;
      line-height: 1.8;
      margin: 20px 0 30px;
      padding: 15px;
      background: #f8f9fa;
      border-left: 4px solid #6366f1;
      border-radius: 4px;
    }

    h2 {
      font-size: 20px;
      font-weight: 700;
      color: #111;
      margin: 30px 0 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #6366f1;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 15px;
      margin: 20px 0 30px;
    }

    .summary-card {
      background: linear-gradient(135deg, #f8f9fa 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .summary-card .label {
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .summary-card .value {
      font-size: 28px;
      font-weight: 800;
      color: #6366f1;
      line-height: 1;
    }

    .summary-card.good {
      border-color: #86efac;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    }

    .summary-card.good .value {
      color: #16a34a;
    }

    .summary-card.warning {
      border-color: #fcd34d;
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    }

    .summary-card.warning .value {
      color: #ca8a04;
    }

    .summary-card.alert {
      border-color: #fca5a5;
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    }

    .summary-card.alert .value {
      color: #dc2626;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 12px;
      page-break-inside: avoid;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    th {
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: none;
    }

    td {
      border: 1px solid #e2e8f0;
      padding: 10px 12px;
      color: #333;
    }

    tbody tr:nth-child(even) {
      background: #f8fafc;
    }

    tbody tr:hover {
      background: #f1f5f9;
    }

    .section {
      margin: 30px 0;
      page-break-inside: avoid;
    }

    .section-content {
      line-height: 1.8;
      color: #444;
    }

    .section-content p {
      margin-bottom: 10px;
    }

    .section-content ul,
    .section-content ol {
      margin-left: 20px;
      margin-bottom: 10px;
    }

    .section-content li {
      margin-bottom: 8px;
      color: #555;
    }

    .chart-placeholder {
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 40px 20px;
      text-align: center;
      color: #6b7280;
      margin: 20px 0;
      font-size: 13px;
    }

    .score-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 12px;
      margin: 2px 4px 2px 0;
    }

    .score-good {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .score-warning {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }

    .score-alert {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .recommendations {
      background: #f0fdf4;
      border: 2px solid #bbf7d0;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }

    .recommendations h3 {
      color: #166534;
      font-size: 14px;
      margin-bottom: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .recommendations ol {
      margin-left: 20px;
    }

    .recommendations li {
      color: #166534;
      margin-bottom: 10px;
      line-height: 1.6;
    }

    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #999;
      font-size: 11px;
    }

    .footer-logo {
      font-weight: 800;
      color: #6366f1;
      font-size: 13px;
      margin-bottom: 5px;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
        background: white;
      }
      .container {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      table {
        page-break-inside: avoid;
      }
      .section {
        page-break-inside: avoid;
      }
      h2 {
        page-break-after: avoid;
      }
    }

    @media screen {
      body {
        background: #f3f4f6;
        padding: 20px;
      }
      .container {
        background: white;
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Nexus SEO Platform</div>
      <h1>${escapeHTML(data.title)}</h1>
      <div class="header-meta">`

  if (data.website) {
    html += `<span><strong>Site:</strong> ${escapeHTML(data.website)}</span>`
  }
  if (data.date) {
    html += `<span><strong>Date:</strong> ${escapeHTML(data.date)}</span>`
  }
  if (data.type) {
    html += `<span><strong>Type:</strong> ${escapeHTML(data.type)}</span>`
  }

  html += `</div>
    </div>`

  if (data.description) {
    html += `<div class="description">${escapeHTML(data.description)}</div>`
  }

  // Summary Section
  if (data.summary && options?.includeSummary !== false) {
    html += `<h2>Résumé Exécutif</h2>
    <div class="summary-grid">`

    Object.entries(data.summary).forEach(([key, value]) => {
      let cardClass = 'summary-card'
      const valueStr = String(value).toLowerCase()

      if (valueStr.includes('excellent') || valueStr.includes('bon') || valueStr.includes('✓')) {
        cardClass += ' good'
      } else if (valueStr.includes('moyen') || valueStr.includes('attention')) {
        cardClass += ' warning'
      } else if (valueStr.includes('mauvais') || valueStr.includes('critique') || valueStr.includes('✗')) {
        cardClass += ' alert'
      }

      html += `<div class="${cardClass}">
        <div class="label">${escapeHTML(key)}</div>
        <div class="value">${escapeHTML(String(value))}</div>
      </div>`
    })

    html += `</div>`
  }

  // Charts placeholder
  if (data.charts && data.charts.length > 0 && options?.includeCharts !== false) {
    data.charts.forEach(chart => {
      html += `<h2>${escapeHTML(chart.title)}</h2>
      <div class="chart-placeholder">
        Graphique ${chart.type.toUpperCase()}: ${chart.labels.join(', ')}
        <br><small>(Consulter le rapport interactif pour les graphiques détaillés)</small>
      </div>`
    })
  }

  // Table data
  if (data.columns && data.rows && data.rows.length > 0) {
    html += `<h2>Données Détaillées</h2>
    <table>
      <thead>
        <tr>`

    data.columns.forEach(col => {
      html += `<th>${escapeHTML(col.label)}</th>`
    })

    html += `</tr>
      </thead>
      <tbody>`

    data.rows.forEach(row => {
      html += '<tr>'
      data.columns!.forEach(col => {
        const value = row[col.key]
        const formatted = col.format ? col.format(value) : String(value ?? '-')
        html += `<td>${escapeHTML(formatted)}</td>`
      })
      html += '</tr>'
    })

    html += `</tbody>
    </table>`
  }

  // Sections
  if (data.sections && data.sections.length > 0) {
    data.sections.forEach(section => {
      html += `<div class="section">
        <h2>${escapeHTML(section.title)}</h2>
        <div class="section-content">`

      if (section.type === 'list') {
        const items = section.content.split('\n').filter(line => line.trim())
        html += '<ul>'
        items.forEach(item => {
          html += `<li>${escapeHTML(item.trim())}</li>`
        })
        html += '</ul>'
      } else if (section.type === 'score') {
        html += `<div class="score-badge score-good">${escapeHTML(section.content)}</div>`
      } else {
        html += `<p>${escapeHTML(section.content).replace(/\n/g, '<br>')}</p>`
      }

      html += `</div>
      </div>`
    })
  }

  // Recommendations
  if (data.recommendations && data.recommendations.length > 0 && options?.includeRecommendations !== false) {
    html += `<div class="recommendations">
      <h3>Recommandations Prioritaires</h3>
      <ol>`

    data.recommendations.forEach(rec => {
      html += `<li>${escapeHTML(rec)}</li>`
    })

    html += `</ol>
    </div>`
  }

  // Footer
  html += `<div class="footer">
      <div class="footer-logo">NEXUS</div>
      <div>Rapport généré automatiquement par Nexus SEO Platform</div>
      <div>${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</div>
    </div>
  </div>
</body>
</html>`

  return html
}

// ===== Helper Functions =====

/**
 * Download a file from blob content
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  URL.revokeObjectURL(url)
  document.body.removeChild(link)
}

/**
 * Convert text to URL-friendly slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100)
}

/**
 * Escape special characters for CSV format
 */
function escapeCSVField(field: string): string {
  const str = String(field ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return str.replace(/"/g, '""')
  }
  return str
}

/**
 * Escape special characters for Markdown
 */
function escapeMarkdown(text: string): string {
  return String(text ?? '')
    .replace(/[\\`*_{}[\]()#+\-.!|]/g, '\\$&')
}

/**
 * Escape HTML special characters
 */
function escapeHTML(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
