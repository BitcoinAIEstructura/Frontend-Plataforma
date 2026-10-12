import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Nexabit",
  description: "Trading simulado de Bitcoin con inteligencia artificial. Sin dinero real.",
};

export default function RaizLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CO">
      <body>{children}</body>
    </html>
  );
}
