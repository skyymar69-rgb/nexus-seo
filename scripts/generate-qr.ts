import QRCode from 'qrcode'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = join(process.cwd(), 'public', 'qr')

const targets: Array<{ name: string; data: string; color: string }> = [
  {
    name: 'site',
    data: 'https://nexus-seo.app',
    color: '#2563eb',
  },
  {
    name: 'maps',
    data: 'https://maps.google.com/?q=6+rue+Pierre+Termier+69009+Lyon',
    color: '#059669',
  },
  {
    name: 'reviews',
    data: 'https://www.google.com/search?q=Kayzen+Lyon+6+rue+Pierre+Termier+avis&hl=fr',
    color: '#d97706',
  },
  {
    name: 'vcard',
    data: 'https://nexus-seo.app/kayzen-lyon.vcf',
    color: '#7c3aed',
  },
]

async function main() {
  for (const t of targets) {
    const svg = await QRCode.toString(t.data, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 1,
      color: { dark: t.color, light: '#00000000' },
      width: 512,
    })
    const out = join(OUT, `${t.name}.svg`)
    writeFileSync(out, svg, 'utf8')
    console.log(`✓ ${t.name}.svg  →  ${t.data}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
