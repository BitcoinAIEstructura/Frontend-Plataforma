import { useId } from "react";

/**
 * Moneda Bitcoin fija (SVG), acuñada como la 3D: borde en relieve, gráfila de perlas,
 * guilloché y ₿ en serif. Se muestra mientras carga la escena 3D, y en su lugar si el
 * dispositivo no tiene WebGL o la persona pidió menos movimiento.
 */
/** Dos decimales: así el servidor y el navegador escriben el mismo número (sin aviso de hidratación). */
const r2 = (n: number) => Math.round(n * 100) / 100;

export function MonedaEstatica({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const perlas = Array.from({ length: 72 }, (_, i) => (i / 72) * Math.PI * 2);
  const roseton = Array.from({ length: 36 }, (_, i) => (i / 36) * Math.PI * 2);
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="Moneda de Bitcoin dorada" className={className}>
      <defs>
        <radialGradient id={`${id}-cara`} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="var(--moneda-claro)" />
          <stop offset="0.5" stopColor="var(--moneda)" />
          <stop offset="1" stopColor="var(--moneda-sombra)" />
        </radialGradient>
        <linearGradient id={`${id}-borde`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--moneda-claro)" />
          <stop offset="0.55" stopColor="var(--moneda)" />
          <stop offset="1" stopColor="var(--moneda-sombra)" />
        </linearGradient>
        <radialGradient id={`${id}-sombra`}>
          <stop offset="0" stopColor="var(--moneda-sombra)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--moneda-sombra)" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-campo`}>
          <circle cx="100" cy="96" r="44" />
        </clipPath>
      </defs>
      {/* Sombra en el piso. */}
      <ellipse cx="100" cy="184" rx="58" ry="7" fill={`url(#${id}-sombra)`} />
      <circle cx="100" cy="96" r="72" fill={`url(#${id}-cara)`} />
      <circle cx="100" cy="96" r="69" fill="none" stroke={`url(#${id}-borde)`} strokeWidth="6" />
      {perlas.map((a) => (
        <circle
          key={a}
          cx={r2(100 + Math.cos(a) * 62)}
          cy={r2(96 + Math.sin(a) * 62)}
          r="0.9"
          fill="var(--moneda-sombra)"
        />
      ))}
      <circle cx="100" cy="96" r="47" fill="none" stroke="var(--moneda-sombra)" strokeWidth="1.2" />
      <g
        clipPath={`url(#${id}-campo)`}
        fill="none"
        stroke="var(--moneda-sombra)"
        strokeOpacity="0.3"
        strokeWidth="0.5"
      >
        {roseton.map((a) => (
          <circle key={a} cx={r2(100 + Math.cos(a) * 9)} cy={r2(96 + Math.sin(a) * 9)} r="30" />
        ))}
      </g>
      <circle cx="100" cy="96" r="24" fill="var(--moneda)" stroke="var(--moneda-sombra)" strokeWidth="0.8" />
      <text
        x="100"
        y="97"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="38"
        fontWeight="700"
        fill="var(--moneda-sombra)"
        style={{ fontFamily: "var(--font-titulo)" }}
      >
        ₿
      </text>
      <ellipse cx="76" cy="62" rx="24" ry="8" fill="white" fillOpacity="0.16" transform="rotate(-32 76 62)" />
    </svg>
  );
}
