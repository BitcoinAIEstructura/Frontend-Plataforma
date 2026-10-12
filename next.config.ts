import type { NextConfig } from "next";

/**
 * El navegador solo habla con este mismo sitio: `/api/*` se reenvía al backend.
 * Así la cookie de sesión (HttpOnly, SameSite=Strict) es del mismo origen, no hace
 * falta CORS y la URL del backend nunca llega al navegador.
 */
const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:8080").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return [{ source: "/api/:ruta*", destination: `${BACKEND_URL}/api/:ruta*` }];
  },
};

export default nextConfig;
