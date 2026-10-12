import type { Metadata } from "next";

export const metadata: Metadata = { title: "Iniciar sesión · Nexabit" };

export default function PaginaIniciarSesion() {
  return (
    <div className="vidrio borde-oro rounded-3xl p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Bienvenido de vuelta</h1>
    </div>
  );
}
