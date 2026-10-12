import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderizar, servidorFalso, USUARIO_PRUEBA } from "@/test/utilidades";

import { FormularioRegistro, validarFormulario } from "./FormularioRegistro";

const replace = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, push: vi.fn() }) }));

beforeEach(() => replace.mockReset());
afterEach(() => vi.unstubAllGlobals());

const BIEN = {
  nombre: "Ana",
  apellido: "Pérez",
  correo: "ana@correo.co",
  tipoDocumento: "CC" as const,
  numeroDocumento: "1.023.456.789",
  telefono: "300 123 4567",
  contrasena: "Luna-Roja-2026",
};

async function llenar(datos = BIEN, confirmacion = datos.contrasena) {
  await userEvent.type(screen.getByLabelText("Nombre"), datos.nombre);
  await userEvent.type(screen.getByLabelText("Apellido"), datos.apellido);
  await userEvent.type(screen.getByLabelText("Número de documento"), datos.numeroDocumento);
  await userEvent.type(screen.getByLabelText("Correo"), datos.correo);
  await userEvent.type(screen.getByLabelText("Celular"), datos.telefono);
  await userEvent.type(screen.getByLabelText("Contraseña"), datos.contrasena);
  await userEvent.type(screen.getByLabelText("Confirma la contraseña"), confirmacion);
  await userEvent.click(screen.getByRole("checkbox"));
}

describe("validarFormulario", () => {
  it("datos correctos: sin errores", () => {
    expect(validarFormulario(BIEN, BIEN.contrasena, true)).toEqual({});
  });

  it("reporta cada problema en su campo", () => {
    const errores = validarFormulario(
      { ...BIEN, telefono: "123", numeroDocumento: "12", contrasena: "corta" },
      "otra",
      false,
    );
    expect(Object.keys(errores).sort()).toEqual(
      ["acepto", "confirmacion", "contrasena", "numeroDocumento", "telefono"].sort(),
    );
  });
});

describe("FormularioRegistro", () => {
  it("crea la cuenta con los datos escritos y entra al panel", async () => {
    const servidor = servidorFalso({
      "POST /api/cuentas/registro": { estado: 201, cuerpo: { usuario: USUARIO_PRUEBA } },
    });
    renderizar(<FormularioRegistro />);
    await llenar();
    await userEvent.click(screen.getByRole("button", { name: "Crear mi cuenta" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/panel"));
    const [, opciones] = servidor.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(String(opciones.body))).toEqual(BIEN);
  });

  it("no envía nada si hay errores y los muestra todos", async () => {
    const servidor = servidorFalso({});
    renderizar(<FormularioRegistro />);
    await userEvent.click(screen.getByRole("button", { name: "Crear mi cuenta" }));
    expect(servidor).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Nombre")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Confirma que entiendes que es una simulación")).toBeInTheDocument();
  });

  it("valida una casilla al salir de ella", async () => {
    renderizar(<FormularioRegistro />);
    await userEvent.type(screen.getByLabelText("Celular"), "123");
    await userEvent.tab();
    expect(screen.getByLabelText("Celular")).toHaveAccessibleDescription(/indicativo/);
    expect(screen.getByLabelText("Celular")).toHaveAttribute("aria-invalid", "true");
  });

  it("un error del backend marca la casilla que dice el campo", async () => {
    servidorFalso({
      "POST /api/cuentas/registro": {
        estado: 400,
        cuerpo: { error: "Un celular colombiano tiene 10 dígitos y empieza por 3", campo: "telefono" },
      },
    });
    renderizar(<FormularioRegistro />);
    await llenar();
    await userEvent.click(screen.getByRole("button", { name: "Crear mi cuenta" }));
    expect(
      await screen.findByText("Un celular colombiano tiene 10 dígitos y empieza por 3"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Celular")).toHaveAttribute("aria-invalid", "true");
  });

  it("correo o documento ya registrado: mensaje general", async () => {
    servidorFalso({
      "POST /api/cuentas/registro": {
        estado: 409,
        cuerpo: { error: "Ya existe una cuenta con ese correo o con ese documento" },
      },
    });
    renderizar(<FormularioRegistro />);
    await llenar();
    await userEvent.click(screen.getByRole("button", { name: "Crear mi cuenta" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Ya existe una cuenta");
    expect(replace).not.toHaveBeenCalled();
  });
});
