import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Segmentado } from "./Segmentado";

describe("Segmentado", () => {
  it("es un grupo con nombre, marca la opción actual y avisa el cambio", async () => {
    const alCambiar = vi.fn();
    render(
      <Segmentado
        etiqueta="Intervalo"
        valor="1h"
        alCambiar={alCambiar}
        opciones={[
          { valor: "1h", etiqueta: "1 h" },
          { valor: "1d", etiqueta: "1 d" },
        ]}
      />,
    );
    expect(screen.getByRole("group", { name: "Intervalo" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "1 h" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "1 d" }));
    expect(alCambiar).toHaveBeenCalledWith("1d");
  });
});
