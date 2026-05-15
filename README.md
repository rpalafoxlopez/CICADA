# CICADA 🟡

> *El ruido que no ves, la fiesta que no olvidas.*

CICADA es una PWA serverless donde los eventos cobran vida a través de miles de flashes simultáneos. Cada invitado es una cámara, cada foto es un pulso, y la galería es el zumbido colectivo que queda.

Las cigarras pasan años bajo tierra en silencio. Luego emergen — millones al mismo tiempo — y transforman el paisaje sonoro en algo irrepetible. Eso es un evento CICADA: **preparación silenciosa, explosión colectiva, eco permanente.**

---

## ¿Cómo funciona?

1. **Emerger** — El organizador crea un evento y obtiene un QR
2. **Zumbar** — Los invitados escanean el QR, acceden a la cámara y capturan fotos
3. **Resonar** — Las fotos aparecen en tiempo real en la galería estilo Polaroid con música de fondo
4. **Permanecer** — Al final, todo se descarga como ZIP. Cero backend propio, cero instalación.

```
[Organizador]        [Invitados]           [Galería]
     │                     │                    │
     ▼                     ▼                    ▼
  Crear evento ──QR──→ Escanear ──foto──→ Polaroid + música
  Subir música         Capturar             Slideshow sync
  Ver QR               Ver preview          Descargar ZIP
```

---

## Stack Técnico

| Capa | Tecnología |
|---|---|
| Framework | Vite + Vanilla JS |
| Backend/DB | Supabase (Auth + Postgres + Storage + Realtime) |
| Cámara | MediaDevices.getUserMedia() |
| Marcos Polaroid | CSS + Canvas API |
| Música | Web Audio API |
| QR | qrcode.js |
| Offline | Vite PWA Plugin + IndexedDB (idb) |

---

## Setup

### 1. Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ejecutar `supabase/migrations/001_init.sql` en el SQL Editor
3. Crear buckets públicos en Storage:
   - `photos` — fotos de eventos
   - `event-assets` — música de fondo
4. Copiar URL y Anon Key para el `.env.local`

### 2. Local

```bash
git clone <repo>
cd cicada
npm install
```

Copiar variables de entorno:
```bash
cp .env.example .env.local
# Editar con tus credenciales de Supabase
```

```bash
npm run dev
# Abrir http://localhost:5173
```

### 3. Deploy

```bash
npm run build
# Subir dist/ a Vercel, Netlify o GitHub Pages
```

> **Requisito:** HTTPS obligatorio para `getUserMedia()`. Localhost funciona para desarrollo.

---

## Estructura del Proyecto

```
cicada/
├── index.html
├── vite.config.js
├── package.json
├── .env.local
├── src/
│   ├── main.js              # SPA Router
│   ├── supabase.js          # Cliente singleton
│   ├── style.css            # Estilos globales + Polaroid
│   ├── pages/
│   │   ├── Login.js         # Magic link auth
│   │   ├── Dashboard.js     # Mis eventos
│   │   ├── CreateEvent.js   # Crear + QR
│   │   ├── Camera.js        # Captura + upload
│   │   └── Slideshow.js     # Galería Polaroid + música
│   ├── components/
│   │   ├── PolaroidFrame.js # Render DOM + Canvas
│   │   ├── QRDisplay.js     # Generador QR
│   │   └── AudioPlayer.js   # Web Audio controller
│   └── services/
│       ├── EventService.js  # CRUD eventos
│       ├── PhotoService.js  # Upload + URLs
│       └── RealtimeService.js # Suscripción live
└── supabase/
    └── migrations/
        └── 001_init.sql     # Schema + RLS
```

---

## Features

- ✅ Auth sin contraseñas (magic link)
- ✅ Captura de cámara front/back + flash (si el hardware lo soporta)
- ✅ Compresión automática a max 1920px
- ✅ Upload directo a Supabase Storage
- ✅ Galería en tiempo real vía Supabase Realtime
- ✅ Marcos Polaroid con rotación aleatoria y sombras
- ✅ Slideshow Ken Burns con transiciones suaves
- ✅ Música de fondo con fade in/out
- ✅ Descarga ZIP de todas las fotos
- ✅ PWA instalable, funciona offline
- ✅ Zero backend propio

---

## Limitaciones Conocidas

- `getUserMedia()` en iOS requiere Safari (Chrome/Firefox en iOS usan WebKit con restricciones)
- Autoplay de audio bloqueado hasta primera interacción del usuario
- IndexedDB se limpia si el usuario borra datos del navegador → export ZIP es crítico
- Fotos 12MP+ pueden causar OOM en gama baja → ya comprimimos a 1920px

---

## Licencia

MIT — Emergé, zumba, permanece.
