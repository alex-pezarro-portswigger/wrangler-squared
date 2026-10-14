import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { runFile } from './job-github.js';

test('runFile names a missing folder instead of surfacing a raw spawn ENOENT', async () => {
  const gone = path.join(os.tmpdir(), `aw-no-such-folder-${process.pid}`);
  await assert.rejects(runFile('git', ['status'], gone), (e) => e.message.includes(gone) && !/ENOENT/.test(e.message));
});
