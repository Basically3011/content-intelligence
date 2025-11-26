import { NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/auth'

export async function POST() {
  try {
    const response = NextResponse.json({ success: true })

    // Delete cookie by setting it with maxAge 0
    const isHttps = process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') ?? false
    response.cookies.set(SESSION_COOKIE, '', {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}
