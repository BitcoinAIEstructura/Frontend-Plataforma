"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Boton } from "@/componentes/ui/Boton";
import { Campo } from "@/componentes/ui/Campo";
import { ErrorApi } from "@/lib/api/cliente";
import { useEnviarCodigo, useIniciarSesion } from "@/lib/hooks/useSesion";
import { destinoSeguro } from "@/lib/navegacion";

function mensajeDe(error: unknown): string {
  if (error instanceof ErrorApi) return error.message;
  return "Algo salió mal. Intenta de nuevo.";
}

/**
 * Inicio de sesión: correo y contraseña; si la cuenta tiene verificación en dos
 * pasos, después pide el código de 6 dígitos de la app (o un código de respaldo).
 */
export function FormularioInicio() {
  const router = useRouter();
  const destino = destinoSeguro(useSearchParams().get("siguiente"));
  const iniciar = useIniciarSesion();
  const enviarCodigo = useEnviarCodigo();
  const [paso, setPaso] = useState<"credenciales" | "codigo">("credenciales");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [codigo, setCodigo] = useState("");
  const [usarRespaldo, setUsarRespaldo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function alEnviarCredenciales(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    try {
      const resultado = await iniciar.mutateAsync({ correo, contrasena });
      setContrasena(""); // no dejarla en memoria más de lo necesario
      if (resultado.segundoPaso) {
        setPaso("codigo");
      } else {
        router.replace(destino);
      }
    } catch (e) {
      setError(mensajeDe(e));
    }
  }

  async function alEnviarCodigo(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    try {
      await enviarCodigo.mutateAsync(codigo);
      router.replace(destino);
    } catch (e) {
      // Desafío vencido o con demasiados intentos: hay que volver a escribir la contraseña.
      if (e instanceof ErrorApi && /vuelve a escribir tu contraseña/.test(e.message)) setPaso("credenciales");
      setError(mensajeDe(e));
      setCodigo("");
    }
  }

  if (paso === "codigo") {
    return (
      <form onSubmit={alEnviarCodigo} className="flex flex-col gap-5" noValidate>
        <header className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold">Verificación en dos pasos</h1>
          <p className="text-texto-secundario">
            {usarRespaldo
              ? "Escribe uno de tus códigos de respaldo. Cada uno sirve una sola vez."
              : "Abre tu app de autenticación (Google Authenticator) y escribe el código de 6 dígitos."}
          </p>
        </header>
        <Campo
          etiqueta={usarRespaldo ? "Código de respaldo" : "Código de 6 dígitos"}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          autoComplete="one-time-code"
          inputMode={usarRespaldo ? "text" : "numeric"}
          maxLength={usarRespaldo ? 11 : 6}
          placeholder={usarRespaldo ? "ABCDE-FGHIJ" : "123456"}
          className="cifra"
          autoFocus
          required
          error={error}
        />
        <Boton type="submit" anchoCompleto cargando={enviarCodigo.isPending}>
          Verificar y entrar
        </Boton>
        <button
          type="button"
          onClick={() => {
            setUsarRespaldo((v) => !v);
            setCodigo("");
            setError(null);
          }}
          className="text-sm font-medium text-oro hover:underline"
        >
          {usarRespaldo ? "Usar el código de la app" : "¿Perdiste el teléfono? Usa un código de respaldo"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={alEnviarCredenciales} className="flex flex-col gap-5" noValidate>
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold">Bienvenido de vuelta</h1>
        <p className="text-texto-secundario">
          Entra para ver tu cartera, tus órdenes y lo que la IA ve en el mercado.
        </p>
      </header>
      <Campo
        etiqueta="Correo"
        type="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        autoComplete="email"
        inputMode="email"
        required
      />
      <Campo
        etiqueta="Contraseña"
        revelable
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        autoComplete="current-password"
        required
      />
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
        >
          {error}
        </p>
      )}
      <Boton type="submit" anchoCompleto cargando={iniciar.isPending} disabled={!correo || !contrasena}>
        Entrar
      </Boton>
      <p className="text-center text-sm text-texto-secundario">
        ¿Primera vez en Nexabit?{" "}
        <Link href="/registro" className="font-semibold text-oro hover:underline">
          Crea tu cuenta y recibe 10 000 USDT de práctica
        </Link>
      </p>
    </form>
  );
}
