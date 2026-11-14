# Anime Tracker

Aplicación web para gestionar tu colección de anime: estados, capítulos vistos, calificaciones, estadísticas, calendario de emisión y notificaciones push.

- **Frontend:** React (Create React App), Firebase Auth, PWA con Service Worker.
- **Backend:** Node.js + Express, MySQL, Firebase Admin, Web Push.
- **Deploy:** frontend en GitHub Pages, backend en Render.

## Estructura

```
backend/   API Express + MySQL + scheduler de notificaciones
frontend/  SPA React + PWA
```

## Requisitos

- Node.js 20+
- MySQL 8+ (o Aiven)
- Proyecto de Firebase con Authentication habilitado
- Claves VAPID para Web Push

## Configuración local

### Backend

```bash
cd backend
npm install
cp .env.example .env
# completar DB_*, JWT_SECRET, FIREBASE_* y VAPID_*
npm run dev
```

Si no configurás Firebase Admin, el backend inicia igual y solo acepta JWT legacy.
En desarrollo podés poner el service account en `backend/firebase-service-account.json`
(está ignorado por git).

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# completar REACT_APP_API_URL y REACT_APP_FIREBASE_*
npm start
```

## Deploy

- **Backend (Render):** definir las variables de `backend/.env.example`. El endpoint
  `GET /ping` sirve para mantenerlo despierto con UptimeRobot.
  - Si el servicio usa la raíz del repo: build `npm install`, start `npm start`.
    El `postinstall` de la raíz instala las dependencias de `backend/`.
  - Si el servicio usa `backend/` como Root Directory: build `npm ci`, start `npm start`.
- **Frontend (GitHub Pages):** el workflow `.github/workflows/deploy.yml` compila y
  publica `frontend/build`. Requiere los secrets `REACT_APP_FIREBASE_*`.

## Importar animes en lote

La app tiene un botón **Importar lista** en el dashboard. Acepta:

- El archivo `imports/animes.json` (formato `{ "animes": [...] }`, ya incluye portadas de AniList).
- La lista original separada por tabs: `id, nombre, tipo, estado, rating, capítulos`.

Los animes que ya existen en la cuenta se omiten automáticamente. Si el JSON trae
`imagen_url`, la importación también actualiza la portada de los animes existentes.

## Seguridad

- No commitear `.env` ni `firebase-service-account.json`.
- El token de Firebase se renueva automáticamente con `onIdTokenChanged`.
- PIN de recuperación eliminado: la recuperación de contraseña usa Firebase.

## Scripts

Backend:

```bash
npm start       # producción
npm run dev     # nodemon
npm test        # sin tests por ahora
```

Frontend:

```bash
npm start
npm run build
npm run deploy  # gh-pages
```