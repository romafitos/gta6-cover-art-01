// Entry point for the Palm City Heat cover maker (Node 22+,
// standard library only). The app is the static site in app/ —
// plain HTML, CSS, and ES modules that run offline in a desktop
// browser — and the program hands it in: it copies app/ and
// screenshots/ from beside this file into the output directory and
// writes /output/dossier.json, the summary the judge reads, using
// the vendored make.fun library.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the app with `node serve.ts` and open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
// The program is deterministic: the same tree in, the same dossier out.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes
// shapes the bytes; the other limits refuse an entry the scorer
// would refuse (more than 4 screenshots or one over 256 KiB; more
// than 993 files in app/ or 48 MiB of app files in all, or a path
// under app/ over 1000 bytes).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
