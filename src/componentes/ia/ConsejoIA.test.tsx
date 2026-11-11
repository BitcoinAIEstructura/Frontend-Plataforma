import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso } from "@/test/utilidades";

import { ConsejoIA } from "./ConsejoIA";

afterEach(() => vi.unstubAllGlobals());

const CONSEJO = {
  accion: "COMPRAR",
  titulo: "La IA recomienda comprar",
  texto: "Ve 64 % de probabilidad de que suba en la próxima vela de 1 hora.",
  decision: {
    senal: "COMPRAR",
    probabilidad: 0.64,
    confianza: 0.28,
    exactitud: 0.55,
    base: 0.51,
    riesgo: 0.14,
    stopLoss: 0.015,
    takeProfit: 0.03,
    volatilidad: 0.005,
    intervalo: "1h",
    tiempoVela: 1,
    precio: 84000,
    motivo: "…",
  },
  aviso: "Es una simulación: la IA puede equivocarse y no es asesoría financiera.",
};

describe("ConsejoIA", () => {
  it("muestra la acción con ícono, la probabilidad y lo que arriesgaría", async () => {
    servidorFalso({ "GET /api/ia/consejo": { estado: 200, cuerpo: CONSEJO } });
    renderizar(<ConsejoIA />);
    expect(screen.getByRole("status")).toHaveTextContent("analizando");
    expect(await screen.findByText("La IA recomienda comprar")).toBeInTheDocument();
    expect(screen.getByText("Comprar")).toBeInTheDocument();
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "64");
    expect(screen.getByText("14 %")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dejar que la IA opere/ })).toHaveAttribute("href", "/bot");
  });

  it("en versión compacta no muestra las cifras del piloto; si falla, lo dice", async () => {
    servidorFalso({ "GET /api/ia/consejo": { estado: 200, cuerpo: CONSEJO } });
    const { unmount } = renderizar(<ConsejoIA compacto />);
    await screen.findByText("La IA recomienda comprar");
    expect(screen.queryByText("Usaría de tu saldo")).not.toBeInTheDocument();
    unmount();
    servidorFalso({ "GET /api/ia/consejo": { estado: 503, cuerpo: { error: "La IA no está disponible" } } });
    renderizar(<ConsejoIA />);
    expect(await screen.findByRole("alert", undefined, { timeout: 4000 })).toHaveTextContent(
      "no pudo dar un consejo",
    );
  });
});
