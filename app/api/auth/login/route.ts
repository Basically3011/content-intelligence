import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, generateSessionToken, createSessionHash, SESSION_COOKIE, SESSION_DURATION } from '@/lib/auth'

export async function POST(request: NextRequest) {
  console.log('[API Login] Request received')
  try {
    const body = await request.json()
    const { username, password } = body
    console.log('[API Login] Username:', username)

    if (!username || !password) {
      console.log('[API Login] Missing credentials')
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Validate credentials
    console.log('[API Login] Validating credentials...')
    if (!validateCredentials(username, password)) {
      console.log('[API Login] Invalid credentials')
      // Add delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 500))
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Generate session token
    console.log('[API Login] Credentials valid, generating token...')
    const token = generateSessionToken()
    const hash = createSessionHash(token)
    const cookieValue = `${token}.${hash}`

    // Create response with cookie
    const response = NextResponse.json({ success: true })

    // Set cookie directly on response
    response.cookies.set(SESSION_COOKIE, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/',
    })

    console.log('[API Login] Login successful, cookie set')
    return response
  } catch (error) {
    console.error('[API Login] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
