import type { Metadata } from "next";

import { CentroSeguridad } from "@/componentes/seguridad/CentroSeguridad";

export const metadata: Metadata = { title: "Seguridad · Nexabit" };

export default function PaginaSeguridad() {
  return <CentroSeguridad />;
}
