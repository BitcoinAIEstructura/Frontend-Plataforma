import type { ZodType } from "zod";

/**
 * Error de la API con lo que el backend explicó: el código HTTP, el mensaje en
 * español, la casilla del formulario afectada (`campo`) y, si hubo demasiados
 * intentos, cuántos segundos esperar.
 */
export class ErrorApi extends Error {
  constructor(
    readonly codigo: number,
    mensaje: string,
    readonly campo?: string,
    readonly esperaSegundos?: number,
  ) {
    super(mensaje);
    this.name = "ErrorApi";
  }

  get sinSesion(): boolean {
    return this.codigo === 401;
  }
}

type Metodo = "GET" | "POST" | "DELETE";

interface Opciones {
  metodo?: Metodo;
  cuerpo?: unknown;
  senal?: AbortSignal;
}

const SIN_CONEXION = "No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.";

async function leerError(respuesta: Response): Promise<ErrorApi> {
  let mensaje = `El servidor respondió ${respuesta.status}`;
  let campo: string | undefined;
  try {
    const datos: unknown = await respuesta.json();
    if (typeof datos === "object" && datos !== null) {
      const registro = datos as Record<string, unknown>;
      if (typeof registro.error === "string") mensaje = registro.error;
      if (typeof registro.campo === "string") campo = registro.campo;
    }
  } catch {
    // el cuerpo no era JSON: basta con el código
  }
  const espera = Number(respuesta.headers.get("Retry-After"));
  return new ErrorApi(
    respuesta.status,
    mensaje,
    campo,
    Number.isFinite(espera) && espera > 0 ? espera : undefined,
  );
}

/**
 * Pide algo a la API del mismo sitio (`/api/...`) y valida la respuesta con zod.
 *
 * - La cookie de sesión viaja sola (`credentials: "same-origin"`); el frontend nunca la toca.
 * - Sin caché: los datos de cuenta y de mercado deben ser frescos.
 * - Con `esquema` null se espera una respuesta sin cuerpo (204).
 */
export async function pedir<T>(ruta: string, esquema: ZodType<T>, opciones?: Opciones): Promise<T>;
export async function pedir(ruta: string, esquema: null, opciones?: Opciones): Promise<void>;
export async function pedir<T>(
  ruta: string,
  esquema: ZodType<T> | null,
  opciones: Opciones = {},
): Promise<T | void> {
  const { metodo = "GET", cuerpo, senal } = opciones;
  let respuesta: Response;
  try {
    respuesta = await fetch(ruta, {
      method: metodo,
      headers: {
        Accept: "application/json",
        ...(cuerpo !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      credentials: "same-origin",
      cache: "no-store",
      signal: senal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ErrorApi(0, SIN_CONEXION);
  }
  if (!respuesta.ok) throw await leerError(respuesta);
  if (esquema === null) return;
  const datos: unknown = await respuesta.json();
  const resultado = esquema.safeParse(datos);
  if (!resultado.success) {
    throw new ErrorApi(respuesta.status, "La respuesta del servidor no tiene el formato esperado");
  }
  return resultado.data;
}
