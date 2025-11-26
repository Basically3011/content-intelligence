import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, generateSessionToken, setSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Validate credentials
    if (!validateCredentials(username, password)) {
      // Add delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 500))
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Generate session token and set cookie
    const token = generateSessionToken()
    await setSessionCookie(token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
