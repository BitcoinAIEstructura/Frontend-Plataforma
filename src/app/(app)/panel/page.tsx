import type { Metadata } from "next";

import { Bienvenida } from "@/componentes/panel/Bienvenida";

export const metadata: Metadata = { title: "Panel · Nexabit" };

export default function PaginaPanel() {
  return <Bienvenida />;
}
