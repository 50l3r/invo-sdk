import { DecodedToken } from './types'
import { InvalidTokenError } from './errors'

/**
 * Decode a JWT token
 */
export function decodeJWT(token: string): DecodedToken {
    try {
        const base64Url = token.split('.')[1]
        if (!base64Url) {
            throw new InvalidTokenError('Invalid token format')
        }

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join(''),
        )

        return JSON.parse(jsonPayload) as DecodedToken
    } catch (error) {
        throw new InvalidTokenError('Failed to decode token')
    }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string, bufferSeconds = 0): boolean {
    try {
        const decoded = decodeJWT(token)
        const currentTime = Math.floor(Date.now() / 1000)
        return decoded.exp < currentTime + bufferSeconds
    } catch {
        return true
    }
}

/**
 * Get seconds until token expires
 */
export function getSecondsUntilExpiration(token: string): number {
    try {
        const decoded = decodeJWT(token)
        const currentTime = Math.floor(Date.now() / 1000)
        return Math.max(0, decoded.exp - currentTime)
    } catch {
        return 0
    }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}
