import type { Metadata } from "next";
import { Suspense } from "react";

import { FormularioInicio } from "@/componentes/acceso/FormularioInicio";

export const metadata: Metadata = { title: "Iniciar sesión · Nexabit" };

export default function PaginaIniciarSesion() {
  return (
    <div className="vidrio borde-oro rounded-3xl p-6 sm:p-8">
      {/* El formulario lee ?siguiente= de la URL: va dentro de Suspense (ver docs de useSearchParams). */}
      <Suspense>
        <FormularioInicio />
      </Suspense>
    </div>
  );
}
