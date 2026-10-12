import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import type { TipoDocumento } from "@/lib/api/cuentas";

import { SelectorDocumento } from "./SelectorDocumento";

function Envoltorio() {
  const [tipo, setTipo] = useState<TipoDocumento>("CC");
  return (
    <>
      <SelectorDocumento valor={tipo} alCambiar={setTipo} />
      <output>{tipo}</output>
    </>
  );
}

describe("SelectorDocumento", () => {
  it("es un grupo de opciones con nombre y empieza en CC", () => {
    render(<Envoltorio />);
    expect(screen.getByRole("group", { name: "Tipo de documento" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Cédula de ciudadanía/ })).toBeChecked();
  });

  it("se cambia con clic y con el teclado", async () => {
    render(<Envoltorio />);
    await userEvent.click(screen.getByRole("radio", { name: /Cédula de extranjería/ }));
    expect(screen.getByRole("status")).toHaveTextContent("CE");
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("status")).toHaveTextContent("CC");
  });
});
