import { act, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CLAVES } from "@/lib/tiempoReal";
import { clienteDePrueba, renderizar } from "@/test/utilidades";

import { PrecioEnVivo } from "./PrecioEnVivo";

function conPrecio(precio: number) {
  const cliente = clienteDePrueba();
  cliente.setQueryData(CLAVES.precio, { simbolo: "BTCUSDT", precio, momento: 1 });
  return cliente;
}

describe("PrecioEnVivo", () => {
  it("muestra el precio y la variación con ícono", () => {
    renderizar(<PrecioEnVivo referencia={80000} />, { cliente: conPrecio(84000) });
    expect(screen.getByText(/84\.000,00/)).toBeInTheDocument();
    expect(screen.getByText("▲ +5,00 %")).toBeInTheDocument();
    expect(screen.getByText("Conectando…")).toBeInTheDocument();
  });

  it("late en el color de la subida o la bajada cuando cambia", async () => {
    const cliente = conPrecio(84000);
    renderizar(<PrecioEnVivo />, { cliente });
    await act(async () =>
      cliente.setQueryData(CLAVES.precio, { simbolo: "BTCUSDT", precio: 83000, momento: 2 }),
    );
    expect(await screen.findByText(/83\.000,00/)).toHaveClass("latido-baja");
    await act(async () =>
      cliente.setQueryData(CLAVES.precio, { simbolo: "BTCUSDT", precio: 83500, momento: 3 }),
    );
    expect(await screen.findByText(/83\.500,00/)).toHaveClass("latido-sube");
  });
});
