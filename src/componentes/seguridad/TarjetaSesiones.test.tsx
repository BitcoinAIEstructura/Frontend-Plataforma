import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso } from "@/test/utilidades";

import { TarjetaSesiones } from "./TarjetaSesiones";

afterEach(() => vi.unstubAllGlobals());

const AHORA = Date.now();
const SESIONES = [
  {
    id: 3,
    actual: true,
    ip: "127.0.0.1",
    agente: "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/140 Safari/537.36",
    creadaEn: AHORA - 3_600_000,
    ultimaActividad: AHORA,
    expiraEn: AHORA + 3_600_000,
  },
  {
    id: 1,
    actual: false,
    ip: "190.85.1.2",
    agente: "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36",
    creadaEn: AHORA - 86_400_000,
    ultimaActividad: AHORA - 600_000,
    expiraEn: AHORA + 3_600_000,
  },
];

describe("TarjetaSesiones", () => {
  it("lista los dispositivos y marca el actual", async () => {
    servidorFalso({ "GET /api/cuentas/sesiones": { estado: 200, cuerpo: { sesiones: SESIONES } } });
    renderizar(<TarjetaSesiones />);
    expect(await screen.findByText("Chrome en Android")).toBeInTheDocument();
    expect(screen.getByText("Este dispositivo").closest("p")).toHaveTextContent("Chrome en Windows");
    expect(screen.getByText(/hace 10 minutos/)).toBeInTheDocument();
    // La sesión actual no tiene botón para cerrarla (para eso está "Cerrar sesión").
    expect(screen.getAllByRole("button", { name: /Cerrar la sesión de/ })).toHaveLength(1);
  });

  it("cierra una sesión y la de todos los demás", async () => {
    const user = userEvent.setup();
    const servidor = servidorFalso({
      "GET /api/cuentas/sesiones": { estado: 200, cuerpo: { sesiones: SESIONES } },
      "DELETE /api/cuentas/sesiones/1": { estado: 204 },
      "POST /api/cuentas/sesiones/cerrar-otras": { estado: 200, cuerpo: { cerradas: 1 } },
    });
    renderizar(<TarjetaSesiones />);
    await user.click(await screen.findByRole("button", { name: "Cerrar la sesión de Chrome en Android" }));
    await user.click(screen.getByRole("button", { name: "Cerrar las demás" }));
    await waitFor(() => {
      const rutas = servidor.mock.calls.map(([ruta, opciones]) => `${opciones?.method ?? "GET"} ${ruta}`);
      expect(rutas).toContain("DELETE /api/cuentas/sesiones/1");
      expect(rutas).toContain("POST /api/cuentas/sesiones/cerrar-otras");
    });
  });
});
