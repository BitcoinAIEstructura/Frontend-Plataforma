import type { Metadata } from "next";
import { Suspense } from "react";

import { FormularioInicio } from "@/componentes/acceso/FormularioInicio";

export const metadata: Metadata = { title: "Iniciar sesión · Nexabit" };

export default function PaginaIniciarSesion() {
  return (
    <div className="vidrio borde-oro rounded-xl p-6 sm:p-9">
      {/* El formulario lee ?siguiente= de la URL: va dentro de Suspense (ver docs de useSearchParams). */}
      <Suspense>
        <FormularioInicio />
      </Suspense>
    </div>
  );
}
