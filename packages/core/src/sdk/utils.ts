import { transpileModule, ScriptTarget, ModuleKind } from 'typescript';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import os from 'os';

export async function transpileAgent(agentPath: string): Promise<string> {
    // Create a temp folder for compiled JS
    const outDir = path.join(os.tmpdir(), "nearai_ts_compiled");
    if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true });
    }

    // Read the original TS source
    const tsCode = readFileSync(agentPath, 'utf-8');

    // Transpile using TypeScript’s built-in API
    // This matches your old example of { module: ES2022, target: ESNext, etc. }
    const { outputText } = transpileModule(tsCode, {
        compilerOptions: {
            module: ModuleKind.ES2022,    // = 6
            target: ScriptTarget.ESNext,  // = 99
            esModuleInterop: true,
            moduleResolution: 2,         // NodeNext
        }
    });

    // Write out as a plain .js file
    const outJsPath = path.join(
        outDir,
        path.basename(agentPath, '.ts') + '.js'
    );
    writeFileSync(outJsPath, outputText);

    // Write out a package.json to make it a module
    writeFileSync(
        path.join(outDir, 'package.json'),
        JSON.stringify({ type: "module" })
    );

    return outJsPath;
}