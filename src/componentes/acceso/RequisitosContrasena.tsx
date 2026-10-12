import { fortaleza, requisitosContrasena } from "@/lib/validacion/contrasena";

const NIVELES = ["", "Débil", "Regular", "Buena", "Excelente"] as const;
const COLOR_NIVEL = ["bg-borde", "bg-error", "bg-bitcoin", "bg-oro", "bg-exito"] as const;

interface Props {
  contrasena: string;
  datosPersonales: readonly string[];
  id?: string;
}

/** Lista que se marca mientras se escribe la contraseña, con una barra de fortaleza. */
export function RequisitosContrasena({ contrasena, datosPersonales, id }: Props) {
  const requisitos = requisitosContrasena(contrasena, datosPersonales);
  const nivel = fortaleza(contrasena, datosPersonales);
  return (
    <div id={id} className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        <div
          role="meter"
          aria-label="Fortaleza de la contraseña"
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={nivel}
          aria-valuetext={NIVELES[nivel] || "Sin escribir"}
          className="grid flex-1 grid-cols-4 gap-1.5"
        >
          {[1, 2, 3, 4].map((tramo) => (
            <span
              key={tramo}
              className={`h-1.5 rounded-full transition-colors ${tramo <= nivel ? COLOR_NIVEL[nivel] : "bg-borde"}`}
            />
          ))}
        </div>
        <span className="w-20 text-right text-xs font-semibold text-texto-secundario">{NIVELES[nivel]}</span>
      </div>
      <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
        {requisitos.map((r) => (
          <li
            key={r.id}
            className={`flex items-start gap-2 ${r.cumple ? "text-exito" : "text-texto-atenuado"}`}
          >
            <span aria-hidden className="mt-px">
              {r.cumple ? "✓" : "○"}
            </span>
            <span>
              {r.texto}
              <span className="sr-only">{r.cumple ? ": cumplido" : ": pendiente"}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
