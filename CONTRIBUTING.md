# Guía de contribución

## Requisitos

- Node.js 24 o superior.
- Backend de Nexabit disponible en `http://localhost:8080` para probar la integración.

## Flujo de trabajo

1. Crea una rama descriptiva: `feat/mi-cambio`, `fix/mi-arreglo` o `docs/mi-guia`.
2. Instala las dependencias con `npm install`.
3. Haz cambios pequeños y enfocados en un solo objetivo.
4. Antes de abrir un pull request, ejecuta:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Estilo de código

- TypeScript estricto: evita `any` y prefiere tipos explícitos en las funciones públicas.
- Usa Prettier para el formato: `npm run format`.
- Sigue las reglas de ESLint del proyecto: `npm run lint`.
- Nombra componentes y tipos en PascalCase; variables y funciones en camelCase.
- Mantén los comentarios en español y explica el porqué, no lo obvio.
- No subas secretos, tokens ni archivos `.env` reales.

## Commits

Usa mensajes claros con prefijo convencional:

- `feat:` nueva funcionalidad.
- `fix:` corrección de errores.
- `docs:` documentación.
- `style:` formato sin cambios de lógica.
- `chore:` mantenimiento, configuración o dependencias.

Ejemplo: `docs: documentar el layout raíz de la aplicación`.
