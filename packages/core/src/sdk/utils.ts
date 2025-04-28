import ts from "typescript";
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import os from 'os';
import fs from 'fs';
import dotenv from 'dotenv';

export async function transpileAgent(
    entryTs: string,
    allowList?: string[]
): Promise<string> {
    const outDir = path.join(os.tmpdir(), "nearai_ts_compiled");
    mkdirSync(outDir, { recursive: true });

    /*──── Legacy mode ────*/
    if (allowList?.length) {
        let entryOut = "";
        for (const tsFile of allowList) {
            const js = ts.transpileModule(
                readFileSync(tsFile, "utf-8"),
                {
                    compilerOptions: {
                        module: ts.ModuleKind.ES2022,
                        target: ts.ScriptTarget.ESNext,
                        moduleResolution: ts.ModuleResolutionKind.NodeNext,
                        esModuleInterop: true,
                    },
                    fileName: tsFile,
                }
            ).outputText;

            const outPath = path.join(outDir,
                path.basename(tsFile).replace(/\.ts$/, ".js"));
            writeFileSync(outPath, js);
            if (path.resolve(tsFile) === path.resolve(entryTs)) entryOut = outPath;
        }
        writeFlag(outDir);
        return entryOut;
    }

    /*──── Graph mode (CLI) ────*/
    const program = ts.createProgram([entryTs], {
        module: ts.ModuleKind.ES2022,
        target: ts.ScriptTarget.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        rootDir: path.dirname(entryTs),
        outDir,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        inlineSourceMap: true
    });
    program.emit();

    const rel = path
        .relative(path.dirname(entryTs), entryTs)
        .replace(/\.ts$/, ".js");

    writeFlag(outDir);
    return path.join(outDir, rel);
}

function writeFlag(dir: string) {
    try {
        writeFileSync(
            path.join(dir, "package.json"),
            JSON.stringify({ type: "module" }),
            { flag: "wx" }          // don’t overwrite if already there
        );
    } catch {}
}

export function loadEnvVariables(
    agentDir: string,
    envKeys: string[] = []
): Record<string, string> {
    const envVars: Record<string, string> = {};

    // Agent's local .env
    const localEnvPath = path.join(path.dirname(agentDir), '.env');
    if (fs.existsSync(localEnvPath)) {
        const parsed = dotenv.parse(fs.readFileSync(localEnvPath));
        Object.assign(envVars, parsed);
    }

    // Whitelist of env keys to load
    envKeys.forEach((k) => {
        if (process.env[k] !== undefined) envVars[k] = process.env[k] as string;
    });

    return envVars;
}