import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CLAVE_USUARIO } from "@/lib/hooks/useSesion";
import { clienteDePrueba, renderizar, servidorFalso, USUARIO_PRUEBA } from "@/test/utilidades";

import { PantallaPanel } from "./PantallaPanel";

vi.mock("@/componentes/graficas/GraficaEvolucion", () => ({
  GraficaEvolucion: () => <div data-testid="evolucion" />,
}));

afterEach(() => vi.unstubAllGlobals());

describe("PantallaPanel", () => {
  it("junta saludo, cifras, precio de 24 h, evolución y señal", async () => {
    const fetch = servidorFalso({
      "GET /api/precio": { estado: 200, cuerpo: { simbolo: "BTCUSDT", precio: 84_000, momento: 1 } },
      "GET /api/velas": {
        estado: 200,
        cuerpo: {
          simbolo: "BTCUSDT",
          intervalo: "1h",
          cantidad: 1,
          velas: [
            {
              tiempoApertura: 1,
              apertura: 80_000,
              maximo: 1,
              minimo: 1,
              cierre: 1,
              volumen: 1,
              tiempoCierre: 2,
            },
          ],
        },
      },
      "GET /api/ordenes": { estado: 200, cuerpo: { cantidad: 0, ordenes: [] } },
    });
    const cliente = clienteDePrueba();
    cliente.setQueryData(CLAVE_USUARIO, { ...USUARIO_PRUEBA, verificacionDosPasos: true });
    renderizar(<PantallaPanel />, { cliente });

    expect(screen.getByRole("heading", { level: 2, name: /Hola, Ana/ })).toBeInTheDocument();
    expect(await screen.findByText("▲ +5,00 %")).toBeInTheDocument();
    expect(screen.getByText("en las últimas 24 h")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Evolución de tu cartera" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Señal de la IA" })).toBeInTheDocument();
    const rutas = fetch.mock.calls.map((c) => String(c[0]));
    expect(rutas).toContain("/api/velas?intervalo=1h&cantidad=24");
    expect(rutas).toContain("/api/senal?estrategia=combinada&intervalo=1h");
  });
});
