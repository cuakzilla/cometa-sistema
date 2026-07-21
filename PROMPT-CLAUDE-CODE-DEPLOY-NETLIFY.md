# Prompt definitivo para Claude Code — Deploy de COMETA a GitHub + Netlify

**Dónde pararte:** en Git Bash, dentro de la carpeta descomprimida de
`cometa-deploy.zip` (contiene los 12 archivos del sistema, incluido el oculto
`.gitignore`). Copia y pega el bloque completo de abajo en Claude Code.

**Qué se publica:** el sistema en funcionamiento — index + las 3 obras + la
función serverless. Los documentos de sistema (Art Bible I y IV,
`COMETA-que-es`) quedan fuera del sitio público por decisión editorial;
publicarlos después es un `git add` de distancia.

---

```
Quiero desplegar un sistema de archivos estáticos + una función serverless a
GitHub y luego a Netlify. Hazlo paso a paso, verificando cada cosa antes de
continuar. No asumas que algo funcionó — confírmalo con el comando adecuado.
Estoy en Windows usando Git Bash; todos los comandos deben funcionar ahí.

CONTEXTO DEL PROYECTO:
- index.html, COMETA-game-v10.html, COMETA-biblia-hacking.html,
  COMETA-codex-vitae.html — 4 archivos HTML estáticos que DEBEN quedar en la
  raíz del repo y del sitio publicado. Se enlazan entre sí con rutas
  relativas exactas (openCometa('NOMBRE.html')) y comparten datos vía
  localStorage del mismo origen (claves cometa_*) — si se mueven a
  subcarpetas, se rompen los enlaces Y el puente de datos.
- netlify/functions/axon.js — función serverless del chat en vivo con NOOS.
  Lee ANTHROPIC_API_KEY como variable de entorno de Netlify (nunca en el
  código ni en el repo). Incluye chequeo de mismo-origen. Si la variable
  falta o la función falla, el juego sigue 100% jugable con diálogo de
  reserva.
- netlify.toml ya configurado: publish="." y functions="netlify/functions".
- package.json (nombre cometa-sistema, Node >=18 requerido por fetch nativo
  en la función), README.md y .gitignore ya existen.
- Mi usuario de GitHub es cuakzilla.

PASO 0 — Prerrequisitos
1. Verifica: git --version, gh --version, node --version, npm --version.
2. Si falta gh (GitHub CLI): dime que lo instale desde https://cli.github.com
   y espera mi confirmación.
3. Si node es menor a 18: recuérdame que uso nvm-windows y dime el comando
   (nvm install 20 && nvm use 20). La función corre en Netlify con Node 18+,
   pero la verificación local también lo necesita.

PASO 1 — Verificación previa del paquete
1. Lista los archivos (ls -la, para ver también .gitignore) y confirma que
   están EXACTAMENTE estos 12: index.html, COMETA-game-v10.html,
   COMETA-biblia-hacking.html, COMETA-codex-vitae.html, netlify.toml,
   package.json, README.md, .gitignore,
   PROMPT-CLAUDE-CODE-DEPLOY-NETLIFY.md, netlify/, netlify/functions/,
   netlify/functions/axon.js.
2. Corre node --check netlify/functions/axon.js.
3. Verifica con grep que toda referencia openCometa('...') en los 3 archivos
   de obra apunta a un archivo que existe en la carpeta.
4. Verifica con grep que COMETA-game-v10.html contiene la ruta exacta
   /.netlify/functions/axon (el endpoint que el juego llama).
5. Verifica que no queda marca residual del nombre anterior del sistema:
   grep -cE '\bMETA\b' index.html COMETA-*.html debe dar 0 en los cuatro
   archivos (el patrón con \b no coincide dentro de COMETA — cero falsos
   positivos). El sistema se llama COMETA en todas partes.
6. Si CUALQUIER punto falla, detente y dímelo antes de continuar.

PASO 2 — Repositorio local y GitHub
1. Corre gh auth status. Si no hay sesión, dime que corra yo mismo
   gh auth login (elige GitHub.com → HTTPS → login vía navegador) y espera
   mi confirmación. No intentes autenticarte tú.
2. git init (el .gitignore ya está listo).
3. git add . && git commit -m "COMETA: juego, libro y codex — sistema completo v1"
4. git branch -M main
5. Pregúntame el nombre del repositorio (sugiere "cometa-sistema" como
   default) y visibilidad (sugiere público como default — la obra es para
   compartirse; respeta lo que yo decida).
6. gh repo create cuakzilla/<NOMBRE> --<visibilidad> --source=. --remote=origin --push
7. Confírmame la URL final: https://github.com/cuakzilla/<NOMBRE>

PASO 3 — Netlify CLI
1. netlify --version. Si no está instalado, pregúntame si lo instalas tú con
   npm install -g netlify-cli o prefiero hacerlo yo.
2. netlify status. Si no hay sesión, dime que corra yo mismo netlify login
   (abre el navegador — https://app.netlify.com) y espera mi confirmación.

PASO 4 — Crear el sitio y desplegar
1. netlify init desde esta carpeta. Elige "Create & configure a new site"
   salvo que yo diga que ya existe uno. Conéctalo al repo de GitHub recién
   creado para que cada push futuro despliegue solo (deploy continuo).
   Build command: vacío. Publish directory: "." — pregúntame el nombre del
   sitio (sugiere "cometa-sistema" si está libre; debe ser válido como
   subdominio de netlify.app) antes de confirmar.
2. netlify deploy --prod
3. Dame la URL pública: https://<NOMBRE-SITIO>.netlify.app

PASO 5 — Tope de gasto y clave de la API (en este orden exacto)
1. PRIMERO el tope: dime que vaya a
   https://console.anthropic.com/settings/limits y configure un límite de
   gasto mensual ANTES de activar cualquier clave. El endpoint del chat es
   público por diseño; los límites por petición de axon.js acotan el costo
   unitario, pero solo el tope mensual acota el total. Espera mi
   confirmación de que el tope está puesto.
2. DESPUÉS la clave: dime que la cree o copie en
   https://console.anthropic.com/settings/keys y la pegue en el panel de
   Netlify: https://app.netlify.com → mi sitio → Site configuration →
   Environment variables → Add a variable → nombre ANTHROPIC_API_KEY.
   NO me pidas la clave por texto, NO la escribas en ningún archivo ni
   comando — solo dime dónde ponerla y espera mi confirmación (o mi
   decisión de saltarlo, en cuyo caso el chat con NOOS queda en modo de
   reserva y el resto del sistema funciona igual).
3. Si configuré la clave: redespliega para que la función la recoja —
   netlify deploy --prod (o desde el panel: Deploys → Trigger deploy).

PASO 6 — Verificación cruzada final
1. curl -I sobre la raíz y las 3 obras — las cuatro deben responder 200:
   https://<SITIO>.netlify.app/
   https://<SITIO>.netlify.app/COMETA-game-v10.html
   https://<SITIO>.netlify.app/COMETA-biblia-hacking.html
   https://<SITIO>.netlify.app/COMETA-codex-vitae.html
2. Prueba de humo de la función:
   curl -s -X POST https://<SITIO>.netlify.app/.netlify/functions/axon \
     -H "Content-Type: application/json" \
     -d '{"system":"Responde solo: OK","messages":[{"role":"user","content":"ping"}]}'
   Resultados esperados: con clave configurada → JSON con "text" (la primera
   invocación puede tardar unos segundos — cold start, es normal); sin clave
   → error 500 "falta API key", que también confirma que la función está
   desplegada y enrutada. Cualquier otra cosa: muéstrame el error completo.
3. Pídeme abrir el sitio en el navegador y confirmar manualmente:
   a. Los botones de navegación cruzada entre las 3 obras (son varios en
      cada obra, no uno solo).
   b. Si hay clave: el chat con NOOS dentro del juego responde.
   c. Prueba del puente de datos (la verificación de que TODO el sistema
      funciona como sistema): jugar el juego hasta la revelación del
      arquetipo, luego abrir el Codex en el mismo navegador y confirmar que
      aparece el banner personalizado con mi arquetipo — eso valida el
      puente localStorage (claves cometa_*) entre obras en el dominio
      publicado.
4. Resumen final: URL de GitHub, URL de Netlify, estado del chat con IA
   (activo / modo de reserva), y confirmación de que el tope de gasto quedó
   configurado.

REGLAS GENERALES:
- Jamás pidas ni manejes credenciales, tokens o API keys por texto — todo
  login o clave lo manejo yo directamente en la terminal o en el panel web.
- Ve paso por paso, confirmando el resultado de cada comando antes de
  avanzar.
- Si algo falla, muéstrame el error completo y explícamelo en español
  simple antes de proponer una solución.
```

