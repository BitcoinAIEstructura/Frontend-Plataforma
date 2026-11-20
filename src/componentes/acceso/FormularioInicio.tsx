"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Boton } from "@/componentes/ui/Boton";
import { Campo } from "@/componentes/ui/Campo";
import { ErrorApi } from "@/lib/api/cliente";
import { useEnviarCodigo, useIniciarSesion } from "@/lib/hooks/useSesion";
import { destinoSeguro } from "@/lib/navegacion";

import { PasoCorreo } from "./PasoCorreo";

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
  const parametros = useSearchParams();
  const destino = destinoSeguro(parametros.get("siguiente"));
  const porInactividad = parametros.get("motivo") === "inactividad";
  const iniciar = useIniciarSesion();
  const enviarCodigo = useEnviarCodigo();
  const [paso, setPaso] = useState<"credenciales" | "codigo" | "correo">("credenciales");
  // Si la cuenta aún no confirmó el correo: a cuál llegó el código (enmascarado).
  const [correoPendiente, setCorreoPendiente] = useState("");
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
      if (resultado.segundoPaso) {
        setPaso("codigo");
      } else if ("verificarCorreo" in resultado) {
        setCorreoPendiente(resultado.correo);
        setPaso("correo");
      } else {
        router.replace(destino);
      }
    } catch (e) {
      setError(mensajeDe(e));
    } finally {
      // No dejarla en memoria más de lo necesario: ni en la casilla ni en la mutación.
      setContrasena("");
      iniciar.reset();
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

  if (paso === "correo") {
    return (
      <PasoCorreo
        titulo="Falta confirmar tu correo"
        correo={correoPendiente}
        alEntrar={() => router.replace(destino)}
        alVolver={() => setPaso("credenciales")}
      />
    );
  }

  if (paso === "codigo") {
    return (
      <form onSubmit={alEnviarCodigo} className="flex flex-col gap-5 lg:gap-4" noValidate>
        <header className="flex flex-col gap-1.5">
          <h1 className="text-3xl">Verificación en dos pasos</h1>
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
    // method="post": si se envía antes de que cargue JavaScript, nada viaja en la dirección.
    <form method="post" onSubmit={alEnviarCredenciales} className="flex flex-col gap-5 lg:gap-4" noValidate>
      <header className="flex flex-col gap-1.5">
        <h1 className="text-3xl">Bienvenido de vuelta</h1>
        <p className="text-texto-secundario">
          Entra para ver tu cartera, tus órdenes y lo que la IA ve en el mercado.
        </p>
      </header>
      {porInactividad && (
        <p role="status" className="rounded-xl border border-violeta/50 bg-violeta/10 px-4 py-3 text-sm">
          Cerramos tu sesión porque no la usaste por un rato. Vuelve a entrar cuando quieras.
        </p>
      )}
      <Campo
        etiqueta="Correo"
        type="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        autoComplete="email"
        inputMode="email"
        required
      />
      {/* Sin «Mostrar»: al iniciar sesión la contraseña nunca se ve en pantalla. */}
      <Campo
        etiqueta="Contraseña"
        type="password"
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
          Crea tu cuenta y recibe 10.000 USDT de práctica
        </Link>
      </p>

      {/* Acceso rápido para la demo: llena solo el correo; la contraseña nunca va en el código. */}
      <div className="mt-2 border-t border-borde pt-4 lg:mt-0 lg:pt-3">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest lg:mb-2 text-texto-secundario">
          Acceso rápido · Demo
        </p>
        <button
          type="button"
          onClick={() => {
            setCorreo("santiagoargoti76@gmail.com");
          }}
          className="w-full rounded-xl border border-borde-fuerte/70 bg-superficie-alta/70 px-4 py-3 lg:py-2 text-left transition hover:border-oro/50 hover:bg-superficie-alta"
        >
          <span className="block text-sm font-semibold">Jonathan Mideros</span>
          <span className="block text-xs text-texto-secundario">
            santiagoargoti76@gmail.com
          </span>
        </button>
      </div>
    </form>
  );
}
