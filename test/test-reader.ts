/**
 * Test script for INVO SDK - Reader Endpoint
 *
 * Tests the read method that reads invoice data from uploaded files
 *
 * Usage:
 * npx tsx test/test-reader.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'
import { InvoSDK } from '../src/sdk'

// Load environment variables from .env file in project root
config({ path: resolve(__dirname, '../.env') })

// Configuration
const TEST_API_TOKEN = process.env.INVO_API_TOKEN || 'your-api-token-here'

// Path to test invoice file (PDF, XML, etc.)
const TEST_INVOICE_PATH = process.env.TEST_INVOICE_PATH || resolve(__dirname, '../test/factura_test.pdf')

async function main() {
    console.log('🚀 Starting INVO SDK Reader Tests\n')

    if (!TEST_API_TOKEN || TEST_API_TOKEN === 'your-api-token-here') {
        console.error('❌ Error: INVO_API_TOKEN environment variable is not set')
        console.error('   Please add INVO_API_TOKEN to your .env file')
        process.exit(1)
    }

    console.log('Configuration:')
    console.log(`  Test Invoice Path: ${TEST_INVOICE_PATH}`)
    console.log('')

    // Check if test invoice file exists
    if (!existsSync(TEST_INVOICE_PATH)) {
        console.error('❌ Test invoice file not found!')
        console.error(`   Expected file at: ${TEST_INVOICE_PATH}`)
        console.error('')
        console.error('📝 To run this test:')
        console.error('   1. Place a test invoice PDF/XML file in the project root')
        console.error('   2. Name it "factura_test.pdf" or set TEST_INVOICE_PATH env variable')
        console.error('   3. Run: npx tsx test/test-reader.ts')
        process.exit(1)
    }

    // Create SDK instance
    console.log('📦 Creating SDK instance...')
    const sdk = new InvoSDK({
        apiToken: TEST_API_TOKEN
    })
    console.log(`  Environment: ${sdk.environment}`)
    console.log('')

    try {
        // Test: Read invoice from file
        console.log('📄 Test: Read Invoice from File')
        console.log('  Reading invoice file...')

        // Read file as buffer
        const fileBuffer = readFileSync(TEST_INVOICE_PATH)
        const fileExtension = TEST_INVOICE_PATH.split('.').pop() || 'pdf'
        const mimeType = fileExtension === 'xml' ? 'application/xml' : 'application/pdf'

        console.log(`  File size: ${fileBuffer.length} bytes`)
        console.log(`  File type: ${mimeType}`)

        // Create File object
        const file = new File([fileBuffer], `factura_test.${fileExtension}`, {
            type: mimeType,
        })

        console.log('  Sending file to reader endpoint...')
        const invoiceData = await sdk.read(file)

        console.log('  ✅ Invoice read successfully!')
        console.log('')
        console.log('📋 Parsed Invoice Data:')
        console.log(JSON.stringify(invoiceData, null, 2))
        console.log('')

        console.log('🎉 Reader test completed successfully!')
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
