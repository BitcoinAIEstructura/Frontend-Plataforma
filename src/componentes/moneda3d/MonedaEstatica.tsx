import { useId } from "react";

/**
 * Moneda Bitcoin fija (SVG). Se muestra mientras carga la escena 3D, y en su
 * lugar si el dispositivo no tiene WebGL o la persona pidió menos movimiento.
 */
export function MonedaEstatica({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="Moneda de Bitcoin dorada" className={className}>
      <defs>
        <radialGradient id={`${id}-cara`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="var(--oro-claro)" />
          <stop offset="0.55" stopColor="var(--oro)" />
          <stop offset="1" stopColor="var(--oro-profundo)" />
        </radialGradient>
        <linearGradient id={`${id}-canto`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--oro-claro)" />
          <stop offset="1" stopColor="var(--bitcoin)" />
        </linearGradient>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0.55" stopColor="var(--oro)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--violeta)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill={`url(#${id}-halo)`} />
      <circle
        cx="100"
        cy="100"
        r="70"
        fill={`url(#${id}-cara)`}
        stroke={`url(#${id}-canto)`}
        strokeWidth="6"
      />
      <circle
        cx="100"
        cy="100"
        r="58"
        fill="none"
        stroke="var(--oro-profundo)"
        strokeWidth="1.5"
        strokeDasharray="2 4"
      />
      <text
        x="100"
        y="101"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="64"
        fontWeight="700"
        fill="var(--sobre-oro)"
        fillOpacity="0.85"
        style={{ fontFamily: "var(--font-titulo)" }}
      >
        ₿
      </text>
      <ellipse
        cx="78"
        cy="68"
        rx="26"
        ry="10"
        fill="white"
        fillOpacity="0.18"
        transform="rotate(-30 78 68)"
      />
    </svg>
  );
}
