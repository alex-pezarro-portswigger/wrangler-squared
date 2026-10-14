import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runFile } from './job-github.js';

// A missing cwd makes Node's execFile throw `spawn <bin> ENOENT`, byte-for-byte
// the error it gives when the binary is absent from PATH. runFile checks the
// directory first so a sub-job whose repo/worktree folder is gone fails with a
// message that points at the real cause instead of a phantom missing git.
test('runFile reports a missing working directory instead of a misleading ENOENT', async () => {
  const gone = path.join(os.tmpdir(), 'wrangler-squared-missing-cwd-does-not-exist');
  fs.rmSync(gone, { recursive: true, force: true });
  await assert.rejects(
    () => runFile('git', ['status'], gone),
    (e) => {
      assert.match(e.message, /Working directory no longer exists/);
      assert.ok(e.message.includes(gone), 'names the missing directory');
      assert.doesNotMatch(e.message, /ENOENT/, 'does not surface the raw spawn ENOENT');
      return true;
    },
  );
});

test('runFile still runs when the working directory exists', async () => {
  const out = await runFile('git', ['--version'], os.tmpdir());
  assert.match(out, /^git version/);
});
