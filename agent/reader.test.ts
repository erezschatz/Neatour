import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { readStatusFile } from "./reader.ts";

const fixtures = fileURLToPath(new URL("./fixtures/", import.meta.url));
const THRESHOLD = 600;

// The fixtures' mtimes are their checkout times, so "fresh" and "stale" are
// set by choosing `now` relative to the mtime, not by touching files.
async function secondsAfterMtime(path: string, seconds: number): Promise<Date> {
  const mtime = (await Deno.stat(path)).mtime;
  if (mtime === null) throw new Error(`no mtime on ${path}`);
  return new Date(mtime.getTime() + seconds * 1000);
}

Deno.test("fresh: the file, its age, not stale", async () => {
  const path = `${fixtures}status.fresh.json`;
  const result = await readStatusFile(path, THRESHOLD, await secondsAfterMtime(path, 135));
  assert.equal(result.error, undefined);
  assert.equal(result.file?.server, "laptop");
  assert.deepEqual(Object.keys(result.file?.checks ?? {}), ["disk_root", "memory", "mysql"]);
  assert.equal(result.ageSeconds, 135);
  assert.equal(result.stale, false);
});

Deno.test("stale: the file is still returned, marked stale past the threshold", async () => {
  const path = `${fixtures}status.fresh.json`;
  const atThreshold = await readStatusFile(path, THRESHOLD, await secondsAfterMtime(path, 600));
  assert.equal(atThreshold.stale, false); // "exceeds", so exactly 600 is not stale
  const past = await readStatusFile(path, THRESHOLD, await secondsAfterMtime(path, 601));
  assert.equal(past.stale, true);
  assert.equal(past.file?.server, "laptop");
});

Deno.test("missing: no file, age -1, a reason", async () => {
  const result = await readStatusFile(`${fixtures}does-not-exist.json`, THRESHOLD);
  assert.equal(result.file, null);
  assert.equal(result.ageSeconds, -1);
  assert.equal(result.stale, false);
  assert.match(result.error ?? "", /no status file at/);
});

Deno.test("unreadable: a path that exists but cannot be read as a file", async () => {
  // A directory stands in for a file without read permission: stat works,
  // the read fails. chmod 000 would not stop root, and needs write access.
  const result = await readStatusFile(fixtures, THRESHOLD);
  assert.equal(result.file, null);
  assert.ok(result.ageSeconds >= 0);
  assert.match(result.error ?? "", /cannot read/);
});

Deno.test("invalid: not JSON", async () => {
  const result = await readStatusFile(`${fixtures}status.invalid.json`, THRESHOLD);
  assert.equal(result.file, null);
  assert.match(result.error ?? "", /not valid JSON/);
});

Deno.test("wrong shape: JSON, but a check status outside the enum", async () => {
  const result = await readStatusFile(`${fixtures}status.wrong-shape.json`, THRESHOLD);
  assert.equal(result.file, null);
  assert.match(result.error ?? "", /check "disk_root" has status "fine"/);
});
