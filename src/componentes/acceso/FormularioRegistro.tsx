"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Boton } from "@/componentes/ui/Boton";
import { Campo } from "@/componentes/ui/Campo";
import { ErrorApi } from "@/lib/api/cliente";
import type { DatosRegistro, TipoDocumento } from "@/lib/api/cuentas";
import { useRegistrar } from "@/lib/hooks/useSesion";
import { INICIO_APP } from "@/lib/navegacion";
import { contrasenaValida } from "@/lib/validacion/contrasena";
import { validarCorreo, validarDocumento, validarNombre, validarTelefono } from "@/lib/validacion/registro";

import { RequisitosContrasena } from "./RequisitosContrasena";
import { SelectorDocumento } from "./SelectorDocumento";

type CampoRegistro = keyof DatosRegistro | "confirmacion" | "acepto";
type Errores = Partial<Record<CampoRegistro, string>>;

const VACIO: DatosRegistro = {
  nombre: "",
  apellido: "",
  correo: "",
  tipoDocumento: "CC",
  numeroDocumento: "",
  telefono: "",
  contrasena: "",
};

export function validarFormulario(datos: DatosRegistro, confirmacion: string, acepto: boolean): Errores {
  const errores: Errores = {};
  const poner = (campo: CampoRegistro, mensaje: string | null) => {
    if (mensaje) errores[campo] = mensaje;
  };
  poner("nombre", validarNombre(datos.nombre, "nombre"));
  poner("apellido", validarNombre(datos.apellido, "apellido"));
  poner("correo", validarCorreo(datos.correo));
  poner("numeroDocumento", validarDocumento(datos.tipoDocumento, datos.numeroDocumento));
  poner("telefono", validarTelefono(datos.telefono));
  const personales = [datos.nombre, datos.apellido, datos.correo, datos.numeroDocumento];
  if (!contrasenaValida(datos.contrasena, personales)) {
    errores.contrasena = "La contraseña todavía no cumple todos los requisitos";
  }
  if (confirmacion !== datos.contrasena) errores.confirmacion = "Las contraseñas no coinciden";
  if (!acepto) errores.acepto = "Confirma que entiendes que es una simulación";
  return errores;
}

