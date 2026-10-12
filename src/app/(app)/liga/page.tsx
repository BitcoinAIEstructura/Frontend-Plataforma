import type { Metadata } from "next";

import { PantallaLiga } from "@/componentes/liga/PantallaLiga";

export const metadata: Metadata = { title: "Liga · Nexabit" };

export default function PaginaLiga() {
  return <PantallaLiga />;
}
