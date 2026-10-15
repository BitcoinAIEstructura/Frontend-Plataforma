import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Orden } from "@/lib/api/simulacion";
import { renderizar, servidorFalso } from "@/test/utilidades";

import { ColaPendientes } from "./ColaPendientes";

afterEach(() => vi.unstubAllGlobals());

function orden(id: number, parcial: Partial<Orden> = {}): Orden {
  return {
    id,
    tipo: "COMPRA",
    monto: 100 * id,
    todo: false,
    estado: "PENDIENTE",
    creadaEn: Date.now(),
    ejecutadaEn: null,
    precioEjecucion: null,
    cantidadBtc: null,
    comision: null,
    motivo: "manual",
    detalle: null,
    ...parcial,
  };
}

const COLA = [orden(1), orden(2, { tipo: "VENTA", todo: true, monto: null, motivo: "señal del bot: x" })];

describe("ColaPendientes", () => {
  it("muestra la cola en orden, la primera marcada como la que sigue", () => {
    renderizar(<ColaPendientes cola={COLA} botActivo={false} />);
    const filas = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(filas[0]).toHaveTextContent("1º · sigue");
    expect(filas[0]).toHaveTextContent("▲ Compra100,00 USDT");
    expect(filas[1]).toHaveTextContent("2º");
    expect(filas[1]).toHaveTextContent("todo el BTC");
    expect(filas[1]).toHaveTextContent("El bot");
    expect(screen.getByText("2 en espera")).toBeInTheDocument();
  });

  it("ejecutar la siguiente muestra el resultado del backend", async () => {
    const fetch = servidorFalso({
      "POST /api/ordenes/procesar": {
        estado: 200,
        cuerpo: orden(1, { estado: "EJECUTADA", detalle: "Compró 0.00120000 BTC a 83000.00" }),
      },
    });
    renderizar(<ColaPendientes cola={COLA} botActivo={false} />);
    await userEvent.click(screen.getByRole("button", { name: "Ejecutar siguiente" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Orden #1 ✓EjecutadaCompró 0.00120000 BTC");
    expect(fetch).toHaveBeenCalledWith("/api/ordenes/procesar", expect.objectContaining({ method: "POST" }));
  });

  it("cancelar una orden pide confirmar y después llama a DELETE con su id", async () => {
    const fetch = servidorFalso({
      "DELETE /api/ordenes/2": { estado: 200, cuerpo: orden(2, { estado: "CANCELADA" }) },
    });
    renderizar(<ColaPendientes cola={COLA} botActivo={false} />);
    await userEvent.click(screen.getByRole("button", { name: "Cancelar la orden #2" }));
    const ventana = screen.getByRole("alertdialog", { name: "¿Cancelar esta orden?" });
    expect(ventana).toHaveTextContent("la venta #2 de todo el BTC");
    expect(fetch).not.toHaveBeenCalled();
    // «No, volver» no hace nada.
    await userEvent.click(within(ventana).getByRole("button", { name: "No, volver" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(fetch).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Cancelar la orden #2" }));
    await userEvent.click(screen.getByRole("button", { name: "Sí, cancelar la orden" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Cancelada");
    expect(fetch).toHaveBeenCalledWith("/api/ordenes/2", expect.objectContaining({ method: "DELETE" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("deshacer la última dice cuál es y pide confirmar", async () => {
    const fetch = servidorFalso({
      "POST /api/ordenes/deshacer": { estado: 409, cuerpo: { error: "No hay una orden reciente" } },
    });
    renderizar(<ColaPendientes cola={[orden(1), orden(3)]} botActivo={false} />);
    await userEvent.click(screen.getByRole("button", { name: "↶ Deshacer última" }));
    const ventana = screen.getByRole("alertdialog", { name: "¿Deshacer la última orden?" });
    expect(ventana).toHaveTextContent("la compra #3 de 300,00 USDT");
    await userEvent.click(within(ventana).getByRole("button", { name: "Sí, deshacer" }));
    // Si falla, el error se ve dentro de la ventana, que sigue abierta.
    expect(await within(ventana).findByRole("alert")).toHaveTextContent("No hay una orden reciente");
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("Ctrl + Z pregunta antes de deshacer la última, pero no mientras se escribe", async () => {
    const fetch = servidorFalso({
      "POST /api/ordenes/deshacer": { estado: 200, cuerpo: orden(2, { estado: "CANCELADA" }) },
    });
    renderizar(
      <>
        <input aria-label="Monto" />
        <ColaPendientes cola={COLA} botActivo={false} />
      </>,
    );
    await userEvent.click(screen.getByLabelText("Monto"));
    await userEvent.keyboard("{Control>}z{/Control}");
    expect(fetch).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText("2 en espera"));
    await userEvent.keyboard("{Control>}z{/Control}");
    expect(fetch).not.toHaveBeenCalled(); // primero pregunta
    await userEvent.click(screen.getByRole("button", { name: "Sí, deshacer" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Orden #2");
    expect(fetch).toHaveBeenCalledWith("/api/ordenes/deshacer", expect.objectContaining({ method: "POST" }));
  });

  it("los errores del backend se muestran (por ejemplo, la cola vacía)", async () => {
    servidorFalso({
      "POST /api/ordenes/procesar": { estado: 409, cuerpo: { error: "No hay órdenes pendientes" } },
    });
    renderizar(<ColaPendientes cola={COLA} botActivo />);
    expect(screen.getByText(/Tu bot las ejecuta cada vez que revisa el mercado/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Ejecutar siguiente" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No hay órdenes pendientes");
  });

  it("sin pendientes lo dice y deshabilita las acciones", () => {
    renderizar(<ColaPendientes cola={[]} botActivo={false} />);
    expect(screen.getByText(/No hay órdenes esperando/)).toBeInTheDocument();
    expect(screen.getByText(/se activan cuando hay órdenes/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ejecutar siguiente" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "↶ Deshacer última" })).toBeDisabled();
  });
});
