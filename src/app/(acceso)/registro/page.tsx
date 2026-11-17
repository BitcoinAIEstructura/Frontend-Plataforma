import type { Metadata } from "next";

import { FormularioRegistro } from "@/componentes/acceso/FormularioRegistro";

export const metadata: Metadata = { title: "Crear cuenta · Nexabit" };

export default function PaginaRegistro() {
  return (
    <div className="vidrio borde-oro rounded-xl p-6 sm:p-9">
      <FormularioRegistro />
    </div>
  );
}
