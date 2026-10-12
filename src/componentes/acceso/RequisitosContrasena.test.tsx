import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RequisitosContrasena } from "./RequisitosContrasena";

describe("RequisitosContrasena", () => {
  it("vacía: todo pendiente y sin fortaleza", () => {
    render(<RequisitosContrasena contrasena="" datosPersonales={[]} />);
    expect(screen.getByRole("meter", { name: "Fortaleza de la contraseña" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    expect(screen.getAllByText(/: pendiente/)).toHaveLength(4);
  });

  it("una contraseña fuerte cumple todo y es Excelente", () => {
    render(<RequisitosContrasena contrasena="Luna-Roja-2026" datosPersonales={["Ana"]} />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "Excelente");
    expect(screen.getAllByText(/: cumplido/)).toHaveLength(4);
  });

  it("marca como pendiente el requisito de datos personales", () => {
    render(<RequisitosContrasena contrasena="Santiago#2026x" datosPersonales={["Santiago"]} />);
    const personal = screen.getByText("Sin tu nombre, correo ni documento");
    expect(personal).toHaveTextContent(": pendiente");
  });
});
