import type { Metadata } from "next";

import { FormularioRegistro } from "@/componentes/acceso/FormularioRegistro";

export const metadata: Metadata = { title: "Crear cuenta · Nexabit" };

export default function PaginaRegistro() {
  return (
    <div className="vidrio borde-oro rounded-3xl p-6 sm:p-8">
      <FormularioRegistro />
    </div>
  );
}
