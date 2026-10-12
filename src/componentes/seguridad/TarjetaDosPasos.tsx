"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { useState, type FormEvent } from "react";

import { Boton } from "@/componentes/ui/Boton";
import { Campo } from "@/componentes/ui/Campo";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { ErrorApi } from "@/lib/api/cliente";
import {
  confirmarDosPasos,
  desactivarDosPasos,
  iniciarDosPasos,
  regenerarCodigos,
  type Usuario,
} from "@/lib/api/cuentas";
import { CLAVE_USUARIO } from "@/lib/hooks/useSesion";

import { CodigosRespaldo } from "./CodigosRespaldo";

type Paso =
  | { tipo: "reposo" }
  | { tipo: "escanear"; secreto: string; uri: string }
  | { tipo: "codigos"; codigos: string[] }
  | { tipo: "regenerar" }
  | { tipo: "desactivar" };

const mensaje = (e: unknown) => (e instanceof ErrorApi ? e.message : "Algo salió mal. Intenta de nuevo.");

/** El secreto en grupos de 4 ("JBSW Y3DP …"), más fácil de copiar a mano. */
export function agruparSecreto(secreto: string): string {
  return secreto.replace(/(.{4})(?=.)/g, "$1 ");
}

function Estado({ activa }: { activa: boolean }) {
  return activa ? (
    <span className="rounded-full bg-exito/15 px-3 py-1 text-xs font-semibold text-exito">✓ Activa</span>
  ) : (
    <span className="rounded-full bg-bitcoin/15 px-3 py-1 text-xs font-semibold text-bitcoin">
      Sin activar
    </span>
  );
}

