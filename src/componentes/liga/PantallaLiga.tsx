"use client";

import { SiHubiera } from "./SiHubiera";
import { TablaLiga } from "./TablaLiga";

/** Liga: el ranking (montículo) y "¿y si hubiera invertido?" (árbol AVL). */
export function PantallaLiga() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <TablaLiga />
      <SiHubiera />
    </div>
  );
}
