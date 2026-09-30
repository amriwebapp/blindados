# Blindados · Guerra de mazos

Juego táctico de tanques estilo Clash Royale en pixel art. Se juega contra la IA o **online con amigos mediante un código de sala**.

## Contenido

- **20 cartas**: 11 iniciales y 9 que se desbloquean al ascender (Francotirador, Jeep, Paracaidistas, Reparación, Cazacarros, Drones Suicidas, Cuartel, Misil Balístico y Bombardero).
- **Copas y rangos**: ganar da 25-31 copas, perder resta 14. Hay 11 rangos, de Recluta a Mariscal, y el mínimo de tu rango está protegido. La IA de las batallas se endurece según tu rango.
- **Modos**: Clásica, Relámpago, Mazo al azar, Muerte súbita y Triple combustible. Los modos también se desbloquean por rango.
- **Entrenamiento** sin copas con dificultad a elegir. Las partidas online con amigos también dan copas.
- El progreso (copas, estadísticas, mazo y modo) se guarda en el navegador (`localStorage`).

## Instalar como app

Es una PWA: tiene `manifest.webmanifest`, un service worker (`sw.js`) e iconos en `public/icons/`.
- **Android (Chrome):** en la pantalla principal del juego aparece el botón «Instalar». También puedes usar el menú ⋮ → «Instalar aplicación».
- **iPhone (Safari):** Compartir → «Añadir a pantalla de inicio».
- Se abre a pantalla completa y funciona sin conexión, excepto el modo online. Si cambias `index.html` u otros archivos base, sube `VERSION` en `sw.js`.

## Estructura

```
blindados/
├── public/
│   ├── index.html   ← el juego completo (sprites SVG generados en código)
│   ├── config.js    ← URL y clave publicable de Supabase
│   └── _headers     ← cabeceras para Cloudflare
├── wrangler.jsonc   ← despliegue en Cloudflare Workers (assets estáticos)
└── package.json
```

## Cómo funciona el online

- **Supabase Realtime** (canales *broadcast* + *presence*). No usa tablas ni base de datos.
- Quien **crea la sala** es el anfitrión: simula la partida y envía el estado 12 veces por segundo.
- Quien **se une** manda sus despliegues; el anfitrión los valida (combustible y zona) y los aplica.
- El invitado ve el campo girado: su lado siempre abajo y sus tropas en azul.
- Enlace de invitación: `https://tu-dominio/?sala=ABCDE`.
- Si alguien se desconecta en mitad de la partida, gana el que se queda.

> El anfitrión debe mantener la pestaña del juego visible: los navegadores pausan las pestañas en segundo plano.

## Subir a GitHub

```bash
cd blindados
git init
git add .
git commit -m "Blindados: juego de tanques online"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/blindados.git
git push -u origin main
```

## Desplegar en Cloudflare

**Opción A: desde GitHub (despliegue automático en cada push)**
1. Cloudflare Dashboard → *Workers & Pages* → *Create* → *Import a repository*.
2. Elige el repo `blindados`.
3. Deja el comando de despliegue por defecto (`npx wrangler deploy`). No hace falta comando de build.
4. Te dará una URL `https://blindados.<tu-subdominio>.workers.dev`.

**Opción B: desde tu ordenador**
```bash
npm install
npx wrangler login
npm run deploy
```

Para probar en local: `npm run dev` y abre `http://localhost:8787`.

## Supabase

- Proyecto usado: `gmeuxebutmdkiyuvpwip` (solo Realtime, no toca la base de datos).
- Si el online no conecta, revisa en Supabase → *Project Settings → Realtime* que el acceso público a canales esté permitido.
- Para usar otro proyecto, cambia `public/config.js`.
- Plan gratuito: sobra para partidas entre amigos. Cada partida de 3 min envía unos 2.000 mensajes pequeños (~1 KB).
