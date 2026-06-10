# SteamKeyVault Frontend

Vue 3 + TypeScript + PrimeVue frontend for SteamKeyVault application.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Environment Configuration

### Local Development

The frontend uses environment variables to configure the API endpoint. For local development:

```sh
cp .env.local .env
```

Edit `.env` if needed to change the API endpoint:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Production Build

For production, the API endpoint is set at build time. The default is `/api` (relative path) which works with Traefik routing.

To build with a custom API endpoint:
```sh
docker build --build-arg VITE_API_BASE_URL=https://api.example.com/api .
```

## Project Setup

Install dependencies (using pnpm):

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm run dev
```

The development server will start at `http://localhost:5173`

### Type-Check, Compile and Minify for Production

```sh
pnpm run build
```

### Type-Check Only

```sh
pnpm run type-check
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm run lint
```

## Technologies

- **Vue 3**: Progressive JavaScript framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **PrimeVue**: Rich UI component library
- **Pinia**: State management
- **Vue Router**: Client-side routing
- **Axios**: HTTP client for API calls

## Project Structure

```
src/
├── api/          # API client helpers
├── assets/       # Static assets (CSS, images)
├── components/   # Reusable Vue components
├── composables/  # Vue composables (reusable logic)
├── models/       # TypeScript interfaces/types
├── router/       # Vue Router configuration
├── stores/       # Pinia stores
├── utils/        # Utility functions
└── views/        # Page components
```

## API Configuration

The frontend communicates with the backend API. The base URL is configured via `VITE_API_BASE_URL`:

- **Development**: `http://localhost:8000/api` (default)
- **Production**: `/api` (proxied by Traefik to backend)

See `src/api/apiHelper.ts` for API client configuration.

## Deployment

For production deployment with Docker, see the main repository's [DEPLOYMENT.md](../DEPLOYMENT.md).
