import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso } from "@/test/utilidades";

import { SiHubiera } from "./SiHubiera";

afterEach(() => vi.unstubAllGlobals());

const RESPUESTA = {
  fecha: "2025-01-01",
  monto: 1000,
  vela: {
    tiempoApertura: 1735689600000,
    apertura: 93576,
    maximo: 95000,
    minimo: 92000,
    cierre: 94000,
    volumen: 1,
    tiempoCierre: 1735775999999,
  },
  btc: 0.01067,
  precioActual: 82_000,
  valorHoy: 875.2,
  ganancia: -124.8,
  rentabilidad: -0.1248,
  mejor: { tiempo: 1735689600000 + 20 * 86_400_000, precio: 109_000 },
  peor: { tiempo: 1735689600000 + 90 * 86_400_000, precio: 74_500 },
  velasRecorridas: 650,
  alturaArbol: 10,
  velasIndexadas: 1000,
};

describe("SiHubiera", () => {
  it("calcula con la fecha y el monto y explica el resultado", async () => {
    const fetch = servidorFalso({ "GET /api/si-hubiera": { estado: 200, cuerpo: RESPUESTA } });
    renderizar(<SiHubiera />);
    const monto = screen.getByLabelText("Monto (USDT)");
    await userEvent.clear(monto);
    await userEvent.type(monto, "1.000");
    await userEvent.click(screen.getByRole("button", { name: "Calcular" }));
    expect(await screen.findByText("875,20 USDT")).toBeInTheDocument();
    expect(screen.getByText("−124,80 (▼ −12,48 %)")).toBeInTheDocument();
    expect(screen.getByText(/habrías comprado/)).toHaveTextContent("el 1 de enero de 2025 habrías comprado");
    expect(screen.getByText(/1000 velas diarias en solo 10 niveles/)).toBeInTheDocument();
    expect(String(fetch.mock.calls[0]![0])).toBe("/api/si-hubiera?fecha=2025-01-01&monto=1000");
  });

  it("valida el monto antes de llamar al servidor y muestra los errores del backend", async () => {
    const fetch = servidorFalso({
      "GET /api/si-hubiera": {
        estado: 400,
        cuerpo: { error: "Esa fecha es anterior a los datos disponibles" },
      },
    });
    renderizar(<SiHubiera />);
    const monto = screen.getByLabelText("Monto (USDT)");
    await userEvent.clear(monto);
    await userEvent.click(screen.getByRole("button", { name: "Calcular" }));
    expect(screen.getByRole("alert")).toHaveTextContent("El monto va de 1");
    expect(fetch).not.toHaveBeenCalled();
    await userEvent.type(monto, "50");
    await userEvent.click(screen.getByRole("button", { name: "Calcular" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("anterior a los datos");
  });
});
