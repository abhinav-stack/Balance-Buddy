/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DOMAIN: string;
  readonly VITE_CLIENTID: string;
  // Add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}