import type { Metadata } from "next";

import { PantallaOrdenes } from "@/componentes/ordenes/PantallaOrdenes";

export const metadata: Metadata = { title: "Órdenes · Nexabit" };

export default function PaginaOrdenes() {
  return <PantallaOrdenes />;
}
