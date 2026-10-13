import type { MetadataRoute } from "next";

/** Para instalar Nexabit como app (PWA) en el teléfono o el portátil. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nexabit · Trading simulado de Bitcoin",
    short_name: "Nexabit",
    description: "Practica con Bitcoin e inteligencia artificial, sin dinero real.",
    lang: "es-CO",
    start_url: "/panel",
    scope: "/",
    display: "standalone",
    background_color: "#07060b",
    theme_color: "#07060b",
    icons: [
      { src: "/iconos/nexabit-192.png", sizes: "192x192", type: "image/png" },
      { src: "/iconos/nexabit-512.png", sizes: "512x512", type: "image/png" },
      { src: "/iconos/nexabit-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Órdenes", url: "/ordenes" },
      { name: "Mercado", url: "/mercado" },
      { name: "Predicciones IA", url: "/ia" },
    ],
  };
}
