import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CLAVE_USUARIO } from "@/lib/hooks/useSesion";
import { clienteDePrueba, renderizar, USUARIO_PRUEBA } from "@/test/utilidades";

import { AvisoDosPasos } from "./Bienvenida";

function conUsuario(verificacionDosPasos: boolean) {
  const cliente = clienteDePrueba();
  cliente.setQueryData(CLAVE_USUARIO, { ...USUARIO_PRUEBA, verificacionDosPasos });
  return cliente;
}

describe("AvisoDosPasos", () => {
  it("sin verificación en dos pasos invita a activarla", () => {
    renderizar(<AvisoDosPasos />, { cliente: conUsuario(false) });
    expect(screen.getByText(/Protege tu cuenta/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Activarla ahora" })).toHaveAttribute("href", "/seguridad");
  });

  it("con la verificación activa no insiste", () => {
    renderizar(<AvisoDosPasos />, { cliente: conUsuario(true) });
    expect(screen.queryByRole("link", { name: "Activarla ahora" })).toBeNull();
  });
});
