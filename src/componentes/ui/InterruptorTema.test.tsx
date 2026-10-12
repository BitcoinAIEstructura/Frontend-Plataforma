import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CLAVE_TEMA, InterruptorTema, SCRIPT_TEMA } from "./InterruptorTema";

afterEach(() => {
  document.documentElement.dataset.theme = "oscuro";
  localStorage.clear();
});

describe("InterruptorTema", () => {
  it("alterna el tema, lo guarda y avisa a las gráficas", async () => {
    const aviso = vi.fn();
    window.addEventListener("nexabit:tema", aviso);
    render(<InterruptorTema />);
    await userEvent.click(screen.getByRole("button", { name: "Cambiar al tema claro" }));
    expect(document.documentElement.dataset.theme).toBe("claro");
    expect(localStorage.getItem(CLAVE_TEMA)).toBe("claro");
    expect(aviso).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: "Cambiar al tema oscuro" }));
    expect(document.documentElement.dataset.theme).toBe("oscuro");
    window.removeEventListener("nexabit:tema", aviso);
  });

  it("el script previo aplica el tema guardado y ignora valores raros", () => {
    localStorage.setItem(CLAVE_TEMA, "claro");
    new Function(SCRIPT_TEMA)();
    expect(document.documentElement.dataset.theme).toBe("claro");
    document.documentElement.dataset.theme = "oscuro";
    localStorage.setItem(CLAVE_TEMA, "<script>");
    new Function(SCRIPT_TEMA)();
    expect(document.documentElement.dataset.theme).toBe("oscuro");
  });
});
