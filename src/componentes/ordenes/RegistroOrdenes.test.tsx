import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { Orden } from "@/lib/api/simulacion";

import { RegistroOrdenes } from "./RegistroOrdenes";

function orden(id: number, estado: Orden["estado"], parcial: Partial<Orden> = {}): Orden {
  return {
    id,
    tipo: "COMPRA",
    monto: 500,
    todo: false,
    estado,
    creadaEn: 1791433083000,
    ejecutadaEn: estado === "EJECUTADA" ? 1791433083120 : null,
    precioEjecucion: estado === "EJECUTADA" ? 82937.59 : null,
    cantidadBtc: estado === "EJECUTADA" ? 0.00602260084962681 : null,
    comision: estado === "EJECUTADA" ? 0.5 : null,
    motivo: "manual",
    detalle: estado === "RECHAZADA" ? "Saldo insuficiente: tienes 10.00 USDT." : null,
    ...parcial,
  };
}

describe("RegistroOrdenes", () => {
  it("una ejecutada muestra BTC, precio y comisión; una rechazada, el motivo", () => {
    render(<RegistroOrdenes registro={[orden(2, "RECHAZADA"), orden(1, "EJECUTADA")]} />);
    const [rechazada, ejecutada] = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(rechazada).toHaveTextContent("Saldo insuficiente");
    expect(ejecutada).toHaveTextContent("0,0060226 BTC a 82.937,59 · comisión 0,50 USDT");
  });

  it("filtra por estado", async () => {
    render(
      <RegistroOrdenes registro={[orden(3, "CANCELADA"), orden(2, "RECHAZADA"), orden(1, "EJECUTADA")]} />,
    );
    await userEvent.click(screen.getByRole("radio", { name: "Canceladas" }));
    const filas = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(filas).toHaveLength(1);
    expect(filas[0]).toHaveTextContent("#3");
  });

  it("muestra 10 y deja ver más", async () => {
    const muchas = Array.from({ length: 13 }, (_, i) => orden(13 - i, "EJECUTADA"));
    render(<RegistroOrdenes registro={muchas} />);
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(10);
    await userEvent.click(screen.getByRole("button", { name: "Ver más (3 restantes)" }));
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(13);
  });

  it("vacío lo dice", () => {
    render(<RegistroOrdenes registro={[]} />);
    expect(screen.getByText("Aún no has terminado ninguna orden.")).toBeInTheDocument();
  });
});
