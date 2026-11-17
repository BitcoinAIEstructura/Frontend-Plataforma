import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AvisoSimulacion, TEXTO_AVISO } from "./AvisoSimulacion";
import { ColumnaPareja, Tarjeta } from "./Tarjeta";

describe("Tarjeta", () => {
  it("es una sección con su título como encabezado", () => {
    render(
      <Tarjeta titulo="Tu cartera" extra={<span>+2,4 %</span>}>
        10.000 USDT
      </Tarjeta>,
    );
    const seccion = screen.getByRole("region", { name: "Tu cartera" });
    expect(seccion).toHaveTextContent("10.000 USDT");
    expect(screen.getByRole("heading", { level: 2, name: "Tu cartera" })).toBeInTheDocument();
    expect(screen.getByText("+2,4 %")).toBeInTheDocument();
  });

  it("la destacada lleva el filo dorado", () => {
    const { container } = render(<Tarjeta destacada>Saldo</Tarjeta>);
    expect(container.firstElementChild).toHaveClass("vidrio", "borde-oro");
  });

  it("la desplazable deja el título fijo y el contenido en un recuadro con scroll propio", () => {
    render(
      <ColumnaPareja>
        <Tarjeta titulo="Historial" desplazable>
          <p>movimiento</p>
        </Tarjeta>
      </ColumnaPareja>,
    );
    const seccion = screen.getByRole("region", { name: "Historial" });
    const recuadro = screen.getByText("movimiento").parentElement!;
    expect(recuadro).toHaveClass("overflow-y-auto");
    // Con el teclado también se llega al recuadro (para desplazarlo con las flechas).
    expect(recuadro).toHaveAttribute("tabindex", "0");
    // El título queda fuera del recuadro que se desplaza.
    expect(seccion).toContainElement(recuadro);
    expect(recuadro).not.toContainElement(screen.getByRole("heading", { name: "Historial" }));
  });

  it("la de tope tiene un alto máximo para dejarle sitio a la de abajo", () => {
    render(
      <Tarjeta titulo="Cola" desplazable="tope">
        x
      </Tarjeta>,
    );
    expect(screen.getByRole("region", { name: "Cola" })).toHaveClass("lg:max-h-[50%]");
  });
});

describe("AvisoSimulacion", () => {
  it("deja claro que no hay dinero real ni asesoría", () => {
    render(<AvisoSimulacion />);
    expect(screen.getByRole("note")).toHaveTextContent(TEXTO_AVISO);
    expect(TEXTO_AVISO).toMatch(/no se usa dinero real/);
    expect(TEXTO_AVISO).toMatch(/no es asesoría financiera/);
  });
});