export function TarjetaDosPasos({ usuario }: { usuario: Usuario }) {
  const cliente = useQueryClient();
  const [paso, setPaso] = useState<Paso>({ tipo: "reposo" });
  const [codigo, setCodigo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);

  const ir = (siguiente: Paso) => {
    setPaso(siguiente);
    setCodigo("");
    setContrasena("");
    setError(null);
  };
  const refrescarUsuario = () => cliente.invalidateQueries({ queryKey: CLAVE_USUARIO });
  // Tras un error se vacía el código: si no, el siguiente se escribiría pegado al anterior.
  const fallo = (e: unknown) => {
    setError(mensaje(e));
    setCodigo("");
  };

  const iniciar = useMutation({
    mutationFn: iniciarDosPasos,
    onSuccess: (r) => ir({ tipo: "escanear", ...r }),
    onError: fallo,
  });
  const confirmar = useMutation({
    mutationFn: confirmarDosPasos,
    onSuccess: (codigos) => {
      ir({ tipo: "codigos", codigos });
      void refrescarUsuario();
    },
    onError: fallo,
  });
  const regenerar = useMutation({
    mutationFn: regenerarCodigos,
    onSuccess: (codigos) => ir({ tipo: "codigos", codigos }),
    onError: fallo,
  });
  const desactivar = useMutation({
    mutationFn: () => desactivarDosPasos(contrasena, codigo),
    onSuccess: () => {
      ir({ tipo: "reposo" });
      void refrescarUsuario();
    },
    onError: fallo,
  });

  const enviar = (accion: () => void) => (evento: FormEvent) => {
    evento.preventDefault();
    setError(null);
    accion();
  };

  const campoCodigo = (etiqueta = "Código de 6 dígitos de la app") => (
    <Campo
      etiqueta={etiqueta}
      value={codigo}
      onChange={(e) => setCodigo(e.target.value)}
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={11}
      className="cifra"
      error={error}
      required
    />
  );

  return (
    <Tarjeta titulo="Verificación en dos pasos" extra={<Estado activa={usuario.verificacionDosPasos} />}>
      {paso.tipo === "reposo" && !usuario.verificacionDosPasos && (
        <div className="flex flex-col gap-4">
          <p className="text-texto-secundario">
            Además de tu contraseña, al entrar se te pedirá un código de 6 dígitos que cambia cada 30 segundos
            en tu teléfono. Aunque alguien conozca tu contraseña, no podrá entrar.
          </p>
          {error && (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          )}
          <Boton onClick={() => iniciar.mutate()} cargando={iniciar.isPending} className="self-start">
            Activar con Google Authenticator
          </Boton>
        </div>
      )}

      {paso.tipo === "escanear" && (
        <form onSubmit={enviar(() => confirmar.mutate(codigo))} className="flex flex-col gap-5" noValidate>
          <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-texto-secundario">
            <li>Instala Google Authenticator (o Microsoft Authenticator, Authy…) en tu teléfono.</li>
            <li>Toca «+» y escanea este código.</li>
            <li>Escribe el código de 6 dígitos que aparece en la app.</li>
          </ol>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* El QR se genera aquí mismo: el secreto nunca sale hacia otro servicio. */}
            <div className="rounded-2xl bg-white p-3">
              <QRCodeSVG
                value={paso.uri}
                size={176}
                level="M"
                title="Código QR para la app de autenticación"
              />
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-texto-secundario">¿No puedes escanearlo? Escribe esta clave en la app:</p>
              <p className="cifra rounded-lg bg-superficie-alta px-3 py-2 tracking-wider break-all text-texto">
                {agruparSecreto(paso.secreto)}
              </p>
            </div>
          </div>
          {campoCodigo()}
          <div className="flex gap-2">
            <Boton type="submit" cargando={confirmar.isPending}>
              Activar
            </Boton>
            <Boton variante="fantasma" onClick={() => ir({ tipo: "reposo" })}>
              Cancelar
            </Boton>
          </div>
        </form>
      )}

      {paso.tipo === "codigos" && (
        <CodigosRespaldo codigos={paso.codigos} alTerminar={() => ir({ tipo: "reposo" })} />
      )}

      {paso.tipo === "reposo" && usuario.verificacionDosPasos && (
        <div className="flex flex-col gap-4">
          <p className="text-texto-secundario">
            Tu cuenta pide un código de tu teléfono cada vez que inicias sesión.
          </p>
          <div className="flex flex-wrap gap-2">
            <Boton variante="contorno" onClick={() => ir({ tipo: "regenerar" })}>
              Nuevos códigos de respaldo
            </Boton>
            <Boton variante="peligro" onClick={() => ir({ tipo: "desactivar" })}>
              Desactivar
            </Boton>
          </div>
        </div>
      )}

      {paso.tipo === "regenerar" && (
        <form onSubmit={enviar(() => regenerar.mutate(codigo))} className="flex flex-col gap-4" noValidate>
          <p className="text-sm text-texto-secundario">
            Los códigos de respaldo anteriores dejarán de servir. Confirma con un código de la app o de
            respaldo.
          </p>
          {campoCodigo("Código de la app o de respaldo")}
          <div className="flex gap-2">
            <Boton type="submit" cargando={regenerar.isPending}>
              Generar nuevos
            </Boton>
            <Boton variante="fantasma" onClick={() => ir({ tipo: "reposo" })}>
              Cancelar
            </Boton>
          </div>
        </form>
      )}

      {paso.tipo === "desactivar" && (
        <form onSubmit={enviar(() => desactivar.mutate())} className="flex flex-col gap-4" noValidate>
          <p className="text-sm text-texto-secundario">
            Tu cuenta quedará protegida solo con la contraseña. Para confirmar, escribe tu contraseña y un
            código.
          </p>
          <Campo
            etiqueta="Contraseña"
            revelable
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            autoComplete="current-password"
            required
          />
          {campoCodigo("Código de la app o de respaldo")}
          <div className="flex gap-2">
            <Boton type="submit" variante="peligro" cargando={desactivar.isPending}>
              Desactivar verificación
            </Boton>
            <Boton variante="fantasma" onClick={() => ir({ tipo: "reposo" })}>
              Cancelar
            </Boton>
          </div>
        </form>
      )}
    </Tarjeta>
  );
}
