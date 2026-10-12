import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso } from "@/test/utilidades";

import { detalleLegible, TarjetaActividad } from "./TarjetaActividad";

describe("detalleLegible", () => {
  it("resume el User-Agent y conserva la marca de segundo paso", () => {
    const agente = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/152.0 Mobile Safari/537.36";
    expect(detalleLegible(agente)).toBe("Chrome en Android");
    expect(detalleLegible(`${agente} (con verificación en dos pasos)`)).toBe(
      "Chrome en Android (con verificación en dos pasos)",
    );
  });

  it("deja igual lo que no es un navegador", () => {
    expect(detalleLegible("Quedan 9")).toBe("Quedan 9");
    expect(detalleLegible("2 sesiones")).toBe("2 sesiones");
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("TarjetaActividad", () => {
  it("lista los eventos y destaca los que merecen atención", async () => {
    const ahora = Date.now();
    const servidor = servidorFalso({
      "GET /api/cuentas/actividad": {
        estado: 200,
        cuerpo: {
          eventos: [
            {
              momento: ahora - 60_000,
              tipo: "INICIO_FALLIDO",
              descripcion: "Intento de inicio de sesión fallido",
              ip: "45.1.2.3",
              detalle: "curl/8.21.0",
            },
            {
              momento: ahora - 7_200_000,
              tipo: "REGISTRO",
              descripcion: "Cuenta creada",
              ip: "127.0.0.1",
              detalle: "",
            },
          ],
        },
      },
    });
    renderizar(<TarjetaActividad />);
    const fallido = await screen.findByText(/Intento de inicio de sesión fallido/);
    expect(fallido).toHaveTextContent("Atención:");
    expect(screen.getByText("Cuenta creada")).not.toHaveTextContent("Atención");
    expect(screen.getByText("hace 2 horas")).toBeInTheDocument();
    expect(servidor.mock.calls[0]?.[0]).toBe("/api/cuentas/actividad?limite=20");
  });
});
