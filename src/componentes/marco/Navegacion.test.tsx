import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BarraInferior, BarraLateral } from "./Navegacion";
import { SECCIONES } from "./secciones";

const ruta = vi.hoisted(() => ({ actual: "/seguridad" }));
vi.mock("next/navigation", () => ({ usePathname: () => ruta.actual }));

describe("Navegación", () => {
  it("marca la sección actual y enlaza las que están listas", () => {
    render(<BarraLateral />);
    const nav = screen.getByRole("navigation", { name: "Secciones" });
    expect(within(nav).getByRole("link", { name: /Seguridad/ })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: /Panel/ })).not.toHaveAttribute("aria-current");
  });

  it("las secciones futuras no son enlaces y dicen Pronto", () => {
    render(<BarraLateral />);
    expect(screen.queryByRole("link", { name: /Predicciones IA/ })).toBeNull();
    expect(screen.getByText("Predicciones IA").closest("[aria-disabled]")).toHaveTextContent("Pronto");
  });

  it("en el teléfono hay como máximo 5 secciones", () => {
    render(<BarraInferior />);
    const nav = screen.getByRole("navigation", { name: "Secciones" });
    const visibles = SECCIONES.filter((s) => s.enTelefono);
    expect(visibles.length).toBeLessThanOrEqual(5);
    for (const s of visibles) expect(nav).toHaveTextContent(s.titulo);
  });
});
