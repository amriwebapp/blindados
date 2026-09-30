# Blindados

Juego táctico de tanques con cartas (estilo Clash Royale, pixel art), en español. Es un sitio estático: todo el juego está en `public/index.html` (HTML, CSS y JS en línea, sin build ni dependencias de runtime). El usuario habla español: responde en español.

## Despliegue

- **Cloudflare Workers (solo assets estáticos)**, configurado en `wrangler.jsonc`. Despliega con `npx wrangler deploy` desde la raíz.
- Cuenta de Cloudflare activa: `amri.webapp@gmail.com`. URL: https://blindados.amri-webapp.workers.dev
- Copia antigua, todavía activa en otra cuenta (`alialamrihussain@gmail.com`): https://blindados.alialamrihussain.workers.dev. No se actualiza con los despliegues.
- **GitHub:** repo público https://github.com/amriwebapp/blindados, rama `main`. `gh` está instalado en `~/.local/bin/gh` (Homebrew no tiene versión para este macOS).
- Flujo habitual tras un cambio: commit, `git push` y `npx wrangler deploy`. Después comprueba la URL con `curl`.

## Estructura de `public/`

- `index.html`: el juego completo. Secciones marcadas con comentarios `/* ==== */`:
  - Sprites: objeto `SP` entre `/*SP_START*/` y `/*SP_END*/`. Son filas de 16 caracteres, un carácter por píxel y `.` para transparente. `T`, `t` y `L` son los colores del equipo.
  - `CARDS`: cartas. `kind` puede ser `unit`, `building` o `spell`.
  - `RANKS`: 11 rangos, con las copas necesarias y las cartas y modos que desbloquean.
  - `MODES`: modos de juego.
  - Mundo, entidades, IA, render, UI/menú, red y partida.
- `config.js`: URL y clave **publicable** de Supabase. Es pública a propósito.
- `sw.js`: service worker de la PWA. **Sube `VERSION` cuando cambies archivos distintos de `index.html`.** `index.html` va network-first y se actualiza solo.
- `manifest.webmanifest` e `icons/`: PWA instalable. Los iconos se generaron desde el sprite `heavyBody`/`heavyTur`.
- `_headers`: cabeceras de Cloudflare.

## Cosas a saber

- **Online:** Supabase Realtime (broadcast y presence), sin base de datos. El anfitrión es autoritativo: simula la partida y envía snapshots 12 veces por segundo. El invitado ve el campo girado (`FL`/`ME`). Las entidades nuevas deben poder reconstruirse en `applySnap` a partir de su `key` de `CARDS`. Los efectos visuales se replican con `EM(...)` y `EVF`.
- **Progreso:** se guarda en `localStorage` (`blindados-save`: copas, estadísticas, 4 ranuras de mazo `decks`/`di` y el modo; `blindados-nick`: el nombre). Es por dominio: al cambiar de URL, los jugadores empiezan de cero.
- **Admin:** el nombre `fuffo` (sin distinguir mayúsculas) desbloquea todas las cartas y modos mediante `unlockRank()`. Es solo del lado del cliente, sin seguridad real (no hay cuentas); el usuario lo sabe.
- **El mazo debe tener 8 cartas para jugar.** Los botones no se desactivan: `deckReady()` lleva a la pestaña Mazo con un aviso. `fillDeck()` rellena el mazo si se quitaron cartas bloqueadas.
- **Táctil:** `.card` lleva `touch-action:none` para poder arrastrarlas en la batalla. En el menú se anula con `pan-y`, que es necesario para poder desplazar la pantalla. Hay un script que bloquea el zoom.
- La interfaz está pensada para móvil en vertical: pruébala a 390×844.

## Probar

No hay tests. Para verificar:
- Sintaxis: `node -e` con `new Function(...)` sobre cada `<script>` en línea.
- Juego: sirve `public/` con `python3 -m http.server` y usa `puppeteer-core` con el Chrome del sistema (`/Applications/Google Chrome.app`). Las funciones y el estado son globales (`startGame`, `deploy`, `update`, `ents`, `SAVE`…), así que puedes simular partidas desde `page.evaluate`.
