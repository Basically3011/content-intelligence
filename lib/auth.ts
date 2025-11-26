import { cookies } from 'next/headers'
import { createHash, randomBytes } from 'crypto'

// Session token name
export const SESSION_COOKIE = 'ci_session'

// Session duration: 24 hours
export const SESSION_DURATION = 24 * 60 * 60 * 1000

// Hash password for comparison (simple but secure enough for MVP)
function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(password + salt).digest('hex')
}

// Validate credentials against environment variables
export function validateCredentials(username: string, password: string): boolean {
  const validUsername = process.env.AUTH_USERNAME
  const validPassword = process.env.AUTH_PASSWORD

  if (!validUsername || !validPassword) {
    console.error('AUTH_USERNAME or AUTH_PASSWORD not configured')
    return false
  }

  return username === validUsername && password === validPassword
}

// Generate a secure session token
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

// Create session hash (stored in cookie, verified against env secret)
export function createSessionHash(token: string): string {
  const secret = process.env.AUTH_SECRET || 'default-secret-change-me'
  return createHash('sha256').update(token + secret).digest('hex')
}

// Verify session hash
export function verifySessionHash(token: string, hash: string): boolean {
  const expectedHash = createSessionHash(token)
  return hash === expectedHash
}

// Set session cookie
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  const hash = createSessionHash(token)

  cookieStore.set(SESSION_COOKIE, `${token}.${hash}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/',
  })
}

// Get and verify session from cookie
export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)

  if (!sessionCookie?.value) {
    return null
  }

  const [token, hash] = sessionCookie.value.split('.')

  if (!token || !hash) {
    return null
  }

  if (!verifySessionHash(token, hash)) {
    return null
  }

  return token
}

// Clear session cookie
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}
