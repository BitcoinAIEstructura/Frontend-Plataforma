import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CLAVE_USUARIO } from "@/lib/hooks/useSesion";
import { clienteDePrueba, renderizar, USUARIO_PRUEBA } from "@/test/utilidades";

import { Bienvenida } from "./Bienvenida";

function conUsuario(verificacionDosPasos: boolean) {
  const cliente = clienteDePrueba();
  cliente.setQueryData(CLAVE_USUARIO, { ...USUARIO_PRUEBA, verificacionDosPasos });
  return cliente;
}

describe("Bienvenida", () => {
  it("saluda por el nombre y recuerda el saldo de práctica", () => {
    renderizar(<Bienvenida />, { cliente: conUsuario(true) });
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Hola, Ana");
    expect(screen.getByText("10 000 USDT")).toBeInTheDocument();
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
