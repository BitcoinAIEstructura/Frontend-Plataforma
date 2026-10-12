import type { ReactNode } from "react";

import { MarcoApp } from "@/componentes/marco/MarcoApp";
import { ProveedorTiempoReal } from "@/lib/tiempoReal";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <MarcoApp>
      {/* Una sola conexión en vivo para todas las páginas privadas. */}
      <ProveedorTiempoReal>{children}</ProveedorTiempoReal>
    </MarcoApp>
  );
}
