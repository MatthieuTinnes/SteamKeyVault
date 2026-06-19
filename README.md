<p align="center">
  <img src="apps/frontend/src/assets/logo.png" alt="SteamKeyVault Logo" width="200">
</p>

# [SteamKeyVault](https://steamkeyvault.com)

**Securely manage and share your Steam game keys.**

SteamKeyVault is a web application that lets you maintain a personal library of game keys with **client-side encryption** — keys are encrypted in your browser before they ever reach the server. Share keys with trusted users via time-limited, single-use share links.

Try it now ! [steamkeyvault.com](https://steamkeyvault.com)

## Screenshots

<p align="center">
  <img src="apps/frontend/src/assets/mockup/mykeys_en_dark.avif" alt="SteamKeyVault Screenshot" width="700">
</p>

---

## Features

- **Client-side encryption** — Master key derived from your password via KDF; keys are wrapped before leaving the browser. The server never sees plaintext keys.
- **Secure sharing** — Generate expiring, single-use share tokens for any key.
- **Steam API integration** — Auto-fetch game metadata (name, images, publisher) by Steam App ID.
- **Bulk import** — Import multiple keys at once (with configurable limits).
- **User administration** — Admin dashboard with user management and action logs.
- **Notifications** — Receive error alerts via Gotify (self-hosted push notifications).
- **Bot protection** — Cloudflare Turnstile on registration.
- **i18n** — English and French interfaces (extensible).
- **Responsive UI** — Built with PrimeVue, works on desktop and mobile.

---

## Architecture

```
Frontend (Vue 3 + Vite)    Backend (Django Ninja)    Database (PostgreSQL)
     :5173                       :8000                       :5432
       |                            |                          |
  ┌────┴────┐                ┌──────┴──────┐            ┌─────┴─────┐
  │  SPA    │ ──── Axios ──▶ │  REST API   │ ── ORM ──▶ │ PostgreSQL │
  │  (TS)   │ ◀─── JSON ──── │  (Python)   │            │           │
  └─────────┘                └─────────────┘            └───────────┘
       │                            │
       │  Client-side               │  Steam API
       │  encryption                │  APScheduler
       │  (KDF + AES)               │  Email
       │                            │  Gotify
```

---

## Prerequisites

- **Python** 3.11+
- **Node.js** 22+ / **pnpm** 10+
- **PostgreSQL** 15+ (or SQLite for testing)
- **Docker** + **Docker Compose** (optional, for containerized deployment)

---

## Quick Start (Development)

### 1. Clone and set up environment

```bash
git clone https://github.com/MatthieuTinnes/SteamKeyVault.git
cd SteamKeyVault
```

### 2. Backend setup

```bash
make install-backend      # Create venv + install pip dependencies
make migrate              # Run database migrations
```

Copy and edit environment variables:

```bash
cp apps/backend/.env.example apps/backend/.env
```

At minimum, set `STEAM_API_KEY` (get one from https://steamcommunity.com/dev/apikey).

### 3. Frontend setup

```bash
make install-frontend     # pnpm install
```

### 4. Start development servers

```bash
make dev                  # Starts both backend (:8000) and frontend (:5173)
```

Or start them individually:

```bash
make dev-backend          # Django dev server on :8000
make dev-frontend         # Vite dev server on :5173
```

Open **http://localhost:5173** in your browser.

---

## Configuration

All backend configuration is done via environment variables. See [`apps/backend/.env.example`](apps/backend/.env.example) for a full reference.

| Variable | Description | Required |
|---|---|---|
| `SECRET_KEY` | Django secret key | Yes |
| `DB_ENGINE` | Database backend | Yes |
| `STEAM_API_KEY` | Steam Web API key | Yes (for Steam features) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret | For registration |
| `GOTIFY_URL` / `GOTIFY_TOKEN` | Gotify push notifications | Optional |
| `EMAIL_*` | SMTP configuration for transactional emails | Optional (console in dev) |

The frontend reads public configuration from [`apps/frontend/public/config.js`](apps/frontend/public/config.js).

---

## Docker Deployment

Use the docker-compose.yml and the .env.example to get started.
```bash
cp .env.example .env
docker-compose up -d
```

---

## Testing

```bash
# Backend (uses SQLite in-memory)
DJANGO_SETTINGS_MODULE=steamkeyvault.test_settings python manage.py test

# Frontend
cd apps/frontend && pnpm run test:unit
```

CI (GitHub Actions) runs both test suites on every push.

---

## API Documentation

When the backend is running, interactive API docs are available at:

- **Swagger UI:** http://localhost:8000/api/docs
- **ReDoc:** http://localhost:8000/api/redoc

The REST API is built with [Django Ninja](https://django-ninja.dev/) and covers authentication, user management, games, keys, sharing, Steam integration, and admin operations.

---

## License

This project is licensed under the **GNU Affero General Public License v3.0** — see the [LICENSE](LICENSE) file for details.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

Before committing, ensure:

- Backend tests pass: `python manage.py test`
- Frontend tests pass: `pnpm run test:unit`
- Frontend linting passes: `pnpm run lint`
- The build succeeds: `pnpm run build`
