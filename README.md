# COMETA — Francisco Rentería Guzmán

Un sistema transmedia de tres piezas: un juego narrativo, un libro, y una
práctica de 360 días. Los tres se conectan entre sí.

## Estructura

```
/index.html                     ← página de entrada, enlaza a las 3 obras
/COMETA-game-v10.html             ← el juego (punto de entrada narrativo)
/COMETA-biblia-hacking.html       ← el libro (se desbloquea tras el 1er final)
/COMETA-codex-vitae.html          ← los 360 días (se desbloquea tras el 2do final)
/netlify/functions/axon.js      ← backend del chat en vivo con NOOS
/netlify.toml                   ← configuración de Netlify
/package.json                   ← metadata del proyecto (Node ≥18 por fetch nativo)
/.gitignore                     ← excluye node_modules, .netlify, .env
```

**Importante:** los 4 archivos HTML deben quedar siempre en la raíz del sitio
publicado. Se enlazan entre sí con rutas relativas (`openCometa('NOMBRE.html')`);
si se mueven a subcarpetas, esos enlaces se rompen.

## El chat con NOOS (IA en vivo)

`COMETA-game-v10.html` incluye un personaje, NOOS, con el que se puede chatear
en vivo usando la API de Anthropic. Esa llamada pasa por
`netlify/functions/axon.js`, que necesita una variable de entorno:

- **`ANTHROPIC_API_KEY`** — se configura en Netlify: Site settings →
  Environment variables. Nunca debe vivir en el código ni en este repositorio.

Si esa variable no está configurada, o la función falla por cualquier razón,
el juego sigue siendo completamente jugable — el frontend tiene diálogo de
reserva pregenerado para ese caso.

**Control de gasto (obligatorio antes de publicar):** el endpoint es público
por diseño. `axon.js` incluye límites por petición (300 tokens máx., últimos
6 mensajes, 2000 caracteres por mensaje) y un chequeo de mismo-origen que
bloquea el abuso desde navegadores de terceros — pero ningún chequeo del lado
del servidor detiene scripts. El tope real es el límite de gasto mensual en
https://console.anthropic.com (Settings → Limits). Configúralo antes del
primer deploy con la clave activa.

## Deploy

Ver `PROMPT-CLAUDE-CODE-DEPLOY-NETLIFY.md` para el prompt automatizado, o las
instrucciones manuales que lo acompañan.

## Créditos

Escrito por Francisco Rentería Guzmán. Contenido generado con asistencia de
Claude (Anthropic).
