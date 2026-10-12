import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CLAVE_USUARIO } from "@/lib/hooks/useSesion";
import { CLAVES } from "@/lib/tiempoReal";
import { clienteDePrueba, renderizar, USUARIO_PRUEBA } from "@/test/utilidades";

import { Bienvenida } from "./Bienvenida";

function conUsuario(verificacionDosPasos: boolean, comisionesPagadas = 0) {
  const cliente = clienteDePrueba();
  cliente.setQueryData(CLAVE_USUARIO, { ...USUARIO_PRUEBA, verificacionDosPasos });
  // Solo importa si ya pagó comisiones (= ya operó); staleTime evita que se pida de nuevo.
  cliente.setQueryDefaults(CLAVES.cartera, { staleTime: Infinity });
  cliente.setQueryData(CLAVES.cartera, { comisionesPagadas });
  return cliente;
}

describe("Bienvenida", () => {
  it("saluda por el nombre y recuerda el saldo de práctica", () => {
    renderizar(<Bienvenida />, { cliente: conUsuario(true) });
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Hola, Ana");
    expect(screen.getByText("10.000 USDT")).toBeInTheDocument();
  });

  it("si es nuevo invita a la primera orden; si ya operó, resume", () => {
    const { unmount } = renderizar(<Bienvenida />, { cliente: conUsuario(true) });
    expect(screen.getByRole("link", { name: "Hacer mi primera orden" })).toHaveAttribute("href", "/ordenes");
    unmount();
    renderizar(<Bienvenida />, { cliente: conUsuario(true, 10) });
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Así va tu cartera hoy.");
    expect(screen.getByRole("link", { name: "Nueva orden" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver el mercado" })).toHaveAttribute("href", "/mercado");
  });

  it("sin verificación en dos pasos invita a activarla", () => {
    renderizar(<Bienvenida />, { cliente: conUsuario(false) });
    expect(screen.getByRole("link", { name: "Activarla ahora" })).toHaveAttribute("href", "/seguridad");
  });

  it("con la verificación activa no insiste", () => {
    renderizar(<Bienvenida />, { cliente: conUsuario(true) });
    expect(screen.queryByRole("link", { name: "Activarla ahora" })).toBeNull();
  });
});
