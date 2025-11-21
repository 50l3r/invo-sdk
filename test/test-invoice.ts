/**
 * Test script for INVO SDK Invoice Creation
 *
 * Usage:
 * npx tsx test/test-invoice.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { InvoSDK } from '../src/sdk'

// Load environment variables from .env file in project root
config({ path: resolve(__dirname, '../.env') })

// Configuration
const TEST_API_TOKEN = process.env.INVO_API_TOKEN || 'your-api-token-here'
const TEST_NAME = process.env.INVO_NAME
const TEST_NIF = process.env.INVO_NIF

async function main() {
    console.log('🚀 Starting INVO SDK Invoice Tests\n')

    if (!TEST_API_TOKEN || TEST_API_TOKEN === 'your-api-token-here') {
        console.error('❌ Error: INVO_API_TOKEN environment variable is not set')
        console.error('   Please add INVO_API_TOKEN to your .env file')
        process.exit(1)
    }

    // Create SDK instance
    console.log('📦 Creating SDK instance...')
    const sdk = new InvoSDK({
        apiToken: TEST_API_TOKEN,
        onError: (error) => {
            console.error('❌ SDK Error:', error.message)
        },
    })
    console.log(`  Environment: ${sdk.environment}`)
    console.log('')

    try {
        // Test 1: Create a simple invoice
        console.log('📄 Test 1: Create Simple Invoice')
        console.log('  Creating test invoice...')

        const invoiceData = {
            issueDate: new Date().toISOString(),
            invoiceNumber: `TEST-${Date.now()}`,
            externalId: `test-order-${Date.now()}`,
            totalAmount: 1210.0,
            customerName: TEST_NAME || 'Test Customer',
            customerTaxId: TEST_NIF || 'B12345678',
            emitterName: TEST_NAME || 'Test Emitter',
            emitterTaxId: TEST_NIF || 'B87654321',
            type: 'F1' as const,
            description: 'Factura de prueba del SDK',
            taxLines: [
                {
                    taxRate: 21,
                    baseAmount: 1000.0,
                    taxAmount: 210.0,
                },
            ],
        }

        const result = await sdk.store(invoiceData)
        console.log('  ✅ Invoice created successfully!')
        console.log(`  Invoice ID: ${result.invoiceId}`)
        console.log(`  Chain Index: ${result.chainIndex}`)
        console.log(`  Success: ${result.success}`)
        console.log('')

        // Test 2: Check authentication status after first call
        console.log('🔍 Test 2: Authentication Status')
        const isAuthenticated = sdk.isAuthenticated()
        console.log(`  Is authenticated: ${isAuthenticated ? '✅' : '❌'}`)
        const user = sdk.getUser()
        console.log(`  Current user: ${user?.email || 'None'}`)
        const accessToken = sdk.getAccessToken()
        console.log(`  Has access token: ${accessToken ? '✅' : '❌'}`)
        console.log('')

        // Test 3: Create invoice with multiple tax rates
        console.log('📄 Test 3: Create Invoice with Multiple Tax Rates')
        console.log('  Creating invoice with 3 different tax rates...')

        const multiTaxInvoiceData = {
            issueDate: new Date().toISOString(),
            invoiceNumber: `TEST-MULTI-${Date.now()}`,
            externalId: `multi-tax-${Date.now()}`,
            totalAmount: 1864.0,
            customerName: TEST_NAME || 'Test Customer',
            customerTaxId: TEST_NIF || 'B12345678',
            emitterName: TEST_NAME || 'Test Emitter',
            emitterTaxId: TEST_NIF || 'B87654321',
            type: 'F1' as const,
            description: 'Factura con múltiples tipos de IVA',
            taxLines: [
                {
                    taxRate: 21,
                    baseAmount: 1000.0,
                    taxAmount: 210.0,
                },
                {
                    taxRate: 10,
                    baseAmount: 500.0,
                    taxAmount: 50.0,
                },
                {
                    taxRate: 4,
                    baseAmount: 100.0,
                    taxAmount: 4.0,
                },
            ],
        }

        const multiTaxResult = await sdk.store(multiTaxInvoiceData)
        console.log('  ✅ Multi-tax invoice created successfully!')
        console.log(`  Invoice ID: ${multiTaxResult.invoiceId}`)
        console.log(`  Chain Index: ${multiTaxResult.chainIndex}`)
        console.log('')

        // Test 4: Create invoice with webhook
        console.log('📄 Test 4: Create Invoice with Webhook')
        console.log('  Creating invoice with webhook callback...')

        const webhookInvoiceData = {
            issueDate: new Date().toISOString(),
            invoiceNumber: `TEST-WEBHOOK-${Date.now()}`,
            externalId: `webhook-${Date.now()}`,
            totalAmount: 605.0,
            customerName: TEST_NAME || 'Test Customer',
            customerTaxId: TEST_NIF || 'B12345678',
            emitterName: TEST_NAME || 'Test Emitter',
            emitterTaxId: TEST_NIF || 'B87654321',
            type: 'F1' as const,
            description: 'Factura con webhook',
            taxLines: [
                {
                    taxRate: 21,
                    baseAmount: 500.0,
                    taxAmount: 105.0,
                },
            ],
        }

        const webhookUrl = 'https://example.com/webhooks/invoice-status'
        const webhookResult = await sdk.store(webhookInvoiceData, webhookUrl)
        console.log('  ✅ Invoice with webhook created successfully!')
        console.log(`  Invoice ID: ${webhookResult.invoiceId}`)
        console.log(`  Chain Index: ${webhookResult.chainIndex}`)
        console.log(`  Webhook URL: ${webhookUrl}`)
        console.log('')

        console.log('🎉 All tests completed successfully!')
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
