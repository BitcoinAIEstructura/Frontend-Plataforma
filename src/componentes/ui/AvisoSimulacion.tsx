export const TEXTO_AVISO =
  "Simulación con datos reales del mercado: no se usa dinero real y no es asesoría financiera.";

/** Aviso que acompaña a toda la plataforma: invitamos a practicar, nunca a engañar. */
export function AvisoSimulacion({ className = "" }: { className?: string }) {
  return (
    <p role="note" className={`text-xs leading-relaxed text-texto-atenuado ${className}`}>
      <span aria-hidden className="mr-1 text-oro">
        ◆
      </span>
      {TEXTO_AVISO}
    </p>
  );
}
