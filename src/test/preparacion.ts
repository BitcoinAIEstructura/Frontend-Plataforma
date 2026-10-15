import "@testing-library/jest-dom/vitest";

import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// findBy… y waitFor esperan hasta 1 s por defecto; con todas las pruebas en paralelo en un
// equipo cargado, a veces no alcanzaba (ni con 3 s). Cuando todo va bien, responden enseguida.
configure({ asyncUtilTimeout: 6000 });

afterEach(() => {
  cleanup();
});
