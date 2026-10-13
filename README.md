# Nexabit · frontend

Plataforma web de **trading simulado de Bitcoin con inteligencia artificial**: se practica con 10.000 USDT ficticios y datos reales del mercado.

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
  - Funciona en teléfono y portátil, con tema oscuro o claro y contraste WCAG comprobado por una prueba automática.
  - Gráficas con una paleta validada para daltonismo: lo que sube y lo que baja nunca se distingue solo por color (vela hueca o rellena, ▲▼ en los textos).
- **Panel:**
  - Cifras de la cartera (valor, ganancia con ▲▼, USDT y BTC), precio en vivo y la variación de 24 h.
  - Medidor de confianza de la señal de la IA, con el porqué.
  - Evolución de la cartera reconstruida con tus órdenes y las velas (24 h, 7 días o 30 días).
- **Mercado:** velas de BTCUSDT (de 1 minuto a 1 día) con volumen, SMA, EMA y bandas de Bollinger encima, y RSI o MACD debajo. Cada gráfica tiene vista de tabla.
- **Órdenes:**
  - Comprar o vender en USDT, con botones de 25 %, 50 % y Todo y una vista previa con la comisión.
  - La cola de pendientes (FIFO) se ejecuta en orden. Cada orden se puede cancelar, y **Ctrl + Z** deshace la última (una pila).
  - Registro con filtro por estado.
- **Cartera:** reparto USDT/BTC, costo promedio, ganancias realizada y no realizada, y el historial como línea de tiempo.
- **Bot:** se configura la frecuencia, las velas, el riesgo, el stop-loss y el take-profit; se enciende y se apaga, y se ven sus decisiones en vivo.
- **Tiempo real:** una sola conexión SSE trae el precio, la cartera, las órdenes y las decisiones del bot.
- **Cómo funciona:** una sección por estructura de datos del backend (cola, pila, montículo, árbol AVL, tabla hash, cola circular y trie). Cada una tiene:
  - Su uso real en Nexabit y su complejidad.
  - Lo que guarda **ahora** con tus datos.
  - Un laboratorio que corre el código del backend paso a paso: rotaciones del AVL, rehash de la tabla, el anillo que pisa al más viejo.
- **Liga de inversores:** los 10 mejores por rentabilidad, cada uno con un alias (nadie ve tu nombre), y tu puesto.
- **¿Y si hubiera invertido?:** cuánto valdría hoy una compra hecha en una fecha del pasado, con el mejor y el peor momento para vender.
- **Alertas de precio:** «avísame cuando suba o baje a…». Llega un aviso en cualquier página cuando se cumple. El backend las guarda en dos montículos.
- **Máquina del tiempo:** el bot sobre un periodo pasado (un mes, seis meses o dos años), comparado con comprar y no hacer nada. También muestra la prueba "sin trampa", con velas que no se usaron para elegir.
- **Se instala como app (PWA):** en el teléfono o el portátil, con su ícono y una página «Sin conexión» si no hay red.
- **Búsqueda Ctrl + K:** páginas, acciones, indicadores y conceptos mientras escribes. La responde un trie del backend.

- **Predicciones IA:** regresión logística, árbol de decisión y k vecinos (hechos a mano en el backend), más un comité que los combina. Para cada uno se ve:
  - Qué cree de la próxima vela y por qué: el aporte de cada característica, el camino del árbol o las velas más parecidas del pasado.
  - Cómo le fue con datos que no vio, frente a la **base** de decir siempre lo que más pasó. Si no le ganó, la página lo advierte claramente.

## Seguridad en el navegador

- **Sesión en cookie `HttpOnly`:** la pone el backend y el JavaScript de la página no puede leerla. El frontend nunca guarda tokens, contraseñas ni datos personales en `localStorage` ni en la URL.
- **Mismo origen:** el navegador solo habla con este sitio. Next.js reenvía `/api/*` al backend, así no hace falta CORS y la URL del backend no llega al navegador.
- **Páginas protegidas:** `src/proxy.ts` manda a iniciar sesión cuando no hay cookie. Después, cada página confirma con el backend quién está conectado.
- **Sin open redirect:** `?siguiente=` solo acepta rutas internas.
- **Validación de respuestas:** cada respuesta del backend se valida con zod.
- **Encabezados de seguridad** (`src/lib/encabezados.ts`):
  - Una política de contenido (CSP) que solo permite cargar cosas del mismo sitio y prohíbe meter la página en un iframe.
  - `nosniff`, `Referrer-Policy`, `Permissions-Policy` y `Cross-Origin-Opener-Policy`.
- **Cierre por inactividad:** tras 25 minutos sin tocar nada aparece «¿Sigues ahí?», y si no hay respuesta se cierra la sesión.

## Instalar y ejecutar

Requisitos: Node.js 24 y el backend corriendo en `http://localhost:8080`.

```bash
npm install
```

```bash
npm run dev
```

Abre `http://localhost:3000`. Si el backend está en otra dirección, copia `.env.example` a `.env.local` y cambia `BACKEND_URL`.

> **Ojo al compilar para producción:** Next.js fija el destino de `/api/*` en el momento de `npm run build`. `BACKEND_URL` tiene que estar definida al compilar, no solo al arrancar.

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
| `src/componentes/graficas` | Velas, osciladores y evolución (Lightweight Charts) |
| `src/componentes/panel`, `mercado`, `ordenes`, `cartera`, `bot`, `liga` | Las pantallas de la plataforma |
| `src/componentes/estructuras` | "Cómo funciona": dibujos de árboles, vistas de cada estructura y el laboratorio |
| `src/componentes/busqueda` | La búsqueda Ctrl + K |
| `src/componentes/ia` | Predicciones IA: comité, modelos, evaluación y el árbol por dentro |
| `src/componentes/ui` | Botón, Campo, Tarjeta, Segmentado, tema y Aviso |
| `src/lib/api` | Cliente de la API y esquemas zod |
| `src/lib/hooks` | Datos con TanStack Query (sesión, mercado y simulación) |
| `src/lib/tiempoReal.tsx` | La conexión SSE que mantiene la caché al día |
| `src/lib/validacion` | Reglas de registro y contraseña (iguales a las del backend) |
| `src/proxy.ts` | Protección de las páginas privadas |

Hecho con Next.js 16, React 19, TypeScript estricto, Tailwind CSS 4, TanStack Query, zod, React Three Fiber, Lightweight Charts y Vitest.
