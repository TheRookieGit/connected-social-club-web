import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
  const REDIRECT_URI = process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3000/api/auth/linkedin/callback'
  
  if (!CLIENT_ID) {
    return NextResponse.json({ error: 'LinkedIn Client ID not configured' }, { status: 500 })
  }

  // LinkedIn OAuth 2.0 授权URL
  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('client_id', CLIENT_ID)
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.append('scope', 'openid profile email')
  authUrl.searchParams.append('state', Math.random().toString(36).substring(7)) // 简单的state生成

  return NextResponse.redirect(authUrl.toString())
} 