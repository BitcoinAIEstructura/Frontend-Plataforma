"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Boton } from "@/componentes/ui/Boton";
import { Campo } from "@/componentes/ui/Campo";
import { ErrorApi } from "@/lib/api/cliente";
import { useReenviarCodigo, useVerificarCorreo } from "@/lib/hooks/useSesion";

/** Segundos entre un código y el siguiente (lo mismo que exige el backend). */
export const ESPERA_REENVIO = 60;

interface Props {
  /** El correo enmascarado ("a***@correo.co"), tal como lo devuelve el backend. */
  correo: string;
  /** Ya confirmado y con la sesión abierta. */
  alEntrar: () => void;
  /** Para volver al formulario anterior (por ejemplo, si el correo estaba mal escrito). */
  alVolver?: () => void;
  titulo?: string;
}

/**
 * «Revisa tu correo»: el código de 6 dígitos que llegó al crear la cuenta. Se puede pedir
 * otro cada minuto; si el código venció o se equivocó 5 veces, invita a pedir uno nuevo.
 */
export function PasoCorreo({ correo, alEntrar, alVolver, titulo = "Revisa tu correo" }: Props) {
  const verificar = useVerificarCorreo();
  const reenviar = useReenviarCodigo();
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [vencido, setVencido] = useState(false);
  const [espera, setEspera] = useState(ESPERA_REENVIO);

  useEffect(() => {
    if (espera <= 0) return;
    const reloj = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(reloj);
  }, [espera]);

  async function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setAviso(null);
    if (!/^\d{6}$/.test(codigo)) {
      setError("Escribe los 6 números del correo.");
      return;
    }
    try {
      await verificar.mutateAsync(codigo);
      alEntrar();
    } catch (e) {
      setCodigo("");
      if (e instanceof ErrorApi && e.codigo === 410) setVencido(true);
      setError(e instanceof ErrorApi ? e.message : "No se pudo confirmar. Intenta de nuevo.");
    }
  }

  async function pedirOtro() {
    setError(null);
    try {
      const destino = await reenviar.mutateAsync();
      setVencido(false);
      setEspera(ESPERA_REENVIO);
      setAviso(`Te enviamos un código nuevo a ${destino}. El anterior ya no sirve.`);
    } catch (e) {
      if (e instanceof ErrorApi && e.codigo === 429 && e.esperaSegundos) setEspera(e.esperaSegundos);
      setError(e instanceof ErrorApi ? e.message : "No se pudo enviar otro código.");
    }
  }

  return (
    <form method="post" onSubmit={alEnviar} className="flex flex-col gap-5" noValidate>
      <header className="flex flex-col gap-1.5">
        <h1 className="text-3xl">{titulo}</h1>
        <p className="leading-relaxed text-texto-secundario">
          Te enviamos un código de 6 números a <strong className="font-semibold text-texto">{correo}</strong>.
          Escríbelo aquí para activar tu cuenta. Vence en 15 minutos.
        </p>
      </header>
      <Campo
        etiqueta="Código del correo"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
        autoComplete="one-time-code"
        inputMode="numeric"
        maxLength={6}
        placeholder="123456"
        className="cifra"
        autoFocus
        error={error}
      />
      {aviso && (
        <p
          role="status"
          className="rounded-xl border border-exito/40 bg-exito/10 px-4 py-3 text-sm text-exito"
        >
          ✓ {aviso}
        </p>
      )}
      <Boton type="submit" anchoCompleto cargando={verificar.isPending} disabled={vencido}>
        Activar mi cuenta
      </Boton>
      <div className="flex flex-col items-center gap-2 text-sm">
        {espera > 0 ? (
          <p className="text-texto-atenuado">
            ¿No llegó? Puedes pedir otro en <span className="cifra">{espera} s</span>.
          </p>
        ) : (
          <button
            type="button"
            onClick={pedirOtro}
            disabled={reenviar.isPending}
            className={`font-semibold text-oro hover:underline ${vencido ? "text-base" : ""}`}
          >
            {reenviar.isPending ? "Enviando…" : "Enviarme otro código"}
          </button>
        )}
        <p className="text-center text-xs text-texto-atenuado">
          Revisa también la carpeta de spam o «Promociones». Nunca te pediremos tu contraseña por correo.
        </p>
        {alVolver && (
          <button type="button" onClick={alVolver} className="text-texto-secundario hover:underline">
            ← Volver
          </button>
        )}
      </div>
    </form>
  );
}
