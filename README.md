# ebook-ia-landing-api

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

Edita el `.env` con tus credenciales:

```env
NODE_ENV=development
PORT=3001

# Configuración SMTP
EMAIL_HOST=mail.tudominio.cl
EMAIL_PORT=587
EMAIL_USER=tu@email.com
EMAIL_PASS=tu_password

# Link del libro en Amazon
AMAZON_LINK=https://amazon.com/tu-libro

# Token para autenticación de la API
API_TOKEN=tu-token-seguro

# Configuración de rate limit
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=3

# Orígenes CORS permitidos
CORS_ORIGINS=http://localhost:5173,https://tu-dominio.cl
```

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

### POST /api/subscribe
Suscribe un email y envía el primer capítulo.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Email agregado a la cola de envío"
}
```

### GET /api/health
Verifica que el servidor esté corriendo.

## Estructura del proyecto

```
src/
├── main.ts              # Punto de entrada
├── app.module.ts        # Módulo principal
├── email/
│   └── email.service.ts # Servicio de envío de emails
└── img/                 # Imágenes para emails
    ├── perfil.png
    └── lectora_nueva.png
email_template.html      # Plantilla del email
dist/                    # Archivos compilados
```

## Licencia

MIT
