import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/preparacion.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    // Las pruebas de formularios escriben letra por letra (como una persona) y tardan
    // unos 5 s; con el límite por defecto (5 s) fallaban a veces en equipos cargados.
    testTimeout: 15_000,
  },
});
