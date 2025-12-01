# Usage Examples

## Basic Setup

### TypeScript / ES Modules

```typescript
import { InvoSDK } from '@calltek/invo-sdk'

const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
  // environment is auto-detected from token prefix
  // workspace is automatically determined by the API token
})

// No need to call login() - it's automatic!
```

### JavaScript (CommonJS)

```javascript
const { InvoSDK } = require('@calltek/invo-sdk')

const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN
})
```

## Creating Invoices

### Simple Invoice

```typescript
import { InvoSDK } from '@calltek/invo-sdk'

const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
})

const result = await sdk.store({
  issueDate: new Date().toISOString(),
  invoiceNumber: 'FAC-2024-001',
  externalId: 'order-12345',
  totalAmount: 1210.00,
  customerName: 'Cliente SL',
  customerTaxId: 'B12345678',
  emitterName: 'Mi Empresa SL',
  emitterTaxId: 'B87654321',
  description: 'Servicios de consultoría',
  taxLines: [{
    taxRate: 21,
    baseAmount: 1000.00,
    taxAmount: 210.00
  }]
})

console.log('Invoice created:', result.invoiceId)
```

### Invoice with Webhook Callback

```typescript
// Create invoice and receive status updates via webhook
const result = await sdk.store({
  issueDate: new Date().toISOString(),
  invoiceNumber: 'FAC-2024-001',
  externalId: 'order-12345',
  totalAmount: 1210.00,
  customerName: 'Cliente SL',
  customerTaxId: 'B12345678',
  emitterName: 'Mi Empresa SL',
  emitterTaxId: 'B87654321',
  taxLines: [{
    taxRate: 21,
    baseAmount: 1000.00,
    taxAmount: 210.00
  }]
}, 'https://myapp.com/webhooks/invoice-status')

console.log('Invoice created:', result.invoiceId)
// Your webhook will receive updates when the invoice is processed by tax authorities
```

### Invoice with Multiple Tax Rates

```typescript
const result = await sdk.store({
  issueDate: new Date().toISOString(),
  invoiceNumber: 'FAC-2024-002',
  externalId: 'multi-tax-001',
  totalAmount: 1864.00,
  customerName: 'Cliente SL',
  customerTaxId: 'B12345678',
  emitterName: 'Mi Empresa SL',
  emitterTaxId: 'B87654321',
  description: 'Venta mixta de productos',
  taxLines: [
    {
      taxRate: 21,
      baseAmount: 1000.00,
      taxAmount: 210.00
    },
    {
      taxRate: 10,
      baseAmount: 500.00,
      taxAmount: 50.00
    },
    {
      taxRate: 4,
      baseAmount: 100.00,
      taxAmount: 4.00
    }
  ]
})
```

## Reading Invoices from Files

### Read PDF Invoice

```typescript
import { InvoSDK } from '@calltek/invo-sdk'
import fs from 'fs'

const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
})

// Read invoice from PDF
const fileBuffer = fs.readFileSync('invoice.pdf')
const file = new File([fileBuffer], 'invoice.pdf', { type: 'application/pdf' })

const invoiceData = await sdk.read(file)
console.log('Parsed invoice data:', invoiceData)
```

### Read XML Invoice

```typescript
const xmlBuffer = fs.readFileSync('invoice.xml')
const xmlFile = new File([xmlBuffer], 'invoice.xml', { type: 'application/xml' })

const invoiceData = await sdk.read(xmlFile)
console.log('Parsed invoice:', invoiceData)
```

## Generating PDF Invoices

### Generate PDF with Custom Branding

```typescript
import { InvoSDK } from '@calltek/invo-sdk'
import fs from 'fs'

const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
})

const pdfBuffer = await sdk.pdf({
  id: 'INV-2024-001',
  date: '2024-01-15',
  branding: {
    logo: 'https://example.com/logo.png',
    favicon: 'https://example.com/favicon.ico',
    accent_color: '#0066cc',
    foreground_color: '#ffffff'
  },
  client: {
    name: 'John Doe',
    cif: '12345678A',
    address: 'Calle Ejemplo 123, Madrid',
    phone: '+34 666 123 123',
    email: 'john@example.com'
  },
  business: {
    name: 'Business SL',
    cif: 'B12345678',
    address: 'Avenida Principal 456, Madrid',
    phone: '+34 911 123 123',
    email: 'business@example.com'
  },
  total: 1210,
  subtotal: 1000,
  tax_value: 210,
  tax_percent: 21,
  surcharge_value: 0,
  surcharge_percent: 0,
  observations: 'Gracias por su compra!',
  payment_instructions: 'Transferencia bancaria a ES00 0000 0000 0000 0000 0000',
  RGPD: 'Sus datos están protegidos según RGPD.',
  type: 'invoice',
  template: 'classic',
  concepts: []
})

// Save PDF to file
fs.writeFileSync('generated-invoice.pdf', Buffer.from(pdfBuffer))
console.log('PDF generado exitosamente!')
```

