import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CLAVES } from "@/lib/tiempoReal";
import { clienteDePrueba, renderizar, servidorFalso, USUARIO_PRUEBA } from "@/test/utilidades";

import { BarraSuperior } from "./BarraSuperior";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/panel",
}));

afterEach(() => vi.unstubAllGlobals());

const VELA = {
  tiempoApertura: 1,
  apertura: 80_000,
  maximo: 1,
  minimo: 1,
  cierre: 1,
  volumen: 1,
  tiempoCierre: 2,
};

/** Siembra las consultas que usa la barra (sin pedirlas al servidor). */
function cliente({ conCartera }: { conCartera: boolean }) {
  const c = clienteDePrueba();
  c.setDefaultOptions({ queries: { staleTime: Infinity, retry: false } });
  c.setQueryData(CLAVES.precio, { simbolo: "BTCUSDT", precio: 84_000, momento: 1 });
  c.setQueryData(["mercado", "velas", "1h", 24], [VELA]);
  if (conCartera) c.setQueryData(CLAVES.cartera, { valorTotal: 10_250, rentabilidad: 0.025 });
  return c;
}

describe("BarraSuperior", () => {
  it("muestra la sección, el precio con su variación de 24 h y la cartera", () => {
    servidorFalso({});
    renderizar(<BarraSuperior titulo="Panel" usuario={USUARIO_PRUEBA} />, {
      cliente: cliente({ conCartera: true }),
    });
    expect(screen.getByRole("heading", { level: 1, name: "Panel" })).toBeInTheDocument();
    const cotizaciones = screen.getByLabelText("Cotizaciones");
    expect(cotizaciones).toHaveTextContent("BTC/USDT");
    expect(cotizaciones).toHaveTextContent("84.000,00");
    // 84.000 frente a la apertura de 80.000 hace 24 h: +5 %, con su ▲ (nunca solo color).
    expect(within(cotizaciones).getByText("▲ +5,00 %")).toHaveClass("text-sube");
    expect(cotizaciones).toHaveTextContent("Cartera");
    expect(cotizaciones).toHaveTextContent("10.250,00");
  });

  it("sin datos de la cartera solo muestra el precio", () => {
    servidorFalso({});
    renderizar(<BarraSuperior titulo="Panel" usuario={USUARIO_PRUEBA} />, {
      cliente: cliente({ conCartera: false }),
    });
    expect(screen.queryByText("Cartera")).toBeNull();
    expect(screen.getByText("84.000,00")).toBeInTheDocument();
  });

  it("trae las herramientas: buscar, asistente, tema y la cuenta", () => {
    servidorFalso({});
    renderizar(<BarraSuperior titulo="Panel" usuario={USUARIO_PRUEBA} />, {
      cliente: cliente({ conCartera: true }),
    });
    expect(screen.getByRole("button", { name: "Asistente: pregúntale al bot" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cambiar al tema/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Menú de la cuenta/ })).toBeInTheDocument();
  });
});
