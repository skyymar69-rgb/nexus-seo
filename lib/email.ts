/**
 * Email Notification Service
 * Envoie des alertes automatiques aux utilisateurs
 *
 * Setup: ajouter RESEND_API_KEY dans .env
 * Gratuit: 3000 emails/mois
 * Documentation: https://resend.com/docs
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const FROM_EMAIL = process.env.EMAIL_FROM || 'Nexus SEO <notifications@nexus.kayzen-lyon.fr>'
const APP_URL = process.env.NEXT_PUBLIC_URL || 'https://nexus.kayzen-lyon.fr'

export function isEmailConfigured(): boolean {
  return !!RESEND_API_KEY
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn('Email not configured: RESEND_API_KEY missing')
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Email send failed:', error)
    return false
  }
}

// ─── Email Templates ──────────────────────────────────────────

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:Inter,system-ui,sans-serif;background:#f4f4f5">
<div style="max-width:600px;margin:0 auto;padding:20px">
  <div style="background:linear-gradient(135deg,#172554,#2563eb);padding:24px;border-radius:16px 16px 0 0;text-align:center">
    <span style="color:#fff;font-size:24px;font-weight:900">Nexus SEO</span>
    <span style="display:block;color:rgba(255,255,255,0.6);font-size:12px;margin-top:4px">By Kayzen</span>
  </div>
  <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;border:1px solid #e4e4e7;border-top:none">
    ${content}
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e4e4e7;text-align:center">
      <a href="${APP_URL}/dashboard" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px">Voir mon dashboard</a>
    </div>
  </div>
  <div style="text-align:center;margin-top:16px;color:#a1a1aa;font-size:12px">
    <a href="${APP_URL}" style="color:#a1a1aa;text-decoration:none">nexus.kayzen-lyon.fr</a> — Outil SEO gratuit par Kayzen
  </div>
</div>
</body>
</html>`
}

// ─── Alert Types ──────────────────────────────────────────────

export async function sendScoreDropAlert(to: string, domain: string, oldScore: number, newScore: number): Promise<boolean> {
  const drop = oldScore - newScore
  return sendEmail(to,
    `Alerte SEO: ${domain} a perdu ${drop} points`,
    baseTemplate(`
      <h2 style="color:#18181b;font-size:20px;margin:0 0 8px">Score SEO en baisse</h2>
      <p style="color:#71717a;margin:0 0 24px">Le score de <strong>${domain}</strong> a baisse.</p>
      <div style="display:flex;gap:16px;margin-bottom:24px">
        <div style="flex:1;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;text-align:center">
          <div style="color:#dc2626;font-size:32px;font-weight:900">${newScore}</div>
          <div style="color:#dc2626;font-size:12px">Score actuel</div>
        </div>
        <div style="flex:1;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:12px;padding:16px;text-align:center">
          <div style="color:#71717a;font-size:32px;font-weight:900">${oldScore}</div>
          <div style="color:#71717a;font-size:12px">Score precedent</div>
        </div>
      </div>
      <p style="color:#71717a;font-size:14px">Lancez un audit pour identifier les causes de cette baisse et obtenir des recommandations.</p>
    `)
  )
}

export async function sendNewBacklinkAlert(to: string, domain: string, sourceDomain: string, sourceUrl: string): Promise<boolean> {
  return sendEmail(to,
    `Nouveau backlink detecte pour ${domain}`,
    baseTemplate(`
      <h2 style="color:#18181b;font-size:20px;margin:0 0 8px">Nouveau backlink</h2>
      <p style="color:#71717a;margin:0 0 24px">Un nouveau lien vers <strong>${domain}</strong> a ete detecte.</p>
      <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:16px;margin-bottom:24px">
        <div style="color:#059669;font-size:14px;font-weight:600">${sourceDomain}</div>
        <div style="color:#71717a;font-size:12px;margin-top:4px;word-break:break-all">${sourceUrl}</div>
      </div>
    `)
  )
}

export async function sendPositionChangeAlert(to: string, domain: string, keyword: string, oldPos: number, newPos: number): Promise<boolean> {
  const improved = newPos < oldPos
  const diff = Math.abs(oldPos - newPos)
  return sendEmail(to,
    `${improved ? 'Progression' : 'Regression'}: "${keyword}" ${improved ? 'monte' : 'descend'} de ${diff} positions`,
    baseTemplate(`
      <h2 style="color:#18181b;font-size:20px;margin:0 0 8px">Changement de position</h2>
      <p style="color:#71717a;margin:0 0 24px">Le mot-cle <strong>"${keyword}"</strong> sur <strong>${domain}</strong> a change.</p>
      <div style="display:flex;gap:16px;margin-bottom:24px">
        <div style="flex:1;background:${improved ? '#ecfdf5' : '#fef2f2'};border:1px solid ${improved ? '#a7f3d0' : '#fecaca'};border-radius:12px;padding:16px;text-align:center">
          <div style="color:${improved ? '#059669' : '#dc2626'};font-size:32px;font-weight:900">#${newPos}</div>
          <div style="color:${improved ? '#059669' : '#dc2626'};font-size:12px">Position actuelle</div>
        </div>
        <div style="flex:1;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:12px;padding:16px;text-align:center">
          <div style="color:#71717a;font-size:32px;font-weight:900">#${oldPos}</div>
          <div style="color:#71717a;font-size:12px">Position precedente</div>
        </div>
      </div>
      <p style="color:#71717a;font-size:14px">${improved ? 'Felicitations ! Continuez vos efforts d\'optimisation.' : 'Consultez votre dashboard pour analyser cette regression.'}</p>
    `)
  )
}

export async function sendWeeklyReport(to: string, domain: string, stats: {
  score: number; keywords: number; backlinks: number; mentionRate: number;
}): Promise<boolean> {
  return sendEmail(to,
    `Rapport hebdomadaire — ${domain}`,
    baseTemplate(`
      <h2 style="color:#18181b;font-size:20px;margin:0 0 8px">Rapport hebdomadaire</h2>
      <p style="color:#71717a;margin:0 0 24px">Resume de la semaine pour <strong>${domain}</strong></p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;text-align:center">
          <div style="color:#2563eb;font-size:28px;font-weight:900">${stats.score}</div>
          <div style="color:#2563eb;font-size:11px">Score SEO</div>
        </div>
        <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:16px;text-align:center">
          <div style="color:#7c3aed;font-size:28px;font-weight:900">${stats.keywords}</div>
          <div style="color:#7c3aed;font-size:11px">Mots-cles suivis</div>
        </div>
        <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:16px;text-align:center">
          <div style="color:#059669;font-size:28px;font-weight:900">${stats.backlinks}</div>
          <div style="color:#059669;font-size:11px">Backlinks</div>
        </div>
        <div style="background:#fef9c3;border:1px solid #fde047;border-radius:12px;padding:16px;text-align:center">
          <div style="color:#ca8a04;font-size:28px;font-weight:900">${stats.mentionRate}%</div>
          <div style="color:#ca8a04;font-size:11px">Visibilite IA</div>
        </div>
      </div>
    `)
  )
}
