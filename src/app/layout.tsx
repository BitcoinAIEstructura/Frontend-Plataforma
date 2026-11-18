/**
 * Layout raíz de Nexabit.
 *
 * Define el documento HTML, los metadatos de la aplicación y los proveedores
 * globales (tema, datos y PWA) que envuelven todas las rutas.
 */
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { Proveedores } from "@/componentes/Proveedores";
import { RegistroPwa } from "@/componentes/RegistroPwa";
import { SCRIPT_TEMA } from "@/componentes/ui/InterruptorTema";

import { variablesDeFuentes } from "./fuentes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexabit",
  description: "Trading simulado de Bitcoin con inteligencia artificial. Sin dinero real.",
  appleWebApp: { capable: true, title: "Nexabit", statusBarStyle: "black-translucent" },
  // El ícono va explícito: si solo se declara el de Apple, Next deja de enlazar src/app/icon.svg.
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: "/iconos/nexabit-192.png" },
};

export const viewport: Viewport = { themeColor: "#0e0c09", width: "device-width", initialScale: 1 };

export default function RaizLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: el script de abajo puede cambiar data-theme antes de que React hidrate.
    <html lang="es-CO" data-theme="oscuro" className={variablesDeFuentes} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>
        <Proveedores>{children}</Proveedores>
        <RegistroPwa />
      </body>
    </html>
  );
}
