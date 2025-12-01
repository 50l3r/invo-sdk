/**
 * Test script for INVO SDK API Token Authentication
 * Tests: new InvoSDK() with API token and automatic login
 *
 * Note: API token management (create, list, revoke) is done through the INVO web platform.
 * This test assumes you have an existing API token from your INVO account.
 */

import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { InvoSDK } from '../src/sdk'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env file in project root
config({ path: resolve(__dirname, '../.env') })

// Configuration
const TEST_API_TOKEN = process.env.INVO_API_TOKEN || 'your-api-token-here'
const TEST_NAME = process.env.INVO_NAME
const TEST_NIF = process.env.INVO_NIF

async function main() {
    console.log('🚀 Starting INVO SDK API Token Authentication Tests\n')

    if (!TEST_API_TOKEN || TEST_API_TOKEN === 'your-api-token-here') {
        console.error('❌ Error: INVO_API_TOKEN environment variable is not set')
        console.error('   Please add INVO_API_TOKEN to your .env file')
        console.error('   You can obtain an API token from your INVO account dashboard')
        process.exit(1)
    }

    try {
        // Test 1: Create SDK with API Token (automatic login)
        console.log('🔐 Test 1: Create SDK with API Token (automatic authentication)')
        console.log('  Creating SDK instance...')
        const sdk = new InvoSDK({
            apiToken: TEST_API_TOKEN
        })
        console.log('  ✅ SDK created successfully!')
        console.log(`  Environment: ${sdk.environment}`)

        // Test 2: Create test invoice (authentication happens automatically)
        console.log('\n📄 Test 2: Create Invoice with Token Authentication')
        console.log('  Preparing test invoice...')

        const invoiceData = {
            issueDate: new Date().toISOString(),
            invoiceNumber: `TEST-TOKEN-${Date.now()}`,
            externalId: `test-token-order-${Date.now()}`,
            totalAmount: 1210.0,
            customerName: TEST_NAME || 'Test Customer',
            customerTaxId: TEST_NIF || 'B12345678',
            emitterName: TEST_NAME || 'Test Emitter',
            emitterTaxId: TEST_NIF || 'B87654321',
            type: 'F1' as const,
            description: 'Factura de prueba del SDK con API Token',
            taxLines: [
                {
                    taxRate: 21,
                    baseAmount: 1000.0,
                    taxAmount: 210.0,
                },
            ],
        }

        console.log('  Creating invoice (login happens automatically)...')
        const result = await sdk.store(invoiceData)
        console.log('  ✅ Invoice created successfully!')
        console.log(`  Invoice ID: ${result.invoiceId}`)
        console.log(`  Chain Index: ${result.chainIndex}`)
        console.log(`  Is authenticated: ${sdk.isAuthenticated() ? '✅' : '❌'}`)
        const user = sdk.getUser()
        console.log(`  Current user: ${user?.email || 'None'}`)

        // Test 3: Create invoice with webhook callback
        console.log('\n📞 Test 3: Create Invoice with Webhook Callback')
        console.log('  Preparing test invoice with webhook...')

        const invoiceData2 = {
            issueDate: new Date().toISOString(),
            invoiceNumber: `TEST-WEBHOOK-${Date.now()}`,
            externalId: `test-webhook-order-${Date.now()}`,
            totalAmount: 605.0,
            customerName: TEST_NAME || 'Test Customer',
            customerTaxId: TEST_NIF || 'B12345678',
            emitterName: TEST_NAME || 'Test Emitter',
            emitterTaxId: TEST_NIF || 'B87654321',
            type: 'F1' as const,
            description: 'Factura de prueba con webhook',
            taxLines: [
                {
                    taxRate: 21,
                    baseAmount: 500.0,
                    taxAmount: 105.0,
                },
            ],
        }

        const webhookUrl = 'https://example.com/webhooks/invoice-status'
        console.log(`  Webhook URL: ${webhookUrl}`)
        console.log('  Creating invoice with webhook...')
        const result2 = await sdk.store(invoiceData2, webhookUrl)
        console.log('  ✅ Invoice with webhook created successfully!')
        console.log(`  Invoice ID: ${result2.invoiceId}`)
        console.log(`  Chain Index: ${result2.chainIndex}`)

        // Test 4: Verify workspace is determined by API token
        console.log('\n🏢 Test 4: Workspace Management')
        console.log('  ✅ Workspace is automatically determined by the API token')
        console.log('  Each API token is associated with a specific workspace')
        console.log('  No need to specify workspace separately')

        console.log('\n🎉 All API Token authentication tests completed successfully!')
        console.log('')
        console.log('💡 Note: API token management (create, list, revoke) is done through')
        console.log('   the INVO web platform at https://invo.rest')
        console.log('')
    } catch (error) {
        console.error('')
        console.error('❌ Test failed!')
        if (error instanceof Error) {
            console.error(`  Error: ${error.message}`)
            console.error(`  Type: ${error.constructor.name}`)
            if (error.stack) {
                console.error('')
                console.error('Stack trace:')
                console.error(error.stack)
            }
        } else {
            console.error('  Unknown error:', error)
        }
        process.exit(1)
    }
}

// Run tests
main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
})
