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
  - `ARENAS`: arenas solo estéticas (colores del mapa, tipo de árbol, adornos `DECO`, partículas `amb`). Se desbloquean por rango (`r`).
  - `SKINS`: apariencias de búnker (paleta + `mod` por píxel; el color de equipo no cambia). `CHESTS`: tipos de cofre.
  - Mundo, entidades, IA, render, UI/menú, red y partida.
- `config.js`: URL y clave **publicable** de Supabase. Es pública a propósito.
- `sw.js`: service worker de la PWA. **Sube `VERSION` cuando cambies archivos distintos de `index.html`.** `index.html` va network-first y se actualiza solo.
- `manifest.webmanifest` e `icons/`: PWA instalable. Los iconos se generaron desde el sprite `heavyBody`/`heavyTur`.
- `_headers`: cabeceras de Cloudflare.

## Cosas a saber

- **Online:** Supabase Realtime (broadcast y presence), sin base de datos. El anfitrión es autoritativo: simula la partida y envía snapshots 12 veces por segundo. El invitado ve el campo girado (`FL`/`ME`). Las entidades nuevas deben poder reconstruirse en `applySnap` a partir de su `key` de `CARDS`. Los efectos visuales se replican con `EM(...)` y `EVF`.
- **Progreso:** se guarda en `localStorage` (`blindados-save`: copas, estadísticas, 4 ranuras de mazo `decks`/`di`, el modo, y la tienda: `coins`, `chests` (máx. 4), `owned` (cartas sacadas de cofres), `skins`/`skin`, `arena` y `freeAt` (cofre gratis cada 4 h); `blindados-nick`: el nombre). Es por dominio: al cambiar de URL, los jugadores empiezan de cero.
- **Admin:** el nombre `fuffo` (sin distinguir mayúsculas) desbloquea todas las cartas y modos mediante `unlockRank()`. Es solo del lado del cliente, sin seguridad real (no hay cuentas); el usuario lo sabe.
- **Tienda y cofres:** `award()` da monedas (y un cofre al ganar) en partidas rankeadas y online. `rollChest()` reparte monedas, a veces una carta aún bloqueada por rango o una apariencia. Para saber si el jugador tiene una carta usa `have(k)` (rango **o** cofre), no `unlocked()`, que es solo por rango (la IA lo sigue usando).
- **Arena y apariencias en partida:** la arena es local (cada jugador ve la suya; `ARENA`, mapas cacheados en `MAPS[W+arena]`). La apariencia de búnker de cada bando está en `TSKIN` y se dibuja con `towerImg()`; online se envía en la presencia y en `start` (`NET.peerSkin`).
- **El mazo debe tener 8 cartas para jugar.** Los botones no se desactivan: `deckReady()` lleva a la pestaña Mazo con un aviso. `fillDeck()` rellena el mazo si se quitaron cartas bloqueadas.
- **Pestaña Mazo:** la selección está en `pick` y la ficha es `#sheet` (fija sobre las pestañas; no empuja el contenido). Cada carta del menú es siempre el mismo elemento (`MEL`), y `renderDeck()` solo lo mueve entre mazo y colección y lo anima (FLIP). Para cambios del mazo llama a `renderDeck()`, no a `renderMenu()`. Quitar, «Al azar» y «Vaciar» pasan por `undoable()`.
- **Táctil:** `.card` lleva `touch-action:none` para poder arrastrarlas en la batalla. En el menú se anula con `pan-y`, que es necesario para poder desplazar la pantalla. Hay un script que bloquea el zoom.
- **Geometría del campo:** `W`, `H`, `RY` (centro del río), `BR` (puentes) y `TPOS` (torres) son variables que fija `setField()` al empezar la partida. No uses coordenadas fijas: todo va relativo a ellas. El modo Dominio (`big:true`) usa 28×62 (el triple de superficie que 18×32). El mapa pixel se cachea por tamaño en `MAPS`.
- **Cámara:** `VW`/`VH` (casillas visibles) y `camX`/`camY` (en coordenadas de vista, ya girada). En los mapas normales se ve el campo entero y la cámara queda en 0. En Dominio se mueve arrastrando el campo (tocar sin arrastrar despliega), con la rueda, tocando el minimapa (`drawMini`) o llevando una carta al borde (`edgeScroll`).
- La interfaz está pensada para móvil en vertical: pruébala a 390×844.

## Probar

No hay tests. Para verificar:
- Sintaxis: `node -e` con `new Function(...)` sobre cada `<script>` en línea.
- Juego: sirve `public/` con `python3 -m http.server` y usa `puppeteer-core` con el Chrome del sistema (`/Applications/Google Chrome.app`). Las funciones y el estado son globales (`startGame`, `deploy`, `update`, `ents`, `SAVE`…), así que puedes simular partidas desde `page.evaluate`.
