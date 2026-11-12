import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BarraInferior, BarraLateral, ESPERA_ABRIR_MS, ESPERA_CERRAR_MS } from "./Navegacion";
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

  it("cerrada muestra solo iconos; se abre al acercar el cursor y se cierra al quitarlo", async () => {
    vi.useFakeTimers();
    try {
      render(<BarraLateral />);
      const panel = screen.getByRole("navigation", { name: "Secciones" }).parentElement!;
      const enlace = screen.getByRole("link", { name: "Panel" });
      // El nombre siempre es el nombre accesible del enlace, aunque no se vea.
      expect(enlace.querySelector("svg")).not.toBeNull();
      expect(panel).toHaveAttribute("data-abierta", "false");
      expect(within(enlace).getByText("Panel")).toHaveClass("opacity-0");
      expect(screen.queryByRole("button")).toBeNull();

      fireEvent.mouseEnter(panel);
      act(() => vi.advanceTimersByTime(ESPERA_ABRIR_MS));
      expect(panel).toHaveAttribute("data-abierta", "true");
      expect(within(enlace).getByText("Panel")).toHaveClass("opacity-100");

      // Salirse y volver enseguida no la cierra.
      fireEvent.mouseLeave(panel);
      act(() => vi.advanceTimersByTime(ESPERA_CERRAR_MS / 2));
      fireEvent.mouseEnter(panel);
      act(() => vi.advanceTimersByTime(ESPERA_CERRAR_MS));
      expect(panel).toHaveAttribute("data-abierta", "true");

      fireEvent.mouseLeave(panel);
      act(() => vi.advanceTimersByTime(ESPERA_CERRAR_MS));
      expect(panel).toHaveAttribute("data-abierta", "false");

      // Pasar de largo con el cursor no la abre.
      fireEvent.mouseEnter(panel);
      fireEvent.mouseLeave(panel);
      act(() => vi.advanceTimersByTime(ESPERA_CERRAR_MS));
      expect(panel).toHaveAttribute("data-abierta", "false");
    } finally {
      vi.useRealTimers();
    }
  });

  it("con el teclado se abre al llegar con Tab y se cierra con Escape o al salir", async () => {
    render(
      <>
        <BarraLateral />
        <button type="button">después</button>
      </>,
    );
    const panel = screen.getByRole("navigation", { name: "Secciones" }).parentElement!;
    await userEvent.tab();
    expect(screen.getByRole("link", { name: "Panel" })).toHaveFocus();
    expect(panel).toHaveAttribute("data-abierta", "true");
    await userEvent.keyboard("{Escape}");
    expect(panel).toHaveAttribute("data-abierta", "false");
    await userEvent.tab();
    expect(panel).toHaveAttribute("data-abierta", "true");
    act(() => screen.getByRole("button", { name: "después" }).focus());
    expect(panel).toHaveAttribute("data-abierta", "false");
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
