import type { Metadata } from "next";

import { PantallaBot } from "@/componentes/bot/PantallaBot";

export const metadata: Metadata = { title: "Bot · Nexabit" };

export default function PaginaBot() {
  return <PantallaBot />;
}
