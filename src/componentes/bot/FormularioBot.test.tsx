import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { aConfiguracion, FormularioBot } from "./FormularioBot";

const ACTUAL = {
  segundosEntreCiclos: 60,
  intervalo: "1h",
  cantidadVelas: 200,
  riesgo: 0.2,
  stopLoss: 0.05,
  takeProfit: 0.1,
  modo: "reglas" as const,
};

describe("FormularioBot", () => {
  it("convierte porcentajes en fracciones para el backend", () => {
    expect(
      aConfiguracion({ segundos: "300", intervalo: "15m", riesgo: 25, stopLoss: 3, takeProfit: 12 }),
    ).toEqual({ segundosEntreCiclos: 300, intervalo: "15m", riesgo: 0.25, stopLoss: 0.03, takeProfit: 0.12 });
  });

  it("arranca con la configuración actual y la envía al encender", async () => {
    const alIniciar = vi.fn();
    render(
      <FormularioBot
        actual={ACTUAL}
        activo={false}
        cargando={false}
        alIniciar={alIniciar}
        alDetener={vi.fn()}
      />,
    );
    expect(screen.getByRole("slider", { name: "Riesgo por compra" })).toHaveValue("20");
    expect(screen.getByRole("radio", { name: "Cada minuto" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "Cada 5 min" }));
    await userEvent.click(screen.getByRole("button", { name: "▶ Encender el bot" }));
    expect(alIniciar).toHaveBeenCalledWith({
      segundosEntreCiclos: 300,
      intervalo: "1h",
      riesgo: 0.2,
      stopLoss: 0.05,
      takeProfit: 0.1,
      modo: "reglas" as const,
    });
  });

  it("en marcha los ajustes quedan bloqueados y el botón lo detiene", async () => {
    const alDetener = vi.fn();
    render(
      <FormularioBot actual={ACTUAL} activo cargando={false} alIniciar={vi.fn()} alDetener={alDetener} />,
    );
    expect(screen.getByRole("slider", { name: "Stop-loss (freno de pérdidas)" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "■ Detener el bot" }));
    expect(alDetener).toHaveBeenCalled();
  });

  it("un tiempo entre ciclos raro se acerca a la opción más parecida", () => {
    render(
      <FormularioBot
        actual={{ ...ACTUAL, segundosEntreCiclos: 250 }}
        activo={false}
        cargando={false}
        alIniciar={vi.fn()}
        alDetener={vi.fn()}
      />,
    );
    expect(screen.getByRole("radio", { name: "Cada 5 min" })).toBeChecked();
  });

  it("con el piloto IA disponible, deja elegir quién decide y los valores pasan a ser topes", async () => {
    const alIniciar = vi.fn();
    render(
      <FormularioBot
        actual={{ ...ACTUAL, modo: "ia" }}
        activo={false}
        cargando={false}
        alIniciar={alIniciar}
        alDetener={vi.fn()}
        pilotoDisponible
      />,
    );
    expect(screen.getByRole("radio", { name: "✦ Piloto IA" })).toBeChecked();
    expect(screen.getByRole("slider", { name: "Riesgo máximo por compra" })).toHaveValue("20");
    await userEvent.click(screen.getByRole("button", { name: "✦ Encender el piloto IA" }));
    expect(alIniciar).toHaveBeenCalledWith(expect.objectContaining({ modo: "ia", riesgo: 0.2 }));
    await userEvent.click(screen.getByRole("radio", { name: "Reglas (indicadores)" }));
    expect(screen.getByRole("slider", { name: "Riesgo por compra" })).toBeInTheDocument();
  });

  it("sin piloto IA no aparece la elección y siempre usa reglas", () => {
    render(
      <FormularioBot
        actual={{ ...ACTUAL, modo: "ia" }}
        activo={false}
        cargando={false}
        alIniciar={vi.fn()}
        alDetener={vi.fn()}
      />,
    );
    expect(screen.queryByRole("radio", { name: "✦ Piloto IA" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "▶ Encender el bot" })).toBeInTheDocument();
  });
});
