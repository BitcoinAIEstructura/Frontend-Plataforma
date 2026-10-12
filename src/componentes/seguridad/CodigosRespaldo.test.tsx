import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CodigosRespaldo, textoParaGuardar } from "./CodigosRespaldo";

const CODIGOS = ["ABCDE-FGHIJ", "KLMNP-QRSTU"];

describe("CodigosRespaldo", () => {
  it("muestra todos los códigos", () => {
    render(<CodigosRespaldo codigos={CODIGOS} alTerminar={vi.fn()} />);
    const lista = screen.getByRole("list", { name: "Códigos de respaldo" });
    expect(
      within(lista)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(CODIGOS);
  });

  it("solo deja terminar después de copiarlos o descargarlos", async () => {
    const user = userEvent.setup();
    const alTerminar = vi.fn();
    render(<CodigosRespaldo codigos={CODIGOS} alTerminar={alTerminar} />);
    const listo = screen.getByRole("button", { name: "Ya los guardé" });
    expect(listo).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Copiar" }));
    expect(await navigator.clipboard.readText()).toBe(textoParaGuardar(CODIGOS));
    expect(screen.getByRole("button", { name: "Copiados ✓" })).toBeInTheDocument();
    await user.click(listo);
    expect(alTerminar).toHaveBeenCalledOnce();
  });

  it("si el navegador niega copiar, lo dice y no los da por guardados", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValueOnce(
      new DOMException("denegado", "NotAllowedError"),
    );
    render(<CodigosRespaldo codigos={CODIGOS} alTerminar={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Copiar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Descargar .txt");
    expect(screen.getByRole("button", { name: "Ya los guardé" })).toBeDisabled();
  });

  it("el texto guardado explica qué son y advierte no compartirlos", () => {
    const texto = textoParaGuardar(CODIGOS);
    expect(texto).toContain("sirve una sola vez");
    expect(texto).toContain("no los compartas");
    expect(texto).toContain("KLMNP-QRSTU");
  });
});
