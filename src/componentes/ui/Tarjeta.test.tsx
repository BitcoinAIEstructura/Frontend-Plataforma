import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AvisoSimulacion, TEXTO_AVISO } from "./AvisoSimulacion";
import { Tarjeta } from "./Tarjeta";

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
});

describe("AvisoSimulacion", () => {
  it("deja claro que no hay dinero real ni asesoría", () => {
    render(<AvisoSimulacion />);
    expect(screen.getByRole("note")).toHaveTextContent(TEXTO_AVISO);
    expect(TEXTO_AVISO).toMatch(/no se usa dinero real/);
    expect(TEXTO_AVISO).toMatch(/no es asesoría financiera/);
  });
});
