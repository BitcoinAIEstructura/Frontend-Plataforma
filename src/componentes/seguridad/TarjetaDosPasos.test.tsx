import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso, USUARIO_PRUEBA } from "@/test/utilidades";

import { agruparSecreto, TarjetaDosPasos } from "./TarjetaDosPasos";

afterEach(() => vi.unstubAllGlobals());

const URI =
  "otpauth://totp/BitcoinAI%3Aana%40correo.co?secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP&issuer=BitcoinAI";
const CODIGOS = Array.from({ length: 10 }, (_, i) => `AAAA${i}-BBBB${i}`);

describe("TarjetaDosPasos", () => {
  it("agrupa el secreto de a 4", () => {
    expect(agruparSecreto("JBSWY3DPEHPK3PXP")).toBe("JBSW Y3DP EHPK 3PXP");
  });

  it("activación completa: QR, código, códigos de respaldo", async () => {
    const user = userEvent.setup();
    servidorFalso({
      "POST /api/cuentas/dos-pasos": { estado: 200, cuerpo: { secreto: "JBSWY3DPEHPK3PXP", uri: URI } },
      "POST /api/cuentas/dos-pasos/confirmar": (cuerpo) =>
        (cuerpo as { codigo: string }).codigo === "123456"
          ? { estado: 200, cuerpo: { codigosRespaldo: CODIGOS } }
          : { estado: 401, cuerpo: { error: "El código no es válido o ya se usó" } },
    });
    renderizar(<TarjetaDosPasos usuario={USUARIO_PRUEBA} />);
    expect(screen.getByText("Sin activar")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Activar con Google Authenticator" }));

    expect(await screen.findByTitle("Código QR para la app de autenticación")).toBeInTheDocument();
    expect(screen.getByText("JBSW Y3DP EHPK 3PXP")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Código de 6 dígitos de la app"), "000000");
    await user.click(screen.getByRole("button", { name: "Activar" }));
    expect(await screen.findByText("El código no es válido o ya se usó")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Código de 6 dígitos de la app"), "123456");
    await user.click(screen.getByRole("button", { name: "Activar" }));
    expect(await screen.findByRole("list", { name: "Códigos de respaldo" })).toHaveTextContent("AAAA0-BBBB0");
  });

  it("con la verificación activa permite regenerar y desactivar", async () => {
    const user = userEvent.setup();
    const servidor = servidorFalso({
      "POST /api/cuentas/dos-pasos/codigos": { estado: 200, cuerpo: { codigosRespaldo: CODIGOS } },
      "POST /api/cuentas/dos-pasos/desactivar": { estado: 204 },
    });
    renderizar(<TarjetaDosPasos usuario={{ ...USUARIO_PRUEBA, verificacionDosPasos: true }} />);
    expect(screen.getByText("✓ Activa")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Nuevos códigos de respaldo" }));
    await user.type(screen.getByLabelText("Código de la app o de respaldo"), "654321");
    await user.click(screen.getByRole("button", { name: "Generar nuevos" }));
    expect(await screen.findByRole("list", { name: "Códigos de respaldo" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Copiar" }));
    await user.click(screen.getByRole("button", { name: "Ya los guardé" }));

    await user.click(screen.getByRole("button", { name: "Desactivar" }));
    await user.type(screen.getByLabelText("Contraseña"), "Luna-Roja-2026");
    await user.type(screen.getByLabelText("Código de la app o de respaldo"), "111111");
    await user.click(screen.getByRole("button", { name: "Desactivar verificación" }));
    await waitFor(() =>
      expect(servidor.mock.calls.some(([ruta]) => ruta === "/api/cuentas/dos-pasos/desactivar")).toBe(true),
    );
    const llamada = servidor.mock.calls.find(([ruta]) => ruta === "/api/cuentas/dos-pasos/desactivar")!;
    expect(JSON.parse(String(llamada[1]?.body))).toEqual({ contrasena: "Luna-Roja-2026", codigo: "111111" });
  });
});
