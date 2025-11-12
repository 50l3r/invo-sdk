/**
 * Environment type for multi-environment support
 */
export type Environment = 'production' | 'development'

/**
 * Storage type options
 */
export type StorageType = 'localStorage' | 'sessionStorage' | 'memory' | 'custom'

/**
 * Login credentials
 */
export interface LoginCredentials {
    email: string
    password: string
}

/**
 * Authentication response from the API
 */
export interface AuthResponse {
    access_token: string
    refresh_token: string
    expires_in: number
    user: {
        id: string
        email: string
    }
}

/**
 * User information
 */
export interface User {
    id: string
    email: string
}

/**
 * OAuth providers supported
 */
export type OAuthProvider = 'google' | 'github' | 'azure' | 'facebook'

/**
 * OAuth URL response
 */
export interface OAuthUrlResponse {
    url: string
}

/**
 * OAuth callback data
 */
export interface OAuthCallbackData {
    access_token: string
    refresh_token: string
    expires_in?: number
}

/**
 * Decoded JWT payload
 */
export interface DecodedToken {
    sub: string
    email: string
    exp: number
    iat: number
    [key: string]: unknown
}

/**
 * Storage interface for custom implementations
 */
export interface StorageAdapter {
    getItem(key: string): string | null
    setItem(key: string, value: string): void
    removeItem(key: string): void
    clear(): void
}

/**
 * SDK Configuration options
 */
export interface AuthClientConfig {
    /**
     * Base API URL (e.g., 'https://api.example.com')
     */
    apiUrl: string

    /**
     * Environment to use (production or development)
     * @default 'production'
     */
    environment?: Environment

    /**
     * Storage type or custom adapter
     * @default 'localStorage'
     */
    storage?: StorageType | StorageAdapter

    /**
     * Enable automatic token refresh
     * @default true
     */
    autoRefresh?: boolean

    /**
     * Buffer time in seconds before token expiration to trigger refresh
     * @default 300 (5 minutes)
     */
    refreshBuffer?: number

    /**
     * Storage key prefix
     * @default 'auth_'
     */
    storagePrefix?: string

    /**
     * Callback fired when tokens are refreshed
     */
    onTokenRefreshed?: (tokens: AuthResponse) => void

    /**
     * Callback fired when user logs out
     */
    onLogout?: () => void

    /**
     * Callback fired on authentication errors
     */
    onError?: (error: Error) => void
}

/**
 * Auth client public API
 */
export interface AuthClient {
    /**
     * Login with email and password
     */
    login(credentials: LoginCredentials): Promise<AuthResponse>

    /**
     * Logout and clear tokens
     */
    logout(): void

    /**
     * Refresh access token
     */
    refreshToken(): Promise<AuthResponse>

    /**
     * Get OAuth URL for a provider
     */
    getOAuthUrl(provider: OAuthProvider): Promise<string>

    /**
     * Handle OAuth callback
     */
    handleOAuthCallback(data: OAuthCallbackData): Promise<AuthResponse>

    /**
     * Get current access token
     */
    getAccessToken(): string | null

    /**
     * Get current refresh token
     */
    getRefreshToken(): string | null

    /**
     * Get current user
     */
    getUser(): User | null

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean

    /**
     * Get current environment
     */
    getEnvironment(): Environment

    /**
     * Switch environment
     */
    setEnvironment(env: Environment): void
}
