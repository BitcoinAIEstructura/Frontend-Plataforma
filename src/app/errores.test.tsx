import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ErrorDePantalla from "./(app)/error";
import NoEncontrada from "./not-found";

describe("páginas de error", () => {
  it("404 explica y lleva al panel", () => {
    render(<NoEncontrada />);
    expect(screen.getByRole("heading", { name: "Esta página no existe" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al panel" })).toHaveAttribute("href", "/panel");
  });

  it("si una pantalla falla, tranquiliza y deja reintentar", async () => {
    const reset = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorDePantalla error={new Error("x")} reset={reset} />);
    expect(screen.getByText(/Tu cuenta y tu cartera de práctica están bien/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(reset).toHaveBeenCalled();
  });
});
