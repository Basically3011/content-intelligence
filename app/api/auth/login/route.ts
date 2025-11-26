import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, generateSessionToken, setSessionCookie } from '@/lib/auth'

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

    // Generate session token and set cookie
    console.log('[API Login] Credentials valid, generating token...')
    const token = generateSessionToken()
    await setSessionCookie(token)

    console.log('[API Login] Login successful')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Login] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