---

## Enlaces de referencia rápida

| Para | Enlace |
|---|---|
| Instalar GitHub CLI (si falta) | https://cli.github.com |
| Tu repositorio (al terminar) | https://github.com/cuakzilla/cometa-sistema |
| Panel de Netlify | https://app.netlify.com |
| Tope de gasto mensual — **antes** de la clave | https://console.anthropic.com/settings/limits |
| Crear/copiar la API key | https://console.anthropic.com/settings/keys |
| Tu sitio (al terminar) | https://cometa-sistema.netlify.app (o el nombre que elijas) |
| Dominio propio (opcional, después) | Panel Netlify → Domain settings → Add a domain |

## Si prefieres hacerlo manual (sin Claude Code)

1. **GitHub:** en la carpeta del paquete: `git init && git add . &&
   git commit -m "COMETA v1" && git branch -M main`. Crea el repo en
   https://github.com/new (sin README, ya tienes uno), luego
   `git remote add origin https://github.com/cuakzilla/cometa-sistema.git &&
   git push -u origin main`.
2. **Netlify:** https://app.netlify.com → Add new site → Import an existing
   project → GitHub → elige el repo. Build command: vacío. Publish
   directory: `.` — Netlify detecta `netlify/functions/` por el toml.
   Deploy site.
3. **Tope de gasto:** https://console.anthropic.com/settings/limits —
   límite mensual, antes de la clave.
4. **Clave:** https://console.anthropic.com/settings/keys → cópiala →
   panel del sitio → Site configuration → Environment variables →
   `ANTHROPIC_API_KEY` → guardar → Deploys → Trigger deploy.
5. **Verificar:** abre la URL del sitio; navega entre las 3 obras; prueba el
   chat con NOOS; juega hasta el arquetipo y confirma el banner en el Codex.
