import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso, USUARIO_PRUEBA } from "@/test/utilidades";

import { TarjetaContrasena } from "./TarjetaContrasena";

afterEach(() => vi.unstubAllGlobals());

async function llenar(actual: string, nueva: string, confirmacion = nueva) {
  const user = userEvent.setup();
  if (!screen.queryByRole("dialog"))
    await user.click(screen.getByRole("button", { name: "Cambiar contraseña" }));
  await user.type(screen.getByLabelText("Contraseña actual"), actual);
  await user.type(screen.getByLabelText("Contraseña nueva"), nueva);
  await user.type(screen.getByLabelText("Confirma la contraseña nueva"), confirmacion);
  await user.click(screen.getByRole("button", { name: "Guardar la nueva contraseña" }));
}

describe("TarjetaContrasena", () => {
  it("el formulario no ocupa la página: se abre en una ventana y se cierra sin guardar", async () => {
    servidorFalso({});
    renderizar(<TarjetaContrasena usuario={USUARIO_PRUEBA} />);
    expect(screen.queryByLabelText("Contraseña actual")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Cambiar contraseña" }));
    const ventana = screen.getByRole("dialog", { name: "Cambiar la contraseña" });
    expect(screen.getByLabelText("Contraseña actual")).toHaveFocus();
    await userEvent.type(screen.getByLabelText("Contraseña actual"), "algo");
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(ventana).not.toBeInTheDocument();
    // Al volver a abrirla, no queda nada escrito.
    await userEvent.click(screen.getByRole("button", { name: "Cambiar contraseña" }));
    expect(screen.getByLabelText("Contraseña actual")).toHaveValue("");
  });

  it("cambia la contraseña y lo confirma", async () => {
    const servidor = servidorFalso({ "POST /api/cuentas/contrasena": { estado: 204 } });
    renderizar(<TarjetaContrasena usuario={USUARIO_PRUEBA} />);
    await llenar("Luna-Roja-2026", "Sol-Azul-Brillante-9");
    expect(await screen.findByRole("status")).toHaveTextContent("Contraseña cambiada");
    expect(screen.queryByRole("dialog")).toBeNull();
    const llamada = servidor.mock.calls.find(([ruta]) => ruta === "/api/cuentas/contrasena")!;
    expect(JSON.parse(String(llamada[1]?.body))).toEqual({
      contrasenaActual: "Luna-Roja-2026",
      contrasenaNueva: "Sol-Azul-Brillante-9",
    });
  });

  it("no envía si la nueva es débil, igual a la actual o no coincide", async () => {
    const servidor = servidorFalso({});
    renderizar(<TarjetaContrasena usuario={USUARIO_PRUEBA} />);
    await llenar("Luna-Roja-2026", "Luna-Roja-2026");
    expect(screen.getByText("La contraseña nueva debe ser distinta de la actual")).toBeInTheDocument();
    expect(servidor).not.toHaveBeenCalled();
  });

  it("contraseña actual equivocada: lo dice el backend", async () => {
    servidorFalso({
      "POST /api/cuentas/contrasena": { estado: 401, cuerpo: { error: "Correo o contraseña incorrectos" } },
    });
    renderizar(<TarjetaContrasena usuario={USUARIO_PRUEBA} />);
    await llenar("equivocada", "Sol-Azul-Brillante-9");
    expect(await screen.findByText("Correo o contraseña incorrectos")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña actual")).toHaveAttribute("aria-invalid", "true");
  });
});
