import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Campo } from "./Campo";

describe("Campo", () => {
  it("la etiqueta nombra la casilla y la ayuda la describe", () => {
    render(<Campo etiqueta="Correo" type="email" ayuda="Te escribiremos solo por seguridad" />);
    const casilla = screen.getByLabelText("Correo");
    expect(casilla).toHaveAttribute("type", "email");
    expect(casilla).toHaveAccessibleDescription("Te escribiremos solo por seguridad");
    expect(casilla).not.toHaveAttribute("aria-invalid");
  });

  it("con error queda marcada como inválida y lo anuncia", () => {
    render(<Campo etiqueta="Teléfono" error="El teléfono no es válido" />);
    const casilla = screen.getByLabelText("Teléfono");
    expect(casilla).toHaveAttribute("aria-invalid", "true");
    expect(casilla).toHaveAccessibleDescription("El teléfono no es válido");
    expect(screen.getByRole("alert")).toHaveTextContent("El teléfono no es válido");
  });

  it("una contraseña revelable se puede mostrar y ocultar", async () => {
    render(<Campo etiqueta="Contraseña" revelable />);
    const casilla = screen.getByLabelText("Contraseña");
    expect(casilla).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByRole("button", { name: "Mostrar" }));
    expect(casilla).toHaveAttribute("type", "text");
    await userEvent.click(screen.getByRole("button", { name: "Ocultar" }));
    expect(casilla).toHaveAttribute("type", "password");
  });
});
