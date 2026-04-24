import { NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean)

function getOrigin(requestOrigin: string | null): string {
  if (!requestOrigin) return ALLOWED_ORIGINS[0]
  if (ALLOWED_ORIGINS.includes(requestOrigin)) return requestOrigin
  // In production, also allow the deployment URL
  if (process.env.VERCEL_URL && requestOrigin.includes(process.env.VERCEL_URL)) {
    return requestOrigin
  }
  return ALLOWED_ORIGINS[0]
}

export const corsHeaders = (requestOrigin: string | null = null) => ({
  'Access-Control-Allow-Origin': getOrigin(requestOrigin),
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
})

export function withCors(response: NextResponse, requestOrigin: string | null = null): NextResponse {
  const headers = corsHeaders(requestOrigin)
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

export function corsOptionsResponse(requestOrigin: string | null = null): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(requestOrigin),
  })
}
