import type { ReactNode } from "react";

import { MarcoApp } from "@/componentes/marco/MarcoApp";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <MarcoApp>{children}</MarcoApp>;
}