### Generate Budget PDF

```typescript
const pdfBuffer = await sdk.pdf({
  id: 'PRES-2024-001',
  date: '2024-01-15',
  type: 'budget', // Changed to budget
  branding: { /* ... */ },
  client: { /* ... */ },
  business: { /* ... */ },
  total: 1210,
  subtotal: 1000,
  tax_value: 210,
  tax_percent: 21,
  surcharge_value: 0,
  surcharge_percent: 0,
  observations: '',
  payment_instructions: '',
  RGPD: '',
  template: 'classic',
  concepts: []
})

fs.writeFileSync('budget.pdf', Buffer.from(pdfBuffer))
```

## Node.js / Express Integration

### Express API Server

```typescript
import express from 'express'
import { InvoSDK } from '@calltek/invo-sdk'

const app = express()
app.use(express.json())

// Initialize SDK (login is automatic on first request)
const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!,
  onError: (error) => {
    console.error('SDK Error:', error)
  }
})

// Create invoice endpoint
app.post('/api/invoices', async (req, res) => {
  try {
    const result = await sdk.store(req.body, req.body.callback)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Read invoice endpoint
app.post('/api/invoices/read', async (req, res) => {
  try {
    const file = req.file // Using multer or similar
    const invoiceData = await sdk.read(file)
    res.json(invoiceData)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Generate PDF endpoint
app.post('/api/invoices/pdf', async (req, res) => {
  try {
    const pdfBuffer = await sdk.pdf(req.body)
    res.setHeader('Content-Type', 'application/pdf')
    res.send(Buffer.from(pdfBuffer))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

### NestJS Service

```typescript
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InvoSDK } from '@calltek/invo-sdk'

@Injectable()
export class InvoiceService {
  private sdk: InvoSDK

  constructor(private configService: ConfigService) {
    this.sdk = new InvoSDK({
      apiToken: this.configService.get('INVO_API_TOKEN')!
    })
  }

  async createInvoice(data: CreateInvoiceDto, callback?: string) {
    return this.sdk.store(data, callback)
  }

  async readInvoice(file: File) {
    return this.sdk.read(file)
  }

  async generatePDF(data: MakeupPDFDto) {
    return this.sdk.pdf(data)
  }
}
```

## Multi-tenant with Different API Tokens

```typescript
import { InvoSDK } from '@calltek/invo-sdk'

// Tenant 1 - Each API token is already associated with a workspace
const tenant1SDK = new InvoSDK({
  apiToken: process.env.TENANT1_API_TOKEN!
})

// Tenant 2 - Different API token for different workspace
const tenant2SDK = new InvoSDK({
  apiToken: process.env.TENANT2_API_TOKEN!
})

// Each tenant operates independently with its own workspace
await tenant1SDK.store({...})
await tenant2SDK.store({...})
```

## Error Handling

```typescript
import {
  InvalidCredentialsError,
  TokenExpiredError,
  NetworkError,
  AuthError
} from '@calltek/invo-sdk'

const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!,
  onError: (error) => {
    // Global error handler
    console.error('SDK Error:', error)
  }
})

try {
  const result = await sdk.store({...})
} catch (error) {
  if (error instanceof InvalidCredentialsError) {
    console.error('Invalid API token')
  } else if (error instanceof TokenExpiredError) {
    console.error('Token expired - please get a new one')
  } else if (error instanceof NetworkError) {
    console.error('Network error, check your connection')
  } else if (error instanceof AuthError) {
    console.error('Authentication error:', error.message)
  } else {
    console.error('Unexpected error:', error)
  }
}
```

## Webhooks Integration

### Receive Invoice Status Updates

```typescript
import express from 'express'
import { InvoSDK } from '@calltek/invo-sdk'

const app = express()
app.use(express.json())

const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
})

// Create invoice with webhook
app.post('/api/invoices/create', async (req, res) => {
  const webhookUrl = `${req.protocol}://${req.get('host')}/webhooks/invoice-status`

  const result = await sdk.store(req.body, webhookUrl)
  res.json(result)
})

