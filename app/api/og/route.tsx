import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'Nexus SEO'
  const subtitle = searchParams.get('subtitle') || 'La plateforme SEO & IA 100% gratuite'
  const score = searchParams.get('score')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #172554 0%, #1e3a8a 50%, #2563eb 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.05,
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            textAlign: 'center',
          }}
        >
          {/* Logo dots */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '30px' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#3b82f6' }} />
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#facc15' }} />
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#22c55e' }} />
          </div>

          {/* Score gauge if provided */}
          {score && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 120,
                height: 120,
                borderRadius: '50%',
                border: `6px solid ${parseInt(score) >= 80 ? '#22c55e' : parseInt(score) >= 60 ? '#f59e0b' : '#ef4444'}`,
                marginBottom: '24px',
                fontSize: '42px',
                fontWeight: 900,
                color: 'white',
              }}
            >
              {score}
            </div>
          )}

          {/* Title */}
          <div
            style={{
              fontSize: score ? '36px' : '52px',
              fontWeight: 900,
              color: 'white',
              lineHeight: 1.2,
              marginBottom: '16px',
              maxWidth: '800px',
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '22px',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '600px',
            }}
          >
            {subtitle}
          </div>

          {/* Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '40px',
              fontSize: '16px',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            nexus.kayzen-lyon.fr
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
