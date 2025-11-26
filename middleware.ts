import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createHash } from 'crypto'

// Session cookie name (must match lib/auth.ts)
const SESSION_COOKIE = 'ci_session'

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login', '/api/auth/logout']

// API routes that should be protected
const protectedApiRoutes = ['/api/content', '/api/filters', '/api/coverage', '/api/classification', '/api/nurture-coverage', '/api/test-scoring']

// Verify session hash (simplified version for middleware - Edge runtime compatible)
function verifySession(cookieValue: string, secret: string): boolean {
  const [token, hash] = cookieValue.split('.')

  if (!token || !hash) {
    return false
  }

  const expectedHash = createHash('sha256').update(token + secret).digest('hex')
  return hash === expectedHash
}

export function middleware(request: NextRequest) {
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
  const isAuthenticated = sessionCookie?.value && verifySession(sessionCookie.value, secret)

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
