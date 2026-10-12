import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso } from "@/test/utilidades";

import { PaletaBusqueda } from "./PaletaBusqueda";

const navegacion = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => navegacion }));

afterEach(() => {
  vi.unstubAllGlobals();
  navegacion.push.mockClear();
});

function servidor() {
  return servidorFalso({
    "GET /api/buscar": {
      estado: 200,
      cuerpo: {
        consulta: "ord",
        resultados: [
          {
            id: "ordenes",
            titulo: "Órdenes",
            descripcion: "Comprar y vender",
            ruta: "/ordenes",
            tipo: "pagina",
          },
          {
            id: "cola",
            titulo: "Cola (FIFO)",
            descripcion: "Orden de llegada",
            ruta: "/como-funciona#cola",
            tipo: "concepto",
          },
        ],
        palabrasIndexadas: 222,
        nodosTrie: 886,
      },
    },
  });
}

describe("PaletaBusqueda", () => {
  it("Ctrl + K la abre con sugerencias y Esc la cierra", async () => {
    servidor();
    renderizar(<PaletaBusqueda />);
    await userEvent.keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("dialog", { name: "Buscar en Nexabit" })).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveFocus();
    expect(screen.getAllByRole("option")).toHaveLength(4);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("busca mientras se escribe y Enter abre el resultado elegido con las flechas", async () => {
    const fetch = servidor();
    renderizar(<PaletaBusqueda />);
    await userEvent.click(screen.getByRole("button", { name: /Buscar/ }));
    await userEvent.type(screen.getByRole("combobox"), "ord");
    expect(await screen.findByText("Cola (FIFO)")).toBeInTheDocument();
    expect(screen.getByText(/Trie de 222 palabras en 886 nodos/)).toBeInTheDocument();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Enter}");
    expect(navegacion.push).toHaveBeenCalledWith("/como-funciona#cola");
    expect(screen.queryByRole("dialog")).toBeNull();
    // Se esperó a que dejara de escribir: una sola búsqueda, no una por letra.
    await waitFor(() =>
      expect(fetch.mock.calls.map((c) => String(c[0]))).toEqual(["/api/buscar?q=ord&limite=8"]),
    );
  });

  it("sin resultados lo dice", async () => {
    servidorFalso({
      "GET /api/buscar": {
        estado: 200,
        cuerpo: { consulta: "zz", resultados: [], palabrasIndexadas: 1, nodosTrie: 1 },
      },
    });
    renderizar(<PaletaBusqueda />);
    await userEvent.keyboard("{Control>}k{/Control}");
    await userEvent.type(screen.getByRole("combobox"), "zz");
    expect(await screen.findByText("Nada empieza por «zz».")).toBeInTheDocument();
  });
});
