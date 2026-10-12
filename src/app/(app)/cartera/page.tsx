import type { Metadata } from "next";

import { PantallaCartera } from "@/componentes/cartera/PantallaCartera";

export const metadata: Metadata = { title: "Cartera · Nexabit" };

export default function PaginaCartera() {
  return <PantallaCartera />;
}
