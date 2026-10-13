import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PREDICCION } from "@/test/prediccion";
import { renderizar, servidorFalso } from "@/test/utilidades";

import { PantallaIA } from "./PantallaIA";

afterEach(() => vi.unstubAllGlobals());

describe("PantallaIA", () => {
  it("avisa que está entrenando y luego muestra comité, modelos, evaluación y árbol", async () => {
    servidorFalso({ "GET /api/ia/predicciones": { estado: 200, cuerpo: PREDICCION } });
    renderizar(<PantallaIA />);
    expect(screen.getByRole("status")).toHaveTextContent("Entrenando los tres modelos");
    expect(await screen.findByRole("region", { name: "Lo que cree el comité" })).toBeInTheDocument();
    for (const nombre of ["Regresión logística", "Árbol de decisión", "k vecinos"]) {
      expect(screen.getByRole("region", { name: nombre })).toBeInTheDocument();
    }
    expect(screen.getByRole("region", { name: "¿Cómo le fue con datos que no vio?" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "El árbol por dentro" })).toBeInTheDocument();
    expect(screen.getByText(/No es asesoría financiera/)).toBeInTheDocument();
  });

  it("cambiar el intervalo pide esas velas", async () => {
    const fetch = servidorFalso({ "GET /api/ia/predicciones": { estado: 200, cuerpo: PREDICCION } });
    renderizar(<PantallaIA />);
    await screen.findByRole("region", { name: "Lo que cree el comité" });
    await userEvent.click(screen.getByRole("radio", { name: "1 día" }));
    await waitFor(() =>
      expect(fetch.mock.calls.map((c) => String(c[0]))).toContain("/api/ia/predicciones?intervalo=1d"),
    );
  });
});
