#!/usr/bin/env node
/**
 * herdr startup hook: spawn a detached `ais daemon` and exit. A startup hook
 * that keeps running would hold herdr's session start, so this one only ever
 * hands the collector off to the OS.
 *
 * It skips the spawn when daemon.json says a collector was working recently,
 * so opening a second herdr session does not start a second daemon.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, openSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_POLL_INTERVAL_SECONDS = 60;
/** Two cycles of silence mean the daemon is gone, not merely between polls. */
const STALE_CYCLES = 2;

/** `pollIntervalSeconds` out of settings.json, clamped like the CLI clamps it. */
export function pollIntervalSecondsOf(settingsText) {
  try {
    const value = JSON.parse(settingsText ?? '').pollIntervalSeconds;
    return typeof value === 'number' && Number.isFinite(value) && value >= 10
      ? Math.min(value, 86_400)
      : DEFAULT_POLL_INTERVAL_SECONDS;
  } catch {
    return DEFAULT_POLL_INTERVAL_SECONDS;
  }
}

/**
 * Pure: the two state files as text (null when missing) and the clock decide
 * whether this hook starts a daemon.
 */
export function shouldStart(heartbeatText, settingsText, now) {
  let beat;
  try {
    beat = JSON.parse(heartbeatText ?? '');
  } catch {
    return true;
  }
  const last = Date.parse(beat?.lastCycleAt ?? '');
  if (!Number.isFinite(last)) {
    return true;
  }
  const freshMs = pollIntervalSecondsOf(settingsText) * 1000 * STALE_CYCLES;
  const age = now - last;
  return age < 0 || age >= freshMs;
}

function readTextOrNull(file) {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

function main() {
  const stateDir = (process.env.HERDR_PLUGIN_STATE_DIR ?? '').trim();
  const home = stateDir === '' ? null : path.join(path.resolve(stateDir), 'ais');
  if (home === null) {
    process.stderr.write('HERDR_PLUGIN_STATE_DIR is not set; not starting the daemon\n');
    return 0;
  }
  mkdirSync(home, { recursive: true, mode: 0o700 });
  const fresh = !shouldStart(
    readTextOrNull(path.join(home, 'daemon.json')),
    readTextOrNull(path.join(home, 'settings.json')),
    Date.now()
  );
  if (fresh) {
    return 0;
  }
  const log = openSync(path.join(home, 'daemon.log'), 'a');
  const child = spawn(process.execPath, [path.join(HERE, 'ais.mjs'), 'daemon'], {
    detached: true,
    stdio: ['ignore', log, log],
    env: { ...process.env, AIS_HOME: home },
  });
  child.unref();
  return 0;
}

if (process.argv[1] !== undefined && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  process.exit(main());
}
