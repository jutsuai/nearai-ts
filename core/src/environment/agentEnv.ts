import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { transpile } from "typescript";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class AgentEnv {
    async loadAgent(agent_ts_files_to_transpile: string[]): Promise<void> {
        let agent_main_js_path = "";

        // Transpile each agent file and write the output to disk
        for (const agent_ts_path of agent_ts_files_to_transpile) {
            const agent_js_code = this.transpileCode(agent_ts_path);
            const agent_js_filename = agent_ts_path
                .split("/")
                .pop()
                ?.replace(/\.ts$/, ".js");

            if (agent_js_filename) {
                const agent_js_path = join(__dirname, agent_js_filename);
                writeFileSync(agent_js_path, agent_js_code);

                // If the file is named "agent.js", treat it as the main entry
                if (agent_js_filename === "agent.js") {
                    agent_main_js_path = agent_js_path;
                }
            }
        }

        if (!agent_main_js_path) {
            return;
        }

        const module = await import(agent_main_js_path);
        if (module.default) {
            module.default();
        }
    }

    private transpileCode(tsPath: string): string {
        let fullPath = tsPath;
        if (!existsSync(tsPath)) {
            fullPath = join(process.cwd(), tsPath);
        }

        const tsCode = readFileSync(fullPath, "utf-8");
        return transpile(tsCode, {
            module: 6,                  // ES2022
            target: 99,                 // ESNext
            esModuleInterop: true,
            moduleResolution: 2         // NodeNext
        });
    }
}
