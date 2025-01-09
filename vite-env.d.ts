/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_DOMAIN: string;
    VITE_CLIENTID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}