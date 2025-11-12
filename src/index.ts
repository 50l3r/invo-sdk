/**
 * @calltek/auth-sdk
 *
 * Authentication SDK for Calltek services
 *
 * @example
 * ```typescript
 * import { createAuthClient } from '@calltek/auth-sdk'
 *
 * const auth = createAuthClient({
 *   apiUrl: 'https://api.example.com',
 *   environment: 'production'
 * })
 *
 * // Login
 * const { user } = await auth.login({
 *   email: 'user@example.com',
 *   password: 'password123'
 * })
 * ```
 */

// Main client
export { createAuthClient } from './client'

// Types
export type {
    AuthClient,
    AuthClientConfig,
    AuthResponse,
    DecodedToken,
    Environment,
    LoginCredentials,
    OAuthCallbackData,
    OAuthProvider,
    OAuthUrlResponse,
    StorageAdapter,
    StorageType,
    User,
} from './types'

// Errors
export {
    AuthError,
    InvalidCredentialsError,
    InvalidTokenError,
    NetworkError,
    OAuthError,
    TokenExpiredError,
} from './errors'

// Utilities
export { decodeJWT, getSecondsUntilExpiration, isTokenExpired, isValidEmail } from './utils'

// Storage
export { StorageManager } from './storage'
