# 💝 LoveLink Builder

A full-stack web application that lets you create beautiful, personalised **romantic surprise websites** for your partner. Combine a love letter, photo memories, a personalised music soundtrack, and a printable certificate into a single shareable link.

---

## Features

- **9-step creation wizard** — guided flow covering partner details, cover photo, love letter, reasons you love them, a photo memory gallery, a music track, and a printable love certificate
- **AI-assisted love letters** — uses Google Gemini to help craft personalised messages
- **Photo uploads** — upload cover images and up to 15 memory photos (stored on Cloudinary)
- **Background music** — choose from preset romantic tracks or upload your own audio file
- **Printable love certificate** — downloadable PDF certificate (Girlfriend / Boyfriend / Best Friend / Husband / Wife themes)
- **Shareable surprise page** — each creation gets a unique public URL (`/s/<id>`) with optional view-token protection
- **QR code generation** — share via QR code directly from the app
- **Confetti & animations** — Framer Motion transitions and canvas-confetti on the recipient view
- **Google Sign-In** — Google OAuth via the GIS token flow; JWT session tokens
- **User dashboard** — manage, edit, and delete all your surprise creations
- **Admin panel** — site settings, user management, template management, and maintenance mode
- **Auto-save draft** — the wizard saves progress to `localStorage` so work is never lost
- **Persistent storage** — data is written to a `data.json` file on a mounted disk (production) or locally (dev)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Framer Motion |
| Backend | Node.js, Express 4, TypeScript (`tsx` for dev, `esbuild` for prod) |
| AI | Google Gemini (`@google/genai`) |
| Auth | Google Identity Services (GIS), JWT (`jsonwebtoken`) |
| Media | Cloudinary (photos + audio) |
| PDF | jsPDF + html2canvas |
| QR Code | `qrcode` |
| Build | Vite 6 |
| Deploy | Render (Node web service + 1 GB persistent disk) |

---

## Project Structure

```
lovelink-builder/
├── server.ts              # Express API server (auth, surprises, admin endpoints)
├── vite.config.ts         # Vite + React + Tailwind build config
├── render.yaml            # Render deployment config (web service + disk)
├── src/
│   ├── App.tsx            # Client-side router & auth guard
│   ├── api.ts             # Typed fetch helpers for every API route
│   ├── types.ts           # Shared TypeScript interfaces
│   ├── presets.ts         # Preset music tracks, story templates, sample data
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx          # Marketing / hero page
│   │   ├── CreateSurpriseWizard.tsx # 9-step creation wizard
│   │   ├── WizardPage.tsx           # Wizard wrapper (create / edit mode)
│   │   ├── SurpriseViewPage.tsx     # Recipient's surprise experience
│   │   ├── UserDashboard.tsx        # Creator's dashboard
│   │   └── AdminPanel.tsx           # Admin UI
│   ├── components/
│   │   ├── SurpriseThemeView.tsx    # Live preview inside wizard
│   │   ├── CertificateComponent.tsx # Printable certificate
│   │   ├── MusicPlayer.tsx
│   │   ├── QRCodeModal.tsx
│   │   ├── ScratchCardReason.tsx
│   │   ├── RomanticBackground.tsx
│   │   └── ...
│   └── utils/
│       └── mediaUpload.ts  # Image validation, compression, upload helpers
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 (or Bun)
- A [Google Cloud](https://console.cloud.google.com/) project with an **OAuth 2.0 Web Client ID**
- A [Gemini API key](https://aistudio.google.com/app/apikey)
- A [Cloudinary](https://console.cloudinary.com/) account (free tier is fine)

### 1. Install dependencies

```bash
cd lovelink-builder
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Gemini AI key — required for AI-assisted love letters |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Web Client ID |
| `APP_URL` | Full URL where the app is hosted (e.g. `http://localhost:3000`) |
| `JWT_SECRET` | Secret for signing session tokens — use a long random string in prod |
| `ADMIN_USERNAME` | Admin panel login username (default: `admin`) |
| `ADMIN_PASSWORD` | Admin panel login password |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `PORT` | HTTP port (default: `3000`) |
| `DATA_DIR` | Directory for `data.json` — leave blank for local dev |

> **Google OAuth setup:** In the Google Cloud Console, add your app URL (e.g. `http://localhost:3000`) to **Authorised JavaScript origins**. No redirect URI is needed — the app uses the GIS token flow.

### 3. Run in development

```bash
npm run dev
```

The server starts at `http://localhost:3000`. Vite's dev middleware is served through the same Express process so there is only one port to manage.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the full-stack dev server with hot reload (`tsx server.ts`) |
| `npm run build` | Build the React app with Vite and bundle the server with esbuild |
| `npm run start` | Run the production build (`node dist/server.cjs`) |
| `npm run lint` | TypeScript type-check (`tsc --noEmit`) |

---

## API Reference

All endpoints are prefixed with `/api`. Protected endpoints require an `Authorization: Bearer <token>` header.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/google` | — | Sign in with Google ID token; returns JWT |
| `POST` | `/api/auth/guest` | — | Create a guest/device session |
| `POST` | `/api/auth/admin` | — | Admin login (username + password) |
| `GET` | `/api/auth/google-client-id` | — | Returns `GOOGLE_CLIENT_ID` for the frontend |
| `GET` | `/api/auth/me` | ✓ | Returns the current user |

### Surprises

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/surprises` | ✓ | List all surprises for the authenticated user |
| `GET` | `/api/surprises/:id` | — | Get a single surprise (public; view-token checked server-side) |
| `POST` | `/api/surprises` | ✓ | Create a new surprise |
| `PUT` | `/api/surprises/:id` | ✓ | Update an existing surprise |
| `DELETE` | `/api/surprises/:id` | ✓ | Delete a surprise |

### Media

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/upload` | ✓ | Upload a photo or audio file to Cloudinary |
| `GET` | `/api/upload/status` | — | Returns whether Cloudinary upload is enabled |

### Admin

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | ✓ admin | Site statistics |
| `GET` | `/api/admin/users` | ✓ admin | List all users |
| `DELETE` | `/api/admin/users/:id` | ✓ admin | Delete a user |
| `GET` | `/api/admin/surprises` | ✓ admin | List all surprises |
| `DELETE` | `/api/admin/surprises/:id` | ✓ admin | Delete any surprise |
| `GET` | `/api/admin/settings` | — | Get site settings |
| `PUT` | `/api/admin/settings` | ✓ admin | Update site settings |
| `GET` | `/api/admin/templates` | ✓ admin | List story templates |
| `POST` | `/api/admin/templates` | ✓ admin | Create a story template |
| `DELETE` | `/api/admin/templates/:id` | ✓ admin | Delete a story template |

---

## Deploying to Render

The repository includes a [`render.yaml`](render.yaml) for one-click deploy.

1. Fork / push this repo to GitHub.
2. In the [Render dashboard](https://dashboard.render.com/), click **New → Blueprint** and connect the repo.
3. Render will create a **Web Service** and a **1 GB persistent disk** mounted at `/opt/render/project/src/data`.
4. Set the following environment variables in the Render dashboard (they are marked `sync: false` in `render.yaml` so they are never committed):
   - `GOOGLE_CLIENT_ID`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `GEMINI_API_KEY`
5. `JWT_SECRET` is auto-generated by Render.
6. After deploy, add your Render URL to **Authorised JavaScript origins** in Google Cloud Console.

---

## Data Storage

In development, `data.json` is written to the project root. In production (Render), it is written to the persistent disk path set via `DATA_DIR`. The file stores all users, surprises, story templates, and site settings. No external database is required.

---

## License

This project is private and not licensed for redistribution.
