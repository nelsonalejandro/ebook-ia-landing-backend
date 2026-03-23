# ebook-ia-landing-backend

Backend API para la landing page del libro "Prompt Engineering".

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

## Configuración

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

### Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `NODE_ENV` | Entorno de ejecución | `development` |
| `PORT` | Puerto del servidor | `3001` |
| `EMAIL_HOST` | Servidor SMTP | - |
| `EMAIL_PORT` | Puerto SMTP | `587` |
| `EMAIL_USER` | Usuario SMTP | - |
| `EMAIL_PASS` | Contraseña SMTP | - |
| `API_TOKEN` | Token para autenticar requests del frontend | - |
| `RATE_LIMIT_WINDOW_MS` | Ventana de tiempo para rate limit (ms) | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Máximo de requests por ventana | `3` |
| `CORS_ENABLED` | Habilitar/deshabilitar CORS (`true`/`false`) | `true` |
| `CORS_ORIGINS` | Orígenes permitidos separados por coma | - |

## Imágenes del email

Para que las imágenes aparezcan correctamente en los emails enviados, necesitas copiar las imágenes a la carpeta `src/img/`:

```bash
mkdir -p src/img
cp ../ebook-ia-landing/public/assets/nelson_author.png src/img/perfil.png
cp ../ebook-ia-landing/public/assets/lectora_nueva.png src/img/
```

## Uso

### Desarrollo
```bash
npm run start:dev
```

### Producción
```bash
npm run build
npm run start:prod
```

## Endpoints API

### POST /api/send-email
Envía el primer capítulo al email del suscriptor.

**Headers:**
```
Content-Type: application/json
x-api-token: tu-token
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "amazonLink": "https://amazon.com/tu-libro",
  "price": 9.99
}
```

**Respuesta exitosa:**
```json
{
  "ok": true,
  "queued": true
}
```

### GET /api/health
Verifica que el servidor esté corriendo.

## Estructura del proyecto

```
src/
├── main.ts
├── app.module.ts
├── email/
│   ├── email.controller.ts
│   ├── email.service.ts
│   └── dto/send-email.dto.ts
├── common/guards/
│   ├── api-auth.guard.ts
│   └── rate-limit.guard.ts
└── img/
    ├── perfil.png
    └── lectora_nueva.png
email_template.html
dist/
```

## Licencia

MIT
