import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso, USUARIO_PRUEBA } from "@/test/utilidades";

import { FormularioInicio } from "./FormularioInicio";

const navegacion = vi.hoisted(() => ({
  replace: vi.fn(),
  siguiente: null as string | null,
  motivo: null as string | null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navegacion.replace, push: vi.fn() }),
  useSearchParams: () =>
    new URLSearchParams({
      ...(navegacion.siguiente ? { siguiente: navegacion.siguiente } : {}),
      ...(navegacion.motivo ? { motivo: navegacion.motivo } : {}),
    }),
}));

beforeEach(() => {
  navegacion.replace.mockReset();
  navegacion.siguiente = null;
  navegacion.motivo = null;
});
afterEach(() => vi.unstubAllGlobals());

async function escribirCredenciales(correo = "ana@correo.co", contrasena = "Luna-Roja-2026") {
  await userEvent.type(screen.getByLabelText("Correo"), correo);
  await userEvent.type(screen.getByLabelText("Contraseña"), contrasena);
  await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("FormularioInicio", () => {
  it("explica si la sesión se cerró por inactividad", () => {
    navegacion.motivo = "inactividad";
    renderizar(<FormularioInicio />);
    expect(screen.getByRole("status")).toHaveTextContent("no la usaste por un rato");
  });

  it("con credenciales correctas entra y va al destino pedido", async () => {
    navegacion.siguiente = "/cartera";
    const servidor = servidorFalso({
      "POST /api/sesion": { estado: 200, cuerpo: { segundoPaso: false, usuario: USUARIO_PRUEBA } },
    });
    renderizar(<FormularioInicio />);
    await escribirCredenciales();
    await waitFor(() => expect(navegacion.replace).toHaveBeenCalledWith("/cartera"));
    const [, opciones] = servidor.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(String(opciones.body))).toEqual({
      correo: "ana@correo.co",
      contrasena: "Luna-Roja-2026",
    });
  });

  it("un destino externo malicioso se ignora", async () => {
    navegacion.siguiente = "https://phishing.example";
    servidorFalso({
      "POST /api/sesion": { estado: 200, cuerpo: { segundoPaso: false, usuario: USUARIO_PRUEBA } },
    });
    renderizar(<FormularioInicio />);
    await escribirCredenciales();
    await waitFor(() => expect(navegacion.replace).toHaveBeenCalledWith("/panel"));
  });

  it("la contraseña nunca se puede ver y se borra después de enviarla", async () => {
    servidorFalso({
      "POST /api/sesion": { estado: 401, cuerpo: { error: "Correo o contraseña incorrectos" } },
    });
    const { container } = renderizar(<FormularioInicio />);
    const casilla = screen.getByLabelText("Contraseña");
    expect(casilla).toHaveAttribute("type", "password");
    expect(screen.queryByRole("button", { name: "Mostrar" })).toBeNull();
    expect(container.querySelector("form")).toHaveAttribute("method", "post");
    await escribirCredenciales();
    await screen.findByRole("alert");
    expect(casilla).toHaveValue("");
  });

  it("muestra el error del backend sin decir si el correo existe", async () => {
    servidorFalso({
      "POST /api/sesion": { estado: 401, cuerpo: { error: "Correo o contraseña incorrectos" } },
    });
    renderizar(<FormularioInicio />);
    await escribirCredenciales();
    expect(await screen.findByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos");
    expect(navegacion.replace).not.toHaveBeenCalled();
  });

  it("con verificación en dos pasos pide el código y luego entra", async () => {
    servidorFalso({
      "POST /api/sesion": { estado: 200, cuerpo: { segundoPaso: true } },
      "POST /api/sesion/codigo": (cuerpo) =>
        (cuerpo as { codigo: string }).codigo === "123456"
          ? { estado: 200, cuerpo: { usuario: { ...USUARIO_PRUEBA, verificacionDosPasos: true } } }
          : { estado: 401, cuerpo: { error: "El código no es válido o ya se usó" } },
    });
    renderizar(<FormularioInicio />);
    await escribirCredenciales();
    const casilla = await screen.findByLabelText("Código de 6 dígitos");
    expect(casilla).toHaveAttribute("autocomplete", "one-time-code");
    await userEvent.type(casilla, "000000");
    await userEvent.click(screen.getByRole("button", { name: "Verificar y entrar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("El código no es válido o ya se usó");
    await userEvent.type(screen.getByLabelText("Código de 6 dígitos"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Verificar y entrar" }));
    await waitFor(() => expect(navegacion.replace).toHaveBeenCalledWith("/panel"));
  });

  it("se puede cambiar a código de respaldo", async () => {
    servidorFalso({ "POST /api/sesion": { estado: 200, cuerpo: { segundoPaso: true } } });
    renderizar(<FormularioInicio />);
    await escribirCredenciales();
    await userEvent.click(await screen.findByRole("button", { name: /Usa un código de respaldo/ }));
    expect(screen.getByLabelText("Código de respaldo")).toHaveAttribute("placeholder", "ABCDE-FGHIJ");
  });

  it("si el desafío venció vuelve a pedir la contraseña", async () => {
    servidorFalso({
      "POST /api/sesion": { estado: 200, cuerpo: { segundoPaso: true } },
      "POST /api/sesion/codigo": {
        estado: 401,
        cuerpo: {
          error: "El inicio de sesión venció o tuvo demasiados intentos; vuelve a escribir tu contraseña",
        },
      },
    });
    renderizar(<FormularioInicio />);
    await escribirCredenciales();
    await userEvent.type(await screen.findByLabelText("Código de 6 dígitos"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Verificar y entrar" }));
    expect(await screen.findByLabelText("Contraseña")).toHaveValue("");
    expect(screen.getByRole("alert")).toHaveTextContent("vuelve a escribir tu contraseña");
  });
});