export function FormularioRegistro() {
  const router = useRouter();
  const registrar = useRegistrar();
  const [datos, setDatos] = useState<DatosRegistro>(VACIO);
  const [confirmacion, setConfirmacion] = useState("");
  const [acepto, setAcepto] = useState(false);
  const [tocados, setTocados] = useState<Partial<Record<CampoRegistro, boolean>>>({});
  const [erroresServidor, setErroresServidor] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const errores = validarFormulario(datos, confirmacion, acepto);
  const errorDe = (campo: CampoRegistro) =>
    erroresServidor[campo] ?? (tocados[campo] || enviado ? errores[campo] : undefined);

  function cambiar<K extends keyof DatosRegistro>(campo: K, valor: DatosRegistro[K]) {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErroresServidor((e) => ({ ...e, [campo]: undefined }));
  }
  const tocar = (campo: CampoRegistro) => () => setTocados((t) => ({ ...t, [campo]: true }));

  async function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviado(true);
    setErrorGeneral(null);
    if (Object.keys(errores).length > 0) return;
    try {
      await registrar.mutateAsync(datos);
      router.replace(INICIO_APP);
    } catch (e) {
      if (e instanceof ErrorApi && e.campo) {
        setErroresServidor({ [e.campo as CampoRegistro]: e.message });
      } else {
        setErrorGeneral(e instanceof ErrorApi ? e.message : "No se pudo crear la cuenta. Intenta de nuevo.");
      }
    }
  }

  const personales = [datos.nombre, datos.apellido, datos.correo, datos.numeroDocumento];

  return (
    <form onSubmit={alEnviar} className="flex flex-col gap-5" noValidate>
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold">
          Crea tu cuenta <span className="texto-oro">Nexabit</span>
        </h1>
        <p className="text-texto-secundario">
          Recibe <strong className="cifra text-oro">10.000 USDT</strong> de práctica y empieza a invertir hoy.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          etiqueta="Nombre"
          value={datos.nombre}
          onChange={(e) => cambiar("nombre", e.target.value)}
          onBlur={tocar("nombre")}
          autoComplete="given-name"
          error={errorDe("nombre")}
          required
        />
        <Campo
          etiqueta="Apellido"
          value={datos.apellido}
          onChange={(e) => cambiar("apellido", e.target.value)}
          onBlur={tocar("apellido")}
          autoComplete="family-name"
          error={errorDe("apellido")}
          required
        />
      </div>

      <SelectorDocumento
        valor={datos.tipoDocumento}
        alCambiar={(tipo: TipoDocumento) => cambiar("tipoDocumento", tipo)}
      />
      <Campo
        etiqueta="Número de documento"
        value={datos.numeroDocumento}
        onChange={(e) => cambiar("numeroDocumento", e.target.value)}
        onBlur={tocar("numeroDocumento")}
        inputMode={datos.tipoDocumento === "CC" ? "numeric" : "text"}
        autoComplete="off"
        className="cifra"
        error={errorDe("numeroDocumento")}
        ayuda="Se guarda cifrado; solo verás los últimos 4 dígitos."
        required
      />

      <Campo
        etiqueta="Correo"
        type="email"
        value={datos.correo}
        onChange={(e) => cambiar("correo", e.target.value)}
        onBlur={tocar("correo")}
        autoComplete="email"
        inputMode="email"
        error={errorDe("correo")}
        required
      />
      <Campo
        etiqueta="Celular"
        type="tel"
        value={datos.telefono}
        onChange={(e) => cambiar("telefono", e.target.value)}
        onBlur={tocar("telefono")}
        autoComplete="tel"
        placeholder="300 123 4567"
        ayuda="Celular colombiano, o cualquier número con su indicativo (+1, +34…)."
        error={errorDe("telefono")}
        required
      />

      <Campo
        etiqueta="Contraseña"
        revelable
        value={datos.contrasena}
        onChange={(e) => cambiar("contrasena", e.target.value)}
        onBlur={tocar("contrasena")}
        autoComplete="new-password"
        error={errorDe("contrasena")}
        ayuda={<RequisitosContrasena contrasena={datos.contrasena} datosPersonales={personales} />}
        required
      />
      <Campo
        etiqueta="Confirma la contraseña"
        revelable
        value={confirmacion}
        onChange={(e) => setConfirmacion(e.target.value)}
        onBlur={tocar("confirmacion")}
        autoComplete="new-password"
        error={errorDe("confirmacion")}
        required
      />

      <label className="flex items-start gap-3 text-sm text-texto-secundario">
        <input
          type="checkbox"
          checked={acepto}
          onChange={(e) => setAcepto(e.target.checked)}
          className="mt-0.5 size-5 accent-[var(--oro)]"
          aria-invalid={errorDe("acepto") ? true : undefined}
        />
        <span>
          Entiendo que Nexabit es una <strong className="text-texto">simulación</strong>: el saldo es de
          práctica y nada de lo que veo es asesoría financiera.
          {errorDe("acepto") && (
            <span role="alert" className="mt-1 block font-medium text-error">
              {errorDe("acepto")}
            </span>
          )}
        </span>
      </label>

      {errorGeneral && (
        <p
          role="alert"
          className="rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
        >
          {errorGeneral}
        </p>
      )}

      <Boton type="submit" anchoCompleto cargando={registrar.isPending}>
        Crear mi cuenta
      </Boton>
      <p className="text-center text-sm text-texto-secundario">
        ¿Ya tienes cuenta?{" "}
        <Link href="/iniciar-sesion" className="font-semibold text-oro hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
