import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDesplazarAlAncla } from "./useAncla";

vi.mock("next/navigation", () => ({ usePathname: () => "/mercado" }));

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  window.location.hash = "";
  document.body.innerHTML = "";
});

describe("useDesplazarAlAncla", () => {
  it("espera a que aparezca la sección del enlace y baja hasta ella", () => {
    window.location.hash = "#alertas";
    const { rerender } = renderHook(({ listo }) => useDesplazarAlAncla(listo), {
      initialProps: { listo: false },
    });
    rerender({ listo: true });
    vi.advanceTimersByTime(300);
    const seccion = document.createElement("section");
    seccion.id = "alertas";
    seccion.scrollIntoView = vi.fn();
    document.body.append(seccion);
    vi.advanceTimersByTime(150);
    expect(seccion.scrollIntoView).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(1000);
    expect(seccion.scrollIntoView).toHaveBeenCalledOnce();
  });

  it("sin ancla no hace nada", () => {
    const espiar = vi.spyOn(document, "getElementById");
    renderHook(() => useDesplazarAlAncla(true));
    vi.advanceTimersByTime(500);
    expect(espiar).not.toHaveBeenCalled();
  });
});
