import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Orden } from "@/lib/api/simulacion";

import { EtiquetaEstado, montoOrden, origenOrden, TipoOrden } from "./textos";

describe("textos de órdenes", () => {
  it("el estado lleva ícono y palabra", () => {
    render(<EtiquetaEstado estado="RECHAZADA" />);
    expect(screen.getByText("Rechazada")).toHaveTextContent("!Rechazada");
  });

  it("el tipo lleva flecha", () => {
    render(<TipoOrden tipo="VENTA" />);
    expect(screen.getByText("▼ Venta")).toHaveClass("text-baja");
  });

  it("monto y origen en palabras", () => {
    expect(montoOrden({ monto: 500, todo: false } as Orden)).toBe("500,00 USDT");
    expect(montoOrden({ monto: null, todo: true } as Orden)).toBe("todo el BTC");
    expect(origenOrden("manual")).toBe("Tú");
    expect(origenOrden("señal del bot: gana COMPRAR")).toBe("El bot");
    expect(origenOrden("stop-loss: cayó 5 %")).toBe("Stop-loss");
    expect(origenOrden("tomo ganancias")).toBe("tomo ganancias");
  });
});
