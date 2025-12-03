/**
 * Test script for INVO SDK - Makeup Endpoint
 *
 * Tests the pdf method that generates PDF invoices with custom branding
 *
 * Usage:
 * npx tsx test/test-makeup.ts
 */

import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync } from 'fs'
import { InvoSDK } from '../src/sdk'
import type { MakeupPDFDto } from '../src/types'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env file in project root
config({ path: resolve(__dirname, '../.env') })

// Configuration
const TEST_API_TOKEN = process.env.INVO_API_TOKEN || 'your-api-token-here'
const TEST_NAME = process.env.INVO_NAME || 'Test Company SL'
const TEST_NIF = process.env.INVO_NIF || 'B12345678'

// Output path for generated PDF
const OUTPUT_PDF_PATH = resolve(__dirname, '../test-output-invoice.pdf')

async function main() {
    console.log('🚀 Starting INVO SDK Makeup Tests\n')

    if (!TEST_API_TOKEN || TEST_API_TOKEN === 'your-api-token-here') {
        console.error('❌ Error: INVO_API_TOKEN environment variable is not set')
        console.error('   Please add INVO_API_TOKEN to your .env file')
        process.exit(1)
    }

    console.log('Configuration:')
    console.log(`  Output PDF Path: ${OUTPUT_PDF_PATH}`)
    console.log('')

    // Create SDK instance
    console.log('📦 Creating SDK instance...')
    const sdk = new InvoSDK({
        apiToken: TEST_API_TOKEN
    })
    console.log(`  Environment: ${sdk.environment}`)
    console.log('')

    try {
        // Test: Generate PDF invoice
        console.log('📄 Test: Generate PDF Invoice')
        console.log('  Preparing invoice data...')

        const makeupData: MakeupPDFDto = {
            id: `TEST-MAKEUP-${Date.now()}`,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
            branding: {
                logo: 'https://via.placeholder.com/150',
                favicon: 'https://via.placeholder.com/32',
                accent_color: '#0066cc',
                foreground_color: '#ffffff',
            },
            client: {
                name: 'John Doe',
                cif: '12345678A',
                address: 'Calle Ejemplo 123, Madrid, España',
                phone: '+34 666 123 123',
                email: 'john@example.com',
            },
            business: {
                name: TEST_NAME,
                cif: TEST_NIF,
                address: 'Avenida Principal 456, Madrid, España',
                phone: '+34 911 123 123',
                email: 'business@example.com',
            },
            total: 1210,
            subtotal: 1000,
            tax_value: 210,
            tax_percent: 21,
            surcharge_value: 0,
            surcharge_percent: 0,
            observations: 'Gracias por su compra. Esperamos verle pronto de nuevo.',
            payment_instructions: 'Transferencia bancaria a: ES00 0000 0000 0000 0000 0000',
            RGPD: 'Sus datos personales están protegidos según el Reglamento General de Protección de Datos (RGPD).',
            type: 'invoice',
            template: 'classic',
            concepts: [
                {
                    name: 'Servicio de consultoría',
                    quantity: 5,
                    price: 100,
                    subtotal: 500,
                    total: 500,
                    discount_value: 0,
                    discount_percent: 0
                },

                    {
                    name: 'Servicio de desarrollo web',
                    quantity: 1,
                    price: 1200,
                    subtotal: 1200,
                    total: 1100,
                    discount_value: 100,
                    discount_percent: 0
                },
            ],
        }

        console.log('  Generating PDF...')
        const pdfBuffer = await sdk.pdf(makeupData)

        console.log('  ✅ PDF generated successfully!')
        console.log(`  PDF size: ${pdfBuffer.byteLength} bytes`)

        // Save PDF to file
        console.log(`  Saving PDF to: ${OUTPUT_PDF_PATH}`)
        writeFileSync(OUTPUT_PDF_PATH, Buffer.from(pdfBuffer))
        console.log('  ✅ PDF saved successfully!')
        console.log('')

        console.log('🎉 Makeup test completed successfully!')
        console.log(`📁 You can open the PDF at: ${OUTPUT_PDF_PATH}`)
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
