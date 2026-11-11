import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BarraInferior, BarraLateral } from "./Navegacion";
import { SECCIONES } from "./secciones";

const ruta = vi.hoisted(() => ({ actual: "/seguridad" }));
vi.mock("next/navigation", () => ({ usePathname: () => ruta.actual }));
// Hoy todas las secciones están listas: se agrega una futura para probar cómo se ve.
vi.mock("./secciones", async (original) => {
  const real = await original<typeof import("./secciones")>();
  return {
    ...real,
    SECCIONES: [
      ...real.SECCIONES,
      { ruta: "/alertas", titulo: "Alertas", icono: "!", lista: false, enTelefono: false, descripcion: "x" },
    ],
  };
});

describe("Navegación", () => {
  it("marca la sección actual y enlaza las que están listas", () => {
    render(<BarraLateral />);
    const nav = screen.getByRole("navigation", { name: "Secciones" });
    expect(within(nav).getByRole("link", { name: /Seguridad/ })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: /Panel/ })).not.toHaveAttribute("aria-current");
  });

  it("es solo de iconos: cada enlace se llama como su sección y un botón muestra los nombres", async () => {
    render(<BarraLateral />);
    const boton = screen.getByRole("button", { name: "Mostrar los nombres de las secciones" });
    expect(boton).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("link", { name: "Panel" }).querySelector("svg")).not.toBeNull();
    await userEvent.click(boton);
    expect(screen.getByRole("button", { name: "Mostrar solo los iconos" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(window.localStorage.getItem("nexabit.barra-expandida")).toBe("1");
    expect(screen.getByRole("link", { name: "Panel" })).toHaveTextContent("Panel");
    await userEvent.click(screen.getByRole("button", { name: "Mostrar solo los iconos" }));
    expect(window.localStorage.getItem("nexabit.barra-expandida")).toBe("0");
  });

  it("las secciones futuras no son enlaces y dicen Pronto", () => {
    render(<BarraLateral />);
    expect(screen.queryByRole("link", { name: /Alertas/ })).toBeNull();
    expect(screen.getByText("Alertas").closest("[aria-disabled]")).toHaveTextContent("Pronto");
    expect(screen.getByRole("link", { name: /Predicciones IA/ })).toHaveAttribute("href", "/ia");
  });

  it("en el teléfono hay 4 secciones y «Más» lleva a todas, con su descripción", async () => {
    render(<BarraInferior />);
    const nav = screen.getByRole("navigation", { name: "Secciones" });
    const visibles = SECCIONES.filter((s) => s.enTelefono);
    expect(visibles.length).toBeLessThanOrEqual(4);
    for (const s of visibles) expect(nav).toHaveTextContent(s.titulo);
    // Seguridad (la sección actual) está en «Más», que se marca.
    const mas = within(nav).getByRole("button", { name: "Más" });
    expect(mas).toHaveClass("text-oro");
    await userEvent.click(mas);
    const todas = screen.getByRole("navigation", { name: "Todas las secciones" });
    for (const s of SECCIONES.filter((x) => x.lista)) {
      expect(within(todas).getByRole("link", { name: new RegExp(s.titulo) })).toHaveAttribute("href", s.ruta);
    }
    expect(within(todas).getByRole("link", { name: /Seguridad/ })).toHaveAttribute("aria-current", "page");
    await userEvent.click(within(todas).getByRole("link", { name: /Cartera/ }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
