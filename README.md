# Nexabit · frontend

Plataforma web de **trading simulado de Bitcoin con inteligencia artificial**: se practica con 10 000 USDT ficticios y datos reales del mercado.

> **Todo es simulado.** No hay dinero real ni conexión a ningún exchange, y nada de lo que muestra es asesoría financiera.

Proyecto universitario de Estructuras de Datos. El backend (Python + FastAPI, con las estructuras de datos hechas a mano) está en [BitcoinAIEstructura/Backend](https://github.com/BitcoinAIEstructura/Backend).

## Qué tiene

- **Inicio de sesión con una moneda Bitcoin 3D holográfica:**
  - Gira, flota y sigue el mouse o el dedo.
  - Se adapta al dispositivo: completa en el portátil, liviana en el teléfono y fija si no hay WebGL o se pidió menos movimiento.
- **Registro:**
  - Cédula de ciudadanía (CC) o de extranjería (CE), nombre, apellido, correo, celular y contraseña.
  - Los requisitos de la contraseña se marcan en vivo y la validación es la misma del backend.
- **Verificación en dos pasos con Google Authenticator:**
  - El código QR se genera en el propio navegador.
  - Incluye códigos de respaldo y un segundo paso al iniciar sesión.
- **Centro de seguridad:** dispositivos con sesión abierta (se pueden cerrar), actividad reciente con alertas y cambio de contraseña.
- **Diseño de lujo:**
  - Ónix, oro champán y naranja Bitcoin, con tarjetas de vidrio y fondo de aurora.
  - Funciona en teléfono y portátil, con tema oscuro y contraste WCAG comprobado por una prueba automática.

Las gráficas en vivo, las órdenes, el bot, las predicciones de la IA y la sección "Cómo funciona" llegan en las próximas fases.

## Seguridad en el navegador

- **Sesión en cookie `HttpOnly`:** la pone el backend y el JavaScript de la página no puede leerla. El frontend nunca guarda tokens, contraseñas ni datos personales en `localStorage` ni en la URL.
- **Mismo origen:** el navegador solo habla con este sitio. Next.js reenvía `/api/*` al backend, así no hace falta CORS y la URL del backend no llega al navegador.
- **Páginas protegidas:** `src/proxy.ts` manda a iniciar sesión cuando no hay cookie. Después, cada página confirma con el backend quién está conectado.
- **Sin open redirect:** `?siguiente=` solo acepta rutas internas.
- **Validación de respuestas:** cada respuesta del backend se valida con zod.

## Instalar y ejecutar

Requisitos: Node.js 24 y el backend corriendo en `http://localhost:8080`.

```bash
npm install
```

```bash
npm run dev
```

Abre `http://localhost:3000`. Si el backend está en otra dirección, copia `.env.example` a `.env.local` y cambia `BACKEND_URL`.

Revisiones (las mismas que corre el CI):

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npm test
```

```bash
npm run build
```

## Estructura

| Carpeta | Contenido |
| --- | --- |
| `src/app` | Rutas: `(acceso)` para iniciar sesión y registro; `(app)` para las páginas privadas |
| `src/componentes/acceso` | Formularios de inicio de sesión y registro |
| `src/componentes/moneda3d` | La moneda 3D (Three.js), su versión fija y la detección de calidad |
| `src/componentes/marco` | Navegación, menú del usuario y guardia de sesión |
| `src/componentes/seguridad` | Centro de seguridad |
| `src/componentes/ui` | Botón, Campo, Tarjeta y Aviso |
| `src/lib/api` | Cliente de la API y esquemas zod |
| `src/lib/validacion` | Reglas de registro y contraseña (iguales a las del backend) |
| `src/proxy.ts` | Protección de las páginas privadas |

Hecho con Next.js 16, React 19, TypeScript estricto, Tailwind CSS 4, TanStack Query, zod, React Three Fiber y Vitest.
