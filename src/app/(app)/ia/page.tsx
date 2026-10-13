import type { Metadata } from "next";

import { PantallaIA } from "@/componentes/ia/PantallaIA";

export const metadata: Metadata = { title: "Predicciones IA · Nexabit" };

export default function PaginaIA() {
  return <PantallaIA />;
}
