import { useId } from "react";

interface PropsLogo {
  /** Muestra el nombre "Nexabit" junto al símbolo. */
  conNombre?: boolean;
  tamano?: number;
  className?: string;
}

/** Símbolo de Nexabit: una gema hexagonal dorada con una "N" trazada como circuito. */
export function SimboloNexabit({ tamano = 36, className = "" }: { tamano?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Nexabit"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-oro`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--oro-claro)" />
          <stop offset="0.5" stopColor="var(--oro)" />
          <stop offset="1" stopColor="var(--bitcoin)" />
        </linearGradient>
        <linearGradient id={`${id}-cara`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--superficie-alta)" />
          <stop offset="1" stopColor="var(--fondo)" />
        </linearGradient>
      </defs>
      <path
        d="M32 3 57 17.5v29L32 61 7 46.5v-29Z"
        fill={`url(#${id}-cara)`}
        stroke={`url(#${id}-oro)`}
        strokeWidth="3"
      />
      <path
        d="M32 3v14M57 17.5 44.5 25M7 17.5 19.5 25"
        stroke="var(--oro)"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <path
        d="M22 44V20l20 24V20"
        fill="none"
        stroke={`url(#${id}-oro)`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22" cy="20" r="3" fill="var(--oro-claro)" />
      <circle cx="42" cy="44" r="3" fill="var(--bitcoin)" />
    </svg>
  );
}

export function Logo({ conNombre = true, tamano = 36, className = "" }: PropsLogo) {
  if (!conNombre) return <SimboloNexabit tamano={tamano} className={className} />;
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <SimboloNexabit tamano={tamano} />
      <span className="font-titulo text-xl font-semibold tracking-wide">
        <span className="texto-oro">Nexa</span>
        <span className="text-texto">bit</span>
      </span>
    </span>
  );
}
