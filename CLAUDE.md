@AGENTS.md

# Nexabit (frontend)

## Objetivo
Plataforma web de trading **simulado** de Bitcoin con IA: inicio de sesión y registro seguros, panel con gráficas en vivo, órdenes, cartera, bot, predicciones y una sección "Cómo funciona" que muestra las estructuras de datos. **Nunca opera con dinero real.** El backend (Python + FastAPI) está en otro repositorio: `BitcoinAIEstructura/Backend`.

## Stack
Next.js 16 (App Router) con TypeScript estricto, Tailwind CSS 4, TanStack Query, zod, React Three Fiber (escenas 3D), Motion (animaciones), Vitest con Testing Library.

## Reglas
- Sin `any`. Los tipos de las respuestas de la API salen de esquemas zod (`z.infer`), no se escriben a mano.
- Componentes de servidor por defecto; `'use client'` solo donde hay estado, efectos, 3D o gráficas.
- Textos de la interfaz en español (es-CO). Componentes, hooks y carpetas en español: `src/app/<ruta>`, `src/componentes/...`, `src/lib/{api,hooks,formato,validacion}`.
- Ninguna URL del backend se escribe a mano: el navegador llama a `/api/*` en el mismo origen y Next.js lo reenvía a `BACKEND_URL` (ver `next.config.ts`).
- Funciona igual de bien en teléfono y en portátil: se diseña primero para teléfono.

## Seguridad
- La sesión es una cookie `HttpOnly` que pone el backend: el frontend nunca guarda tokens, contraseñas ni datos personales en `localStorage`, `sessionStorage` ni en la URL.
- `src/proxy.ts` solo hace revisiones rápidas (¿hay cookie?) para redirigir; la verdad la dice `GET /api/cuentas/yo`.
- Nunca mostrar el documento ni el teléfono completos: el backend ya los envía enmascarados.
- Las reglas de contraseña del formulario son las mismas del backend (`src/lib/validacion/contrasena.ts`); el backend siempre tiene la última palabra.

## Diseño (lujo y glamour)
- Colores solo con los tokens de `src/app/globals.css` (`bg-onix`, `text-oro`, …); nada de hex sueltos en componentes.
- Oro champán como color principal y naranja Bitcoin para las acciones; violeta real para detalles.
- Contraste: texto ≥ 4,5:1 y marcas gráficas ≥ 3:1.
- Subida y bajada nunca se distinguen solo por color: llevan icono o texto.
- Animaciones respetan `prefers-reduced-motion`; la escena 3D tiene versión liviana.
- Invitar a operar sí, engañar no: sin urgencias falsas ni botones confusos. El aviso "Simulación con datos reales del mercado; no es asesoría financiera" está visible.

## Comandos
- Instalar: `npm install`
- Desarrollo: `npm run dev` (http://localhost:3000; el backend debe estar en http://localhost:8080)
- Pruebas: `npm test`
- Tipos y estilo: `npm run typecheck`, `npm run lint`
- Producción: `npm run build`

## Convenciones
- Cada componente o módulo con lógica lleva pruebas.
- No hacer commit ni push salvo que el usuario lo pida.
