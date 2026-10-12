import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Boton, clasesBoton } from "./Boton";

describe("Boton", () => {
  it("es un botón normal (no envía formularios por accidente) y responde al clic", async () => {
    const alHacerClic = vi.fn();
    render(<Boton onClick={alHacerClic}>Invertir</Boton>);
    const boton = screen.getByRole("button", { name: "Invertir" });
    expect(boton).toHaveAttribute("type", "button");
    await userEvent.click(boton);
    expect(alHacerClic).toHaveBeenCalledOnce();
  });

  it("mientras carga queda deshabilitado y lo anuncia", async () => {
    const alHacerClic = vi.fn();
    render(
      <Boton cargando onClick={alHacerClic}>
        Entrar
      </Boton>,
    );
    const boton = screen.getByRole("button", { name: "Entrar" });
    expect(boton).toBeDisabled();
    expect(boton).toHaveAttribute("aria-busy", "true");
    await userEvent.click(boton);
    expect(alHacerClic).not.toHaveBeenCalled();
  });

  it("puede enviar un formulario si se le pide", () => {
    render(<Boton type="submit">Crear cuenta</Boton>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("un enlace puede verse igual que un botón", () => {
    render(
      <a href="/ordenes" className={clasesBoton("contorno", true)}>
        Ir
      </a>,
    );
    expect(screen.getByRole("link")).toHaveClass("min-h-11", "border-oro/50", "w-full");
  });
});
