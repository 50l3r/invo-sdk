# API Token Authentication

## ¿Qué son los API Tokens?

Los API Tokens son credenciales de autenticación que permiten acceder a tu cuenta INVO de forma segura. Son la **única forma de autenticación** soportada por el SDK, ideal para integraciones, aplicaciones backend y sistemas automatizados.

## Ventajas

✅ **Seguridad**: Autenticación sin credenciales de usuario
✅ **Simplicidad**: Login automático, sin pasos adicionales
✅ **Ideal para Integraciones**: Perfecto para APIs y automatizaciones
✅ **Multi-entorno**: Tokens específicos para production y sandbox
✅ **Sin gestión de sesiones**: No hay tokens de refresco ni expiración manual

## Uso Básico

### Inicialización Simple

```typescript
import { InvoSDK } from '@calltek/invo-sdk'

// El environment se detecta automáticamente del prefijo:
//   - invo_tok_prod_* → production
//   - invo_tok_sand_* → sandbox
const sdk = new InvoSDK({
  apiToken: 'invo_tok_prod_abc123...'
})

// ¡Listo! El login es automático en la primera llamada
const invoice = await sdk.store({
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

console.log('Factura creada:', invoice.invoiceId)
```

**Nota:** El workspace está determinado automáticamente por el API token. Cada token está asociado a un workspace específico.

### Con Webhook para Recibir Estado

```typescript
const sdk = new InvoSDK({
  apiToken: 'invo_tok_prod_abc123...'
})

// Pasar callback URL al crear la factura
const invoice = await sdk.store({
  // ... datos de la factura
}, 'https://miapp.com/webhooks/invo')

// Tu webhook recibirá actualizaciones cuando Hacienda procese la factura
```

## Casos de Uso

### 1. Aplicación Backend

```typescript
// server.ts
import express from 'express'
import { InvoSDK } from '@calltek/invo-sdk'

const app = express()
app.use(express.json())

// Inicializar SDK con token desde variables de entorno
const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
})

// Endpoint para crear facturas
app.post('/api/invoices', async (req, res) => {
  try {
    const result = await sdk.store(req.body)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

### 2. Integración con Webhooks

```typescript
import { InvoSDK } from '@calltek/invo-sdk'

const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
})

export async function handleWebhook(req: Request) {
  // Crear factura y recibir estado en otro webhook
  const invoice = await sdk.store(
    req.body,
    'https://miapp.com/webhooks/invoice-status'
  )

  return new Response(JSON.stringify(invoice), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### 3. Script de Automatización

```typescript
import { InvoSDK } from '@calltek/invo-sdk'

const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
})

async function processInvoices() {
  // Procesar múltiples facturas
  for (const invoiceData of invoicesToProcess) {
    try {
      const result = await sdk.store(invoiceData)
      console.log(`✅ Factura creada: ${result.invoiceId}`)
    } catch (error) {
      console.error(`❌ Error: ${error.message}`)
    }
  }
}

processInvoices()
```

### 4. Multi-tenant con Workspaces

```typescript
import { InvoSDK } from '@calltek/invo-sdk'

// Cliente 1 - Cada API token ya está asociado a un workspace
const sdk1 = new InvoSDK({
  apiToken: 'invo_tok_prod_client1...'
})

// Cliente 2 - Token diferente para workspace diferente
const sdk2 = new InvoSDK({
  apiToken: 'invo_tok_prod_client2...'
})

// Cada uno usa su propio workspace automáticamente (determinado por el token)
await sdk1.store({...})
await sdk2.store({...})
```

## Seguridad

### Almacenamiento Seguro

**✅ Correcto:**
```bash
# .env
INVO_API_TOKEN=invo_tok_prod_abc123xyz...
```

```typescript
// Usar desde variables de entorno
const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
})
```

**❌ Incorrecto:**
```typescript
// NUNCA hagas esto
const sdk = new InvoSDK({
  apiToken: 'invo_tok_prod_abc123xyz...' // Token hardcoded
})
```

### Buenas Prácticas

1. **Nunca** compartas tokens en código público
2. **Nunca** incluyas tokens en logs
3. **Siempre** usa variables de entorno
4. **Almacena** tokens de forma segura (gestores de secretos, .env)
5. **Solicita** nuevos tokens si sospechas de compromiso

### Formato del Token

Los tokens tienen el formato:
```
invo_tok_{environment}_{random}

Ejemplos:
- invo_tok_prod_abc123...  (producción)
- invo_tok_sand_xyz789...  (sandbox)
```

El SDK detecta automáticamente el entorno según el prefijo del token.

## Gestión de Tokens

**Importante:** La gestión de tokens (creación, listado, revocación) se realiza a través de la plataforma web de INVO, no mediante este SDK.

Para obtener un token:
1. Accede a tu cuenta en [INVO](https://api.invo.rest)
2. Ve a la sección de API Tokens
3. Crea un nuevo token
4. Guárdalo de forma segura (solo se muestra una vez)

## Métodos del SDK

### Facturas

```typescript
// Crear factura
const invoice = await sdk.store(data, callback?)

// Leer factura desde archivo
const parsed = await sdk.read(file)

// Generar PDF personalizado
const pdfBuffer = await sdk.pdf(data)
```

### Utilidades

```typescript
// Obtener token de acceso actual
const token = sdk.getAccessToken()

// Obtener usuario autenticado
const user = sdk.getUser()

// Verificar autenticación
const authenticated = sdk.isAuthenticated()

// Request genérico a cualquier endpoint
const data = await sdk.request('/endpoint', 'GET')
```

### Propiedades

```typescript
// Ambiente actual
console.log(sdk.environment) // 'production' | 'sandbox'
```

## Troubleshooting

### Error: "Invalid token format"
- Verifica que el token empiece con `invo_tok_`
- No modifiques el token al copiarlo

### Error: "Invalid or revoked token"
- El token fue revocado
- El token ha expirado
- Solicita un nuevo token desde la plataforma INVO

### Error: "Token expired"
- El token llegó a su fecha de expiración
- Solicita un nuevo token desde la plataforma INVO

## Diferencias con Versiones Anteriores

### ❌ Ya No Disponible

```typescript
// Ya NO soportado
const sdk = createInvoSDK({ email, password })
await sdk.login()
await sdk.logout()
await sdk.refreshAccessToken()
sdk.setEnvironment('production')
```

### ✅ Nueva API

```typescript
// Forma correcta ahora
const sdk = new InvoSDK({ apiToken })

// Login automático en primera llamada
await sdk.store({...})
```

## FAQ

**¿Dónde obtengo un token?**
Desde tu cuenta en la plataforma web de INVO.

**¿Los tokens expiran?**
Depende de la configuración al crearlos en la plataforma INVO.

**¿Puedo ver el token después de crearlo?**
No, solo se muestra una vez al crearlo. Guárdalo de forma segura.

**¿Qué hago si pierdo mi token?**
Revoca el token antiguo y crea uno nuevo desde la plataforma INVO.

**¿Los tokens tienen permisos diferentes al usuario?**
No, tienen los mismos permisos que el usuario propietario.

**¿Necesito llamar a login()?**
No, el login es automático en la primera llamada a la API.

**¿Puedo cambiar de ambiente después de crear el SDK?**
No, el ambiente se establece al crear la instancia. Crea una nueva instancia si necesitas otro ambiente.

## Soporte

Si encuentras problemas, abre un issue en [GitHub](https://github.com/calltek/invo-sdk/issues).
