import type { Metadata } from "next";

import { PantallaMercado } from "@/componentes/mercado/PantallaMercado";

export const metadata: Metadata = { title: "Mercado · Nexabit" };

export default function PaginaMercado() {
  return <PantallaMercado />;
}
