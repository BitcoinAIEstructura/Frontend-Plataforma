import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VistaCircular, VistaCola, VistaEstado, VistaMonticulo, VistaPila, VistaTabla } from "./Vistas";

describe("vistas de las estructuras", () => {
  it("la cola marca frente y final", () => {
    render(<VistaCola elementos={[4, 7, 9]} />);
    const items = within(screen.getByRole("list", { name: "Cola, del frente al final" })).getAllByRole(
      "listitem",
    );
    expect(items[0]).toHaveTextContent("4frente");
    expect(items[2]).toHaveTextContent("9final");
  });

  it("la pila marca el tope y vacía lo dice", () => {
    const { rerender } = render(<VistaPila elementos={[3, 2, 1]} />);
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("tope →3");
    rerender(<VistaPila elementos={[]} />);
    expect(screen.getByText("Vacía")).toBeInTheDocument();
  });

  it("el montículo muestra también su arreglo con casillas libres", () => {
    render(<VistaMonticulo arreglo={[1, 5, 3]} capacidad={4} />);
    const casillas = within(screen.getByRole("list", { name: "Arreglo del montículo" })).getAllByRole(
      "listitem",
    );
    expect(casillas).toHaveLength(4);
    expect(casillas[3]).toHaveTextContent("3");
    expect(screen.getByRole("img", { name: /el menor está en la raíz/ })).toBeInTheDocument();
  });

  it("la tabla hash señala las colisiones", () => {
    render(<VistaTabla capacidad={4} factorCarga={0.75} cubetas={[[], [1, 5], [2], []]} />);
    expect(screen.getByText(/factor de carga 0,75/)).toBeInTheDocument();
    expect(screen.getAllByText("colisión")).toHaveLength(1);
    expect(screen.getAllByText("vacía")).toHaveLength(2);
  });

  it("la cola circular describe el frente para lectores de pantalla", () => {
    render(<VistaCircular capacidad={4} frente={2} tamanio={3} casillas={[8, null, 6, 7]} />);
    expect(screen.getByRole("img", { name: /frente está en la casilla 2/ })).toBeInTheDocument();
    expect(screen.getByText("2 frente")).toBeInTheDocument();
    expect(screen.getByText("0 final")).toBeInTheDocument();
  });

  it("VistaEstado elige la vista según la estructura", () => {
    render(
      <VistaEstado
        estructura="trie"
        estado={{
          raiz: { letra: "", fin: false, hijos: [{ letra: "a", fin: true, hijos: [] }] },
          palabras: 1,
          nodos: 2,
        }}
      />,
    );
    expect(screen.getByText(/1 palabra con 2 nodos/)).toBeInTheDocument();
  });
});
