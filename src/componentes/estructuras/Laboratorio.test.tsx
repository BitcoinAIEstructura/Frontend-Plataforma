import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso } from "@/test/utilidades";

import { FICHAS } from "./catalogo";
import { Laboratorio, leerValor } from "./Laboratorio";

afterEach(() => vi.unstubAllGlobals());

const COLA = FICHAS.find((f) => f.id === "cola")!;

/** Un backend falso que simula una cola de verdad con las operaciones recibidas. */
function backendDeCola() {
  const cuerpos: { operaciones: { operacion: string; valor?: number }[] }[] = [];
  servidorFalso({
    "POST /api/estructuras/demo": (cuerpo) => {
      const pedido = cuerpo as (typeof cuerpos)[number];
      cuerpos.push(pedido);
      const cola: number[] = [];
      const pasos = pedido.operaciones.map((op) => {
        let resultado: number | null = null;
        if (op.operacion === "encolar") cola.push(op.valor!);
        else resultado = cola.shift() ?? null;
        return {
          operacion: op.operacion,
          valor: op.valor ?? null,
          resultado,
          descripcion: op.operacion === "encolar" ? `${op.valor} entra por el final.` : `Sale ${resultado}.`,
          complejidad: "O(1)",
          estado: { elementos: [...cola] },
        };
      });
      return { estado: 200, cuerpo: { estructura: "cola", pasos } };
    },
  });
  return cuerpos;
}

describe("Laboratorio", () => {
  it("leerValor acepta enteros o palabras según la estructura", () => {
    expect(leerValor(" 42 ", "numero")).toBe(42);
    expect(leerValor("-7", "numero")).toBe(-7);
    expect(leerValor("4.5", "numero")).toBeNull();
    expect(leerValor("órdenes", "palabra")).toBe("órdenes");
    expect(leerValor("dos palabras", "palabra")).toBeNull();
  });

  it("cada operación manda todas las anteriores y muestra el último paso", async () => {
    const cuerpos = backendDeCola();
    renderizar(<Laboratorio ficha={COLA} />);
    const casilla = screen.getByLabelText("Número");
    await userEvent.type(casilla, "5{Enter}");
    await userEvent.type(casilla, "8{Enter}");
    await userEvent.click(screen.getByRole("button", { name: "Desencolar" }));
    expect(await screen.findByText("Sale 5.")).toBeInTheDocument();
    expect(screen.getByText("Paso 3 de 3")).toBeInTheDocument();
    expect(cuerpos.at(-1)?.operaciones).toEqual([
      { operacion: "encolar", valor: 5 },
      { operacion: "encolar", valor: 8 },
      { operacion: "desencolar" },
    ]);
  });

  it("se puede volver a un paso anterior", async () => {
    backendDeCola();
    renderizar(<Laboratorio ficha={COLA} />);
    await userEvent.click(screen.getByRole("button", { name: "Ejemplo" }));
    expect(await screen.findByText("Paso 4 de 4")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Paso anterior" }));
    expect(screen.getByText("Paso 3 de 4")).toBeInTheDocument();
    expect(screen.getByText("750 entra por el final.")).toBeInTheDocument();
  });

  it("un valor inválido se avisa sin llamar al servidor", async () => {
    const cuerpos = backendDeCola();
    renderizar(<Laboratorio ficha={COLA} />);
    await userEvent.type(screen.getByLabelText("Número"), "abc{Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent("número entero");
    await waitFor(() => expect(cuerpos).toHaveLength(0));
  });

  it("reiniciar vuelve a empezar", async () => {
    backendDeCola();
    renderizar(<Laboratorio ficha={COLA} />);
    await userEvent.click(screen.getByRole("button", { name: "Ejemplo" }));
    await screen.findByText("Paso 4 de 4");
    await userEvent.click(screen.getByRole("button", { name: "Reiniciar" }));
    expect(screen.getByText(/toca/)).toBeInTheDocument();
  });
});
