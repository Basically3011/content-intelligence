import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Session cookie name (must match lib/auth.ts)
const SESSION_COOKIE = 'ci_session'

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login', '/api/auth/logout']

// Convert string to ArrayBuffer for Web Crypto API
function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder()
  return encoder.encode(str).buffer
}

// Convert ArrayBuffer to hex string
function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Verify session hash using Web Crypto API (Edge runtime compatible)
async function verifySession(cookieValue: string, secret: string): Promise<boolean> {
  const [token, hash] = cookieValue.split('.')

  if (!token || !hash) {
    return false
  }

  try {
    // Use Web Crypto API for SHA-256 hashing
    const data = stringToArrayBuffer(token + secret)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const expectedHash = arrayBufferToHex(hashBuffer)
    return hash === expectedHash
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow health check (for Docker health checks)
  if (pathname === '/api/health') {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE)
  const secret = process.env.AUTH_SECRET || 'default-secret-change-me'

  // Verify session
  const isAuthenticated = sessionCookie?.value && await verifySession(sessionCookie.value, secret)

  // Handle unauthenticated requests
  if (!isAuthenticated) {
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // For page routes, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
