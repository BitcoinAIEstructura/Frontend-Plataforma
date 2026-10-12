import { redirect } from "next/navigation";

import { INICIO_APP } from "@/lib/navegacion";

/** La raíz lleva al panel; sin sesión, proxy.ts la manda antes a iniciar sesión. */
export default function Inicio() {
  redirect(INICIO_APP);
}
