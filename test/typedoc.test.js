import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import { mkdtemp, cp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);
const tmpPrefix = join(tmpdir(), "@kayahr-typedoc-");

describe("typedoc", () => {
    let tmpDir;

    beforeEach(async () => {
        // Create temporary working directory
        tmpDir = await mkdtemp(tmpPrefix);

        // Copy typedoc bundle into bin directory
        const binDir = join(tmpDir, "bin");
        await mkdir(binDir);
        await cp("lib", binDir, { recursive: true });

        // Install typescript
        await execAsync("npm install typescript", { cwd: tmpDir });
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true });
    });

    it("correctly outputs help", async () => {
        const { stdout, stderr } = await execAsync("node bin/typedoc.js --help", { cwd: tmpDir });
        assert.equal(stderr, "");
        assert.match(stdout, /^typedoc path\/to\/entry\.ts.*/);
    });
});
