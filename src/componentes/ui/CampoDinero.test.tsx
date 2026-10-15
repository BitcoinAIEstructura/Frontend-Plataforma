import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { CampoDinero, limpiarMonto } from "./CampoDinero";

describe("limpiarMonto", () => {
  it.each([
    ["150,50", "150,50"],
    ["150.5", "150.5"],
    ["150,567", "150,56"],
    ["150.567", "150.567"], // 3 cifras tras un punto: miles ("150.567" = ciento cincuenta mil…)
    ["150.5678", "150.56"],
    ["1.250,75", "1.250,75"],
    ["1,2,3", "1,23"],
    ["$ 1 000abc", "1000"],
    ["12,5", "12,5"],
  ])("«%s» → «%s»", (entrada, salida) => {
    expect(limpiarMonto(entrada)).toBe(salida);
  });

  it("sin decimales corta lo que va después del separador", () => {
    expect(limpiarMonto("150,5", 0)).toBe("150");
  });
});

function Probar() {
  const [texto, setTexto] = useState("");
  return <CampoDinero etiqueta="Monto" valor={texto} alCambiar={setTexto} />;
}

describe("CampoDinero", () => {
  it("acepta decimales y muestra cómo quedó la cifra", async () => {
    render(<Probar />);
    expect(screen.getByText(/Puedes usar decimales/)).toBeInTheDocument();
    const casilla = screen.getByLabelText("Monto");
    expect(casilla).toHaveAttribute("inputmode", "decimal");
    await userEvent.type(casilla, "1250,505");
    expect(casilla).toHaveValue("1250,50");
    expect(screen.getByText("= 1.250,50 USDT")).toBeInTheDocument();
    await userEvent.clear(casilla);
    await userEvent.type(casilla, "99.9");
    expect(screen.getByText("= 99,90 USDT")).toBeInTheDocument();
  });
});
