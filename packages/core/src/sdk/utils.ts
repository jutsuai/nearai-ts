import { build } from "esbuild";
import path from "path";
import fs from "fs";
import os from "os";

export async function transpileAgent(agentPath: string): Promise<string> {
    const outDir = path.join(os.tmpdir(), "nearai_ts_compiled");
    fs.mkdirSync(outDir, { recursive: true });

    const jsPath = path.join(outDir, path.basename(agentPath, ".ts") + ".js");

    await build({
        entryPoints: [agentPath],
        outfile: jsPath,
        bundle: true,
        platform: "node",
        format: "esm",
        sourcemap: false
    });

    if (!fs.existsSync(jsPath)) {
        throw new Error(`Transpile failed; ${jsPath} does not exist.`);
    }

    return jsPath;
}