import { sep } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { listFilms, ROOT } from './pipeline/script.ts';
import { buildTimeline } from './pipeline/timeline.ts';

/**
 * The studio's dev-server routes:
 *   /__studio/timeline/<film>/<cut>  the cut's timeline, built fresh from its script on every request
 *   /__studio/films                  every <film>/<cut>
 * A change to a cut.json, a script, the voice timing or the music reloads the stage and the player.
 */
function studio(): Plugin {
  return {
    name: 'studio',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '';
        const send = (code: number, body: unknown) => {
          res.statusCode = code;
          res.setHeader('content-type', typeof body === 'string' ? 'text/plain' : 'application/json');
          res.end(typeof body === 'string' ? body : JSON.stringify(body));
        };
        const m = url.match(/^\/__studio\/timeline\/([a-z0-9-]+\/[a-z0-9-]+)/);
        if (m) {
          try {
            send(200, buildTimeline(m[1]));
          } catch (e) {
            send(500, (e as Error).message);
          }
          return;
        }
        if (url.startsWith('/__studio/films')) {
          send(200, listFilms());
          return;
        }
        next();
      });
      const reloadOn = (file: string) =>
        file.endsWith(`${sep}cut.json`) ||
        (file.includes(`${sep}films${sep}`) && file.includes(`${sep}scripts${sep}`) && file.endsWith('.md')) ||
        file.endsWith(`${sep}voice${sep}timing.json`) ||
        file.endsWith(`${sep}music${sep}music.json`);
      const onChange = (file: string) => {
        if (reloadOn(file)) server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('change', onChange);
      server.watcher.on('add', onChange);
    },
  };
}

export default defineConfig({
  root: ROOT,
  plugins: [studio()],
  server: {
    port: 5173,
    strictPort: false,
    // Render output churns; only build/<film>/voice/ matters to the dev server.
    watch: { ignored: ['**/build/*/stills/**', '**/build/*/video/**', '**/build/*/sheets/**'] },
  },
  clearScreen: false,
  appType: 'mpa',
});
