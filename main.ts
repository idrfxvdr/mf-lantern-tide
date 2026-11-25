// A working best-game-01 entry (Node 22, standard library only): the game is this directory's
// game/ folder, plain static files a desktop browser loads offline (game/index.html and its ES
// modules, no library and no network request), and the program hands it in. It checks the entry,
// copies game/ and screenshots/ from beside this file to /output and writes /output/dossier.json,
// the summary the judge reads, with the vendored make.fun library.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

/** This file's directory: the entry's game/ and screenshots/ sit beside it. */
const HERE = fileURLToPath(new URL('.', import.meta.url));

/** Where the entry is handed in: MAKEFUN_OUTPUT_DIR outside the grader's container, else /output. */
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** The scorer's caps (reference/gate.json), passed to buildDossier unchanged. */
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

/** The most screenshots an entry hands in, and the most bytes one may be (256 KiB). */
const SCREENSHOTS_MIN = 3;
const SCREENSHOTS_MAX = CAPS.screenshots.max;
const SCREENSHOT_MAX_BYTES = CAPS.screenshots.max_bytes;

/** Stop with a message naming what is wrong, and where. */
function fail(message: string): never {
  throw new Error(`main.ts: ${message}`);
}

/** The entry's game page, refused when it is not a readable file. */
function requireIndexHtml(gameDir: string): void {
  const index = join(gameDir, 'index.html');
  if (!existsSync(index)) fail(`game/index.html: no such file (${index}): a game is a directory of static files, its index.html at its root`);
  if (!statSync(index).isFile()) fail(`game/index.html: not a file (${index})`);
}

/** The screenshots beside game/, by name, refused when the directory is missing or holds no file. */
function screenshotFiles(screenshotsDir: string): string[] {
  if (!existsSync(screenshotsDir)) fail(`screenshots/: no such directory (${screenshotsDir}): an entry hands in 3 or 4 renders of the game`);
  // Names starting with '.' are not screenshots (buildDossier skips them too), so they neither count nor
  // are copied as entries of their own.
  const files = readdirSync(screenshotsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  if (files.length === 0) fail(`screenshots/: holds no file (${screenshotsDir})`);
  return files;
}

/** The screenshots, refused unless there are 3 or 4 and each is under 256 KiB. */
function requireScreenshots(screenshotsDir: string): string[] {
  const files = screenshotFiles(screenshotsDir);
  if (files.length < SCREENSHOTS_MIN || files.length > SCREENSHOTS_MAX) {
    fail(`screenshots/: holds ${files.length} files, not the ${SCREENSHOTS_MIN} or ${SCREENSHOTS_MAX} an entry hands in (${screenshotsDir})`);
  }
  for (const name of files) {
    const bytes = statSync(join(screenshotsDir, name)).size;
    if (bytes >= SCREENSHOT_MAX_BYTES) {
      fail(`screenshots/${name}: ${bytes} bytes, not under the ${SCREENSHOT_MAX_BYTES} (256 KiB) a screenshot may be`);
    }
  }
  return files;
}

/** Copy a directory's whole tree to `to`, which is created. */
function copyTree(from: string, to: string): void {
  cpSync(from, to, { recursive: true });
}

/** Write out/dossier.json from out's own game/ and screenshots/, with the scorer's caps. */
function writeDossier(outDir: string): void {
  const bytes = buildDossier(outDir, CAPS);
  writeFileSync(join(outDir, 'dossier.json'), bytes);
}

function main(): void {
  const gameDir = join(HERE, 'game');
  const screenshotsDir = join(HERE, 'screenshots');

  requireIndexHtml(gameDir);
  requireScreenshots(screenshotsDir);

  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyTree(gameDir, join(OUTPUT_DIR, 'game'));
  copyTree(screenshotsDir, join(OUTPUT_DIR, 'screenshots'));

  writeDossier(OUTPUT_DIR);
}

main();