import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { modelo, PREDICCION } from "@/test/prediccion";

import { ArbolIA, Caracteristicas } from "./Detalle";
import { GraficaExactitud, HistorialPrueba } from "./Evaluacion";
import { porcentaje, puntos, valorCaracteristica } from "./formato";
import { TarjetaComite, Veredicto } from "./TarjetaComite";
import { TarjetaModelo } from "./TarjetaModelo";

describe("formato de la IA", () => {
  it("porcentajes, puntos y valores de características", () => {
    expect(porcentaje(0.5263)).toBe("52,6 %");
    expect(puntos(0.021)).toBe("▲ 2,1 puntos");
    expect(puntos(-0.01)).toBe("▼ 1 punto");
    expect(puntos(0)).toBe("● 0 puntos");
    expect(valorCaracteristica("RSI 14", 31.24)).toBe("31,2");
    expect(valorCaracteristica("Rendimiento de 5 velas", -0.0123)).toBe("−1,23 %");
  });
});

describe("comité y veredicto", () => {
  it("el comité muestra dirección con ícono y probabilidad como medidor", () => {
    render(<TarjetaComite comite={PREDICCION.comite} velas="1 h" />);
    const medidor = screen.getByRole("meter", { name: "Probabilidad de que suba según el comité" });
    expect(medidor).toHaveAttribute("aria-valuenow", "62");
    expect(medidor).toHaveTextContent("▲ Sube");
  });

  it("si no le ganó a la base lo advierte; si le ganó, lo dice", () => {
    const { rerender } = render(<Veredicto modelo={modelo("X", 0.6, -0.03, null)} />);
    expect(screen.getByText(/Ojo: no le ganó a la base/)).toBeInTheDocument();
    expect(screen.getByText(/Tómalo como un experimento/)).toBeInTheDocument();
    rerender(<Veredicto modelo={modelo("X", 0.6, 0.02, null)} />);
    expect(screen.getByText(/Le ganó a la base/)).toBeInTheDocument();
  });
});

describe("TarjetaModelo", () => {
  it("dirección, peso en el comité, métricas contra la base y factores con signo", () => {
    render(<TarjetaModelo modelo={PREDICCION.modelos[2]!} />);
    expect(screen.getByText("Baja")).toBeInTheDocument();
    expect(screen.getByText("Peso en el comité: 27 %")).toBeInTheDocument();
    expect(screen.getByText("▼ 9 puntos")).toHaveClass("text-baja");
    expect(screen.getByText("▲ 0,40")).toBeInTheDocument();
    expect(screen.getByText("▼ 0,20")).toBeInTheDocument();
    expect(screen.getByText("Paso de k vecinos.")).toBeInTheDocument();
  });

  it("en el árbol los factores son importancias (sin signo)", () => {
    render(<TarjetaModelo modelo={PREDICCION.modelos[1]!} />);
    expect(screen.getByText("Factores de Árbol de decisión")).toBeInTheDocument();
    expect(screen.getByText("40 %")).toBeInTheDocument();
  });
});

describe("evaluación", () => {
  it("la gráfica de puntos nombra cada modelo y la base", () => {
    render(<GraficaExactitud modelos={PREDICCION.modelos} comite={PREDICCION.comite} />);
    expect(
      screen.getByRole("img", { name: /Comité 48 %.*Árbol de decisión 53 %.*base 51 %/ }),
    ).toBeInTheDocument();
  });

  it("el historial cuenta aciertos con ✓ y ✕", () => {
    render(<HistorialPrueba prueba={PREDICCION.prueba} />);
    const casillas = within(screen.getByRole("img")).getAllByRole("listitem");
    expect(casillas.map((c) => c.textContent)).toEqual(["✓", "✕", "✓"]);
    expect(screen.getByText(/acertó/)).toHaveTextContent("acertó 2 de 3");
  });
});

describe("detalle", () => {
  it("el árbol marca el camino de la vela de ahora", () => {
    render(<ArbolIA arbol={PREDICCION.arbol} />);
    expect(screen.getByText(/¿RSI 14 ≤/)).toHaveTextContent("31,9");
    expect(screen.getByText("← la vela de ahora").parentElement).toHaveTextContent("subió el 66 % de 80");
  });

  it("las características de ahora con su formato", () => {
    render(<Caracteristicas caracteristicas={PREDICCION.caracteristicas} />);
    expect(screen.getByText("−0,12 %")).toBeInTheDocument();
    expect(screen.getByText("31,2")).toBeInTheDocument();
  });
});
