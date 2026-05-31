/// <reference types="vite/client" />

interface Window {
  config?: {
    VITE_API_BASE_URL?: string
    VITE_COMMIT_HASH?: string
    VITE_DEPLOY_DATE?: string
  }
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_COMMIT_HASH: string
  readonly VITE_DEPLOY_DATE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
