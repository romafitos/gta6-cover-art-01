// Entry point for the Palm City Heat cover maker (Node 22+, standard
// library only). The app is the static site in app/ — plain HTML, CSS,
// and ES modules that run offline in a desktop browser — and the program
// hands it in: it copies app/ and screenshots/ from beside this file
// into the output directory and writes /output/dossier.json, the summary
// the judge reads, using the vendored make.fun library.
//
// Serve the app locally with `node serve.ts`, then open
// http://localhost:8080. Outside the grader's container,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps mirror the scorer's own gate: at most 4 screenshots, each at
// most 256 KiB; app/ at most 993 files and 48 MiB in all, each path at
// most 1000 bytes; the dossier's text budget is 160 KiB. The dossier
// builder hashes every file, so identical inputs give identical bytes —
// run main.ts twice and the two dossiers match exactly.
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
