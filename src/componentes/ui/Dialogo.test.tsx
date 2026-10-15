import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Confirmar, Dialogo } from "./Dialogo";

function ConBoton() {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <button onClick={() => setAbierto(true)}>Abrir</button>
      <Dialogo abierto={abierto} alCerrar={() => setAbierto(false)} titulo="Ventana" descripcion="Algo">
        <input aria-label="Casilla" />
        <button>Listo</button>
      </Dialogo>
    </>
  );
}

describe("Dialogo", () => {
  it("abre con el foco adentro, no deja salir con Tab y Escape lo cierra", async () => {
    render(<ConBoton />);
    const abrir = screen.getByRole("button", { name: "Abrir" });
    await userEvent.click(abrir);
    const dialogo = screen.getByRole("dialog", { name: "Ventana" });
    expect(dialogo).toHaveAccessibleDescription("Algo");
    expect(screen.getByLabelText("Casilla")).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Listo" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByLabelText("Casilla")).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(abrir).toHaveFocus();
  });
});

describe("Confirmar", () => {
  it("empieza en «No, volver» y solo confirma con el botón de confirmar", async () => {
    const alConfirmar = vi.fn();
    const alCancelar = vi.fn();
    render(
      <Confirmar
        abierto
        titulo="¿Cancelar la orden?"
        descripcion="No se puede deshacer."
        confirmar="Sí, cancelar"
        alConfirmar={alConfirmar}
        alCancelar={alCancelar}
      />,
    );
    expect(screen.getByRole("alertdialog", { name: "¿Cancelar la orden?" })).toBeInTheDocument();
    const volver = screen.getByRole("button", { name: "No, volver" });
    expect(volver).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(alCancelar).toHaveBeenCalledOnce();
    expect(alConfirmar).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Sí, cancelar" }));
    expect(alConfirmar).toHaveBeenCalledOnce();
  });

  it("mientras espera no se cierra y muestra el error si falla", async () => {
    const alCancelar = vi.fn();
    render(
      <Confirmar
        abierto
        titulo="¿Seguro?"
        descripcion="x"
        confirmar="Sí"
        alConfirmar={vi.fn()}
        alCancelar={alCancelar}
        cargando
        error="No se pudo"
      />,
    );
    await userEvent.keyboard("{Escape}");
    expect(alCancelar).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo");
  });
});
