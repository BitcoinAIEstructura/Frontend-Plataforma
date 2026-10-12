import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Senal } from "@/lib/api/mercado";
import { renderizar, servidorFalso } from "@/test/utilidades";

import { MedidorSenal, TarjetaSenal } from "./MedidorSenal";

afterEach(() => vi.unstubAllGlobals());

function senal(s: Senal["decision"]["senal"], confianza: number): Senal {
  return {
    estrategia: "combinada",
    velasAnalizadas: 199,
    decision: { tiempo: 1, senal: s, precio: 83773.12, confianza, motivo: "Votación ponderada" },
    pronostico: {
      direccion: "SUBE",
      confianza,
      justificacion: ["rsi: El RSI (28) está en sobreventa.", "macd: Cruce al alza."],
      indicadores: {},
      aviso: "Esto no es asesoría financiera.",
    },
  };
}

describe("MedidorSenal", () => {
  it("dice la señal con ícono y palabra, y la confianza como medidor", () => {
    renderizar(<MedidorSenal senal={senal("COMPRAR", 0.624)} />);
    const medidor = screen.getByRole("meter", { name: "Confianza de la señal de la IA" });
    expect(medidor).toHaveAttribute("aria-valuenow", "62");
    expect(medidor).toHaveAttribute("aria-valuetext", "Comprar, 62 % de confianza");
    expect(medidor).toHaveTextContent("▲ Comprar");
    expect(screen.getByText(/83\.773,12/)).toBeInTheDocument();
  });

  it("la venta lleva ▼ y la espera ●", () => {
    const { rerender } = renderizar(<MedidorSenal senal={senal("VENDER", 0.4)} />);
    expect(screen.getByRole("meter")).toHaveTextContent("▼ Vender");
    rerender(<MedidorSenal senal={senal("MANTENER", 0.25)} />);
    expect(screen.getByRole("meter")).toHaveTextContent("● Mantener");
  });

  it("explica el porqué y muestra el aviso", async () => {
    renderizar(<MedidorSenal senal={senal("COMPRAR", 0.5)} />);
    await userEvent.click(screen.getByText("¿Por qué?"));
    expect(screen.getByText("macd: Cruce al alza.")).toBeVisible();
    expect(screen.getByText("Esto no es asesoría financiera.")).toBeInTheDocument();
  });

  it("la confianza se limita a 0–100 %", () => {
    renderizar(<MedidorSenal senal={senal("COMPRAR", 1.7)} />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "100");
  });
});

describe("TarjetaSenal", () => {
  it("pide la señal combinada de 1 h", async () => {
    const fetch = servidorFalso({ "GET /api/senal": { estado: 200, cuerpo: senal("VENDER", 0.5) } });
    renderizar(<TarjetaSenal />);
    expect(await screen.findByRole("meter")).toHaveTextContent("Vender");
    expect(String(fetch.mock.calls[0]![0])).toBe("/api/senal?estrategia=combinada&intervalo=1h");
  });
});
