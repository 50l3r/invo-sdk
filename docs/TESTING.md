# Testing Guide - INVO SDK

Esta guía te ayudará a probar el SDK para verificar que funciona correctamente.

## Configuración Rápida

### 1. Crear archivo de configuración

Crea un archivo `.env` en la raíz del proyecto con tu API token:

```bash
cp .env.example .env
```

Edita `.env` y configura tu API token:

```env
INVO_API_TOKEN=invo_tok_sand_tu_token_aqui
INVO_NAME=Tu Empresa SL
INVO_NIF=B12345678
```

**IMPORTANTE**: El archivo `.env` está en `.gitignore` y nunca se subirá a Git.

### 2. Obtener un API Token

Los API tokens se obtienen desde la plataforma web de INVO:
1. Accede a tu cuenta en [INVO](https://api.invo.rest)
2. Ve a la sección de API Tokens
3. Crea un nuevo token (production o sandbox)
4. Cópialo y guárdalo en tu `.env`

### 3. Ejecutar los tests

```bash
# Test de API token y creación de facturas
npx tsx test/test-api_key.ts

# Test de creación de facturas
npx tsx test/test-invoice.ts

# Test de lectura de facturas
npx tsx test/test-reader.ts

# Test de generación de PDF
npx tsx test/test-makeup.ts
```

## Qué prueban los scripts de test

### ✅ test-api_key.ts

**Pruebas de autenticación con API token:**

1. **Creación del SDK con API Token**
   - Crea instancia con `new InvoSDK({ apiToken })`
   - Verifica detección automática del ambiente

2. **Creación de Factura (Login Automático)**
   - Crea factura usando `sdk.store()`
   - Verifica que el login sea automático
   - Obtiene `invoiceId` y `chainIndex`

3. **Creación de Factura con Webhook**
   - Crea factura con callback URL
   - Verifica que el webhook se registre correctamente

4. **Gestión de Workspace**
   - Verifica que el workspace está determinado por el API token
   - Cada API token está asociado a un workspace específico

### ✅ test-invoice.ts

**Pruebas de creación de facturas:**

1. **Factura Simple**
   - Crea factura con un solo tipo de IVA (21%)
   - Verifica respuesta exitosa

2. **Estado de Autenticación**
   - Verifica `isAuthenticated()` después de primera llamada
   - Obtiene datos del usuario autenticado

3. **Factura con Múltiples IVAs**
   - Crea factura con 3 tipos de IVA (21%, 10%, 4%)
   - Verifica cálculos correctos

4. **Factura con Webhook**
   - Crea factura pasando callback URL como segundo parámetro
   - Verifica que se envíe correctamente

### ✅ test-reader.ts

**Pruebas de lectura de facturas:**

1. **Leer Factura desde PDF/XML**
   - Lee archivo de factura usando `sdk.read(file)`
   - Extrae datos de la factura
   - Muestra datos parseados

**Nota:** Necesitas un archivo de prueba en `test/factura_test.pdf` o especificar la ruta en `TEST_INVOICE_PATH`.

### ✅ test-makeup.ts

**Pruebas de generación de PDF:**

1. **Generar PDF con Branding**
   - Genera PDF usando `sdk.pdf(data)`
   - Aplica branding personalizado
   - Guarda PDF en `test-output-invoice.pdf`

## Salida Esperada

### test-api_key.ts
```
🚀 Starting INVO SDK API Token Authentication Tests

🔐 Test 1: Create SDK with API Token (automatic authentication)
  Creating SDK instance...
  ✅ SDK created successfully!
  Environment: production

📄 Test 2: Create Invoice with Token Authentication
  Creating invoice (login happens automatically)...
  ✅ Invoice created successfully!
  Invoice ID: 550e8400-e29b-41d4-a716-446655440001
  Chain Index: 0
  Is authenticated: ✅
  Current user: user@example.com

📞 Test 3: Create Invoice with Webhook Callback
  Webhook URL: https://example.com/webhooks/invoice-status
  ✅ Invoice with webhook created successfully!
  Invoice ID: 550e8400-e29b-41d4-a716-446655440002
  Chain Index: 1

🏢 Test 4: Workspace Management
  ✅ Workspace is automatically determined by the API token
  Each API token is associated with a specific workspace
  No need to specify workspace separately

🎉 All API Token authentication tests completed successfully!
```

### test-invoice.ts
```
🚀 Starting INVO SDK Invoice Tests

📦 Creating SDK instance...
  Environment: production

📄 Test 1: Create Simple Invoice
  ✅ Invoice created successfully!
  Invoice ID: 550e8400-e29b-41d4-a716-446655440001
  Chain Index: 0

🔍 Test 2: Authentication Status
  Is authenticated: ✅
  Current user: user@example.com
  Has access token: ✅

📄 Test 3: Create Invoice with Multiple Tax Rates
  ✅ Multi-tax invoice created successfully!
  Invoice ID: 550e8400-e29b-41d4-a716-446655440002
  Chain Index: 1

📄 Test 4: Create Invoice with Webhook
  ✅ Invoice with webhook created successfully!
  Invoice ID: 550e8400-e29b-41d4-a716-446655440003
  Webhook URL: https://example.com/webhooks/invoice-status

🎉 All tests completed successfully!
```

## Errores Comunes

### Error: "INVO_API_TOKEN environment variable is not set"
- Verifica que hayas creado el archivo `.env`
- Asegúrate de que el token esté correctamente configurado
- El token debe empezar con `invo_tok_prod_` o `invo_tok_sand_`

### Error: "Invalid or revoked token"
- El token fue revocado desde la plataforma INVO
- El token ha expirado
- Genera un nuevo token desde tu cuenta INVO

### Error: "Cannot find module"
- Ejecuta `npm install` para instalar dependencias
- Asegúrate de haber compilado el proyecto: `npm run build`

### Error: "Network request failed"
- Verifica tu conexión a internet
- Comprueba que la API esté disponible en el entorno configurado

### Error al crear factura
- Verifica que los datos de la factura sean válidos
- Asegúrate de que `emitterTaxId` y `customerTaxId` tengan formato de NIF/CIF español válido
- La fecha de la factura debe ser >= 2024-10-28

## Tests Personalizados

Puedes modificar los scripts de test para probar casos específicos:

### Probar factura con múltiples IVAs

```typescript
import { InvoSDK } from '@calltek/invo-sdk'

const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
})

const invoice = await sdk.store({
  issueDate: new Date().toISOString(),
  invoiceNumber: `TEST-${Date.now()}`,
  externalId: `test-${Date.now()}`,
  totalAmount: 1864.00,
  customerName: 'Cliente Test SL',
  customerTaxId: 'B12345678',
  emitterName: 'Empresa Test SL',
  emitterTaxId: 'B87654321',
  description: 'Factura con múltiples tipos de IVA',
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

console.log('Factura creada:', invoice.invoiceId)
```

### Probar factura con recargo de equivalencia

```typescript
const invoice = await sdk.store({
  issueDate: new Date().toISOString(),
  invoiceNumber: `TEST-SURCHARGE-${Date.now()}`,
  externalId: `surcharge-${Date.now()}`,
  totalAmount: 126.20,
  customerName: 'Cliente Test SL',
  customerTaxId: 'B12345678',
  emitterName: 'Empresa Test SL',
  emitterTaxId: 'B87654321',
  description: 'Factura con recargo de equivalencia',
  taxLines: [
    {
      taxRate: 21,
      baseAmount: 100.00,
      taxAmount: 21.00,
      surchargeRate: 5.2,
      surchargeAmount: 5.20
    }
  ]
})
```

### Probar lectura de factura desde archivo

```typescript
import { InvoSDK } from '@calltek/invo-sdk'
import fs from 'fs'

const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
})

// Leer factura desde PDF
const fileBuffer = fs.readFileSync('path/to/invoice.pdf')
const file = new File([fileBuffer], 'invoice.pdf', {
  type: 'application/pdf'
})

const invoiceData = await sdk.read(file)
console.log('Datos de la factura:', invoiceData)
```

### Probar generación de PDF

```typescript
import { InvoSDK } from '@calltek/invo-sdk'
import fs from 'fs'

const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
})

const pdfBuffer = await sdk.pdf({
  id: 'TEST-001',
  date: '2024-01-15',
  branding: {
    logo: 'https://example.com/logo.png',
    favicon: 'https://example.com/favicon.ico',
    accent_color: '#0066cc',
    foreground_color: '#ffffff'
  },
  client: {
    name: 'Cliente Test',
    cif: '12345678A',
    address: 'Calle Test 123',
    phone: '+34 666 123 123',
    email: 'test@example.com'
  },
  business: {
    name: 'Empresa Test SL',
    cif: 'B87654321',
    address: 'Avenida Test 456',
    phone: '+34 911 123 123',
    email: 'empresa@example.com'
  },
  total: 1210,
  subtotal: 1000,
  tax_value: 210,
  tax_percent: 21,
  surcharge_value: 0,
  surcharge_percent: 0,
  observations: 'Gracias por su compra',
  payment_instructions: 'Transferencia a ES00 0000 0000 0000 0000 0000',
  RGPD: 'Datos protegidos según RGPD',
  type: 'invoice',
  template: 'classic',
  concepts: []
})

// Guardar el PDF generado
fs.writeFileSync('test-invoice.pdf', Buffer.from(pdfBuffer))
console.log('PDF generado: test-invoice.pdf')
```

### Probar factura con webhook

```typescript
import { InvoSDK } from '@calltek/invo-sdk'

const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
})

// El webhook se pasa como segundo parámetro
const invoice = await sdk.store({
  issueDate: new Date().toISOString(),
  invoiceNumber: `TEST-${Date.now()}`,
  externalId: `test-${Date.now()}`,
  totalAmount: 1210.00,
  customerName: 'Cliente Test SL',
  customerTaxId: 'B12345678',
  emitterName: 'Empresa Test SL',
  emitterTaxId: 'B87654321',
  taxLines: [{
    taxRate: 21,
    baseAmount: 1000.00,
    taxAmount: 210.00
  }]
}, 'https://myapp.com/webhooks/invoice-status')

console.log('Factura creada:', invoice.invoiceId)
console.log('Webhook registrado para recibir actualizaciones de estado')
```

### Probar multi-tenant con diferentes API tokens

```typescript
import { InvoSDK } from '@calltek/invo-sdk'

// Cliente 1 - Cada API token ya está asociado a un workspace
const sdk1 = new InvoSDK({
  apiToken: process.env.CLIENT1_API_TOKEN!
})

// Cliente 2 - Token diferente para workspace diferente
const sdk2 = new InvoSDK({
  apiToken: process.env.CLIENT2_API_TOKEN!
})

// Cada uno opera de forma independiente con su propio workspace
const invoice1 = await sdk1.store({...})
const invoice2 = await sdk2.store({...})
```

## Testing en CI/CD

Para ejecutar tests en un pipeline CI/CD, configura las variables de entorno:

```bash
export INVO_API_TOKEN="invo_tok_sand_tu_token"
export INVO_NAME="Test Company SL"
export INVO_NIF="B12345678"

npx tsx test/test-invoice.ts
```

### GitHub Actions Example

```yaml
name: Test INVO SDK

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - name: Run tests
        env:
          INVO_API_TOKEN: ${{ secrets.INVO_API_TOKEN }}
          INVO_NAME: ${{ secrets.INVO_NAME }}
          INVO_NIF: ${{ secrets.INVO_NIF }}
        run: npx tsx test/test-invoice.ts
```

## Notas de Seguridad

- **NUNCA** subas el archivo `.env` a Git
- **NUNCA** compartas tus API tokens en issues o pull requests
- **NUNCA** hagas commit de tokens en el código
- En producción, usa variables de entorno del sistema o un gestor de secretos
- Rota tus tokens regularmente
- Revoca tokens comprometidos inmediatamente desde la plataforma INVO

## Estructura de Tests

```
test/
├── test-api_key.ts    # Tests de autenticación con API token
├── test-invoice.ts    # Tests de creación de facturas
├── test-reader.ts     # Tests de lectura de facturas
└── test-makeup.ts     # Tests de generación de PDFs
```

## API Methods Reference

### Métodos Principales

- `sdk.store(data, callback?)` - Crear factura (antes `createInvoice`)
- `sdk.read(file)` - Leer factura desde archivo (antes `readInvoice`)
- `sdk.pdf(data)` - Generar PDF personalizado (antes `makeupInvoice`)
- `sdk.request(endpoint, method, body)` - Request genérico

### Métodos de Utilidad

- `sdk.getAccessToken()` - Obtener token de acceso
- `sdk.getUser()` - Obtener usuario autenticado
- `sdk.isAuthenticated()` - Verificar autenticación

### Propiedades

- `sdk.environment` - Ambiente actual (read-only)

## Soporte

Si encuentras problemas durante las pruebas, abre un issue en [GitHub](https://github.com/calltek/invo-sdk/issues).
