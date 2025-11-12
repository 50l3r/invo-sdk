import { AuthError, InvalidCredentialsError } from './errors'

export type InvoSDKConfig = {
    email: string
    password: string
    environment: 'production' | 'sandbox'
}

export class InvoSDK {
    private email: string
    private password: string
    private environment: string

    constructor(config: InvoSDKConfig) {
        if (config.environment && !['production', 'sandbox'].includes(config.environment)) {
            throw new Error(
                'Invalid environment specified. Allowed values are production, staging, development.',
            )
        }

        this.email = config.email
        this.password = config.password
        this.environment = config.environment || 'production'
    }

    get apiUrl(): string {
        return this.environment === 'production'
            ? 'https://api.invo.com'
            : 'https://sandbox-api.invo.com'
    }

    private async apiRequest<T>(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
        body?: unknown,
    ): Promise<T> {
        try {
            const url = `${this.apiUrl}${endpoint}`
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'X-Environment': this.environment,
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

    login() {}
}