// Receive webhook notifications
app.post('/webhooks/invoice-status', (req, res) => {
  const { invoiceId, status, data } = req.body

  console.log(`Invoice ${invoiceId} status: ${status}`)

  // Update your database, send notifications, etc.
  // Status can be: PENDING, SENT, ACCEPTED, REJECTED, etc.

  res.status(200).json({ received: true })
})

app.listen(3000)
```

## Testing

### Mock SDK for Tests

```typescript
// __mocks__/@calltek/invo-sdk.ts
export const InvoSDK = jest.fn().mockImplementation(() => ({
  store: jest.fn().mockResolvedValue({
    success: true,
    invoiceId: 'uuid-123',
    chainIndex: 0
  }),
  read: jest.fn().mockResolvedValue({
    invoiceNumber: 'FAC-001',
    totalAmount: 1210
  }),
  pdf: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
  getAccessToken: jest.fn().mockReturnValue('mock-token'),
  getUser: jest.fn().mockReturnValue({
    id: '1',
    email: 'test@example.com',
    role: 'client'
  }),
  isAuthenticated: jest.fn().mockReturnValue(true),
  request: jest.fn().mockResolvedValue({}),
  environment: 'sandbox'
}))
```

### Test Example

```typescript
import { InvoSDK } from '@calltek/invo-sdk'

jest.mock('@calltek/invo-sdk')

describe('Invoice Creation', () => {
  it('should create invoice successfully', async () => {
    const sdk = new InvoSDK({
      apiToken: 'invo_tok_sand_test123'
    })

    const result = await sdk.store({
      issueDate: new Date().toISOString(),
      invoiceNumber: 'FAC-001',
      externalId: 'test-001',
      totalAmount: 1210,
      customerName: 'Test Client',
      customerTaxId: 'B12345678',
      emitterName: 'Test Business',
      emitterTaxId: 'B87654321',
      taxLines: [{
        taxRate: 21,
        baseAmount: 1000,
        taxAmount: 210
      }]
    })

    expect(result.success).toBe(true)
    expect(result.invoiceId).toBe('uuid-123')
  })

  it('should create invoice with webhook', async () => {
    const sdk = new InvoSDK({
      apiToken: 'invo_tok_sand_test123'
    })

    const result = await sdk.store(
      {
        issueDate: new Date().toISOString(),
        invoiceNumber: 'FAC-001',
        externalId: 'test-001',
        totalAmount: 1210,
        customerName: 'Test Client',
        customerTaxId: 'B12345678',
        emitterName: 'Test Business',
        emitterTaxId: 'B87654321',
        taxLines: [{
          taxRate: 21,
          baseAmount: 1000,
          taxAmount: 210
        }]
      },
      'https://myapp.com/webhooks/test'
    )

    expect(sdk.store).toHaveBeenCalledWith(
      expect.any(Object),
      'https://myapp.com/webhooks/test'
    )
  })
})
```

## Advanced Usage

### Batch Processing

```typescript
import { InvoSDK } from '@calltek/invo-sdk'

const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
})

async function processInvoiceBatch(invoices: CreateInvoiceDto[]) {
  const results = []

  for (const invoice of invoices) {
    try {
      const result = await sdk.store(invoice)
      results.push({ success: true, ...result })
    } catch (error) {
      results.push({
        success: false,
        error: error.message,
        invoiceNumber: invoice.invoiceNumber
      })
    }
  }

  return results
}

// Usage
const invoices = [/* ... array of invoice data ... */]
const results = await processInvoiceBatch(invoices)
console.log(`Processed ${results.length} invoices`)
```

### Generic API Requests

```typescript
// Make custom requests to any endpoint
const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
})

// GET request
const data = await sdk.request('/some/endpoint', 'GET')

// POST request
const result = await sdk.request('/another/endpoint', 'POST', {
  some: 'data'
})
```

## TypeScript Types

```typescript
import {
  InvoSDK,
  CreateInvoiceDto,
  CreateInvoiceResult,
  InvoiceReaderResult,
  MakeupPDFDto,
  InvoiceTaxLineDto,
  UserDto
} from '@calltek/invo-sdk'

const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
})

// Type-safe invoice creation
const invoice: CreateInvoiceDto = {
  issueDate: new Date().toISOString(),
  invoiceNumber: 'FAC-001',
  externalId: 'order-123',
  totalAmount: 1210,
  customerName: 'Cliente SL',
  customerTaxId: 'B12345678',
  emitterName: 'Mi Empresa SL',
  emitterTaxId: 'B87654321',
  taxLines: [{
    taxRate: 21,
    baseAmount: 1000,
    taxAmount: 210
  }]
}

const result: CreateInvoiceResult = await sdk.store(invoice)
const user: UserDto | null = sdk.getUser()
```
