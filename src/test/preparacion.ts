import "@testing-library/jest-dom/vitest";

import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// findBy… y waitFor esperan hasta 1 s por defecto; con todas las pruebas en paralelo en un
// equipo cargado, a veces no alcanzaba. 3 s sigue siendo rápido cuando todo va bien.
configure({ asyncUtilTimeout: 3000 });

afterEach(() => {
  cleanup();
});
