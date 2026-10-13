import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DURACION_MS, ProveedorAvisos, useAvisos } from "./Avisos";

function Boton({ titulo }: { titulo: string }) {
  const avisar = useAvisos();
  return (
    <button type="button" onClick={() => avisar({ tipo: "alerta", titulo, texto: "El BTC llegó a 90.000" })}>
      avisar {titulo}
    </button>
  );
}

afterEach(() => vi.useRealTimers());

describe("Avisos", () => {
  it("muestra el aviso en una región que se anuncia y se cierra con el botón", async () => {
    render(
      <ProveedorAvisos>
        <Boton titulo="Alerta cumplida" />
      </ProveedorAvisos>,
    );
    await userEvent.click(screen.getByRole("button", { name: "avisar Alerta cumplida" }));
    const region = screen.getByRole("list", { name: "Avisos" });
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveTextContent("Alerta cumplidaEl BTC llegó a 90.000");
    await userEvent.click(screen.getByRole("button", { name: "Cerrar el aviso: Alerta cumplida" }));
    expect(region).toBeEmptyDOMElement();
  });

  it("dos avisos en el mismo instante no se pisan", () => {
    function Doble() {
      const avisar = useAvisos();
      return (
        <button
          type="button"
          onClick={() => {
            avisar({ tipo: "info", titulo: "uno" });
            avisar({ tipo: "info", titulo: "dos" });
          }}
        >
          doble
        </button>
      );
    }
    render(
      <ProveedorAvisos>
        <Doble />
      </ProveedorAvisos>,
    );
    act(() => screen.getByRole("button", { name: "doble" }).click());
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["ℹuno✕", "ℹdos✕"]);
  });

  it("se va solo después de un rato y muestra como máximo 4", () => {
    vi.useFakeTimers();
    render(
      <ProveedorAvisos>
        <Boton titulo="A" />
      </ProveedorAvisos>,
    );
    const boton = screen.getByRole("button", { name: "avisar A" });
    for (let i = 0; i < 6; i++) act(() => boton.click());
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    act(() => vi.advanceTimersByTime(DURACION_MS + 1));
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
