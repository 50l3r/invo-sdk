/**
 * SDK Configuration types
 */

/**
 * Invoice SDK Configuration
 */
export interface InvoSDKConfig {
    /**
     * API token for authentication (required)
     * The SDK will automatically login when initialized
     * The workspace is determined by the API token configuration
     * Environment is auto-detected from the token prefix:
     * - invo_tok_prod_* → production
     * - invo_tok_sand_* → sandbox
     */
    apiToken: string

    /**
     * Environment to use
     * If not specified, it will be auto-detected from the token prefix
     * @default auto-detected from token
     */
    environment?: 'production' | 'sandbox'

    /**
     * Callback fired on authentication errors
     */
    onError?: (error: Error) => void

    /**
     * Enable debug logging to console
     * When enabled, logs all API requests and detailed error information
     * @default false
     */
    debug?: boolean
}

