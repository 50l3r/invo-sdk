import {
    AuthClient,
    AuthClientConfig,
    AuthResponse,
    Environment,
    LoginCredentials,
    OAuthCallbackData,
    OAuthProvider,
    User,
} from './types'
import { StorageManager } from './storage'
import { decodeJWT, isTokenExpired } from './utils'
import {
    AuthError,
    InvalidCredentialsError,
    NetworkError,
    TokenExpiredError,
} from './errors'

/**
 * Authentication client implementation
 */
export class AuthClientImpl implements AuthClient {
    private storage: StorageManager
    private config: Required<AuthClientConfig>
    private refreshTimer: ReturnType<typeof setTimeout> | null = null

    constructor(config: AuthClientConfig) {
        this.config = {
            environment: 'production',
            storage: 'localStorage',
            autoRefresh: true,
            refreshBuffer: 300, // 5 minutes
            storagePrefix: 'auth_',
            onTokenRefreshed: () => {},
            onLogout: () => {},
            onError: () => {},
            ...config,
        }

        this.storage = new StorageManager(this.config.storage, this.config.storagePrefix)

        // Setup auto-refresh if enabled and we have tokens
        if (this.config.autoRefresh && this.getAccessToken()) {
            this.setupAutoRefresh()
        }
    }

    /**
     * Make authenticated API request
     */
    private async apiRequest<T>(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
        body?: unknown,
    ): Promise<T> {
        try {
            const url = `${this.config.apiUrl}${endpoint}`
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'X-Environment': this.config.environment,
            }

            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            })

            if (!response.ok) {
                const error = await response.json().catch(() => ({
                    message: 'Request failed',
                }))

                if (response.status === 401) {
                    throw new InvalidCredentialsError(error.message)
                }

                throw new AuthError(error.message || 'Request failed', response.status)
            }

            return response.json()
        } catch (error) {
            if (error instanceof AuthError) {
                this.config.onError(error)
                throw error
            }

            const networkError = new NetworkError(
                error instanceof Error ? error.message : 'Network request failed',
            )
            this.config.onError(networkError)
            throw networkError
        }
    }

    /**
     * Save authentication tokens
     */
    private saveTokens(response: AuthResponse): void {
        this.storage.set('access_token', response.access_token)
        this.storage.set('refresh_token', response.refresh_token)
        this.storage.setObject('user', response.user)

        if (this.config.autoRefresh) {
            this.setupAutoRefresh()
        }
    }

    /**
     * Setup automatic token refresh
     */
    private setupAutoRefresh(): void {
        // Clear existing timer
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer)
        }

        const accessToken = this.getAccessToken()
        if (!accessToken) return

        try {
            const decoded = decodeJWT(accessToken)
            const expiresIn = decoded.exp - Math.floor(Date.now() / 1000)
            const refreshAt = Math.max(0, expiresIn - this.config.refreshBuffer) * 1000

            this.refreshTimer = setTimeout(async () => {
                try {
                    await this.refreshToken()
                } catch (error) {
                    console.error('Auto-refresh failed:', error)
                    this.config.onError(
                        error instanceof Error ? error : new Error('Auto-refresh failed'),
                    )
                }
            }, refreshAt)
        } catch (error) {
            console.error('Failed to setup auto-refresh:', error)
        }
    }

    /**
     * Login with email and password
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await this.apiRequest<AuthResponse>('/auth/login', 'POST', credentials)
        this.saveTokens(response)
        return response
    }

    /**
     * Logout and clear tokens
     */
    logout(): void {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer)
            this.refreshTimer = null
        }

        this.storage.clear()
        this.config.onLogout()
    }

    /**
     * Refresh access token
     */
    async refreshToken(): Promise<AuthResponse> {
        const refreshToken = this.getRefreshToken()

        if (!refreshToken) {
            throw new TokenExpiredError('No refresh token available')
        }

        const response = await this.apiRequest<AuthResponse>('/auth/refresh', 'POST', {
            refresh_token: refreshToken,
        })

        this.saveTokens(response)
        this.config.onTokenRefreshed(response)
        return response
    }

    /**
     * Get OAuth URL for a provider
     */
    async getOAuthUrl(provider: OAuthProvider): Promise<string> {
        const response = await this.apiRequest<{ url: string }>(`/auth/oauth/${provider}`)
        return response.url
    }

    /**
     * Handle OAuth callback
     */
    async handleOAuthCallback(data: OAuthCallbackData): Promise<AuthResponse> {
        const response = await this.apiRequest<AuthResponse>('/auth/oauth/callback', 'POST', data)
        this.saveTokens(response)
        return response
    }

    /**
     * Get current access token
     */
    getAccessToken(): string | null {
        return this.storage.get('access_token')
    }

    /**
     * Get current refresh token
     */
    getRefreshToken(): string | null {
        return this.storage.get('refresh_token')
    }

    /**
     * Get current user
     */
    getUser(): User | null {
        return this.storage.getObject<User>('user')
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        const token = this.getAccessToken()
        if (!token) return false

        try {
            return !isTokenExpired(token)
        } catch {
            return false
        }
    }

    /**
     * Get current environment
     */
    getEnvironment(): Environment {
        return this.config.environment
    }

    /**
     * Switch environment
     */
    setEnvironment(env: Environment): void {
        this.config.environment = env
    }
}

/**
 * Create a new authentication client
 */
export function createAuthClient(config: AuthClientConfig): AuthClient {
    return new AuthClientImpl(config)
}
