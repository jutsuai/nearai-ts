import OpenAI from "openai";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { spawn } from "node:child_process";
import { transpile } from "typescript";
import { readFileSync, writeFileSync, existsSync }  from 'node:fs';

class AgentEnvironment {
    private openai: OpenAI;
    private name: string;
    private model: string;

    constructor(
      name: string = "Agent",
      model: string = "llama-v3p1-70b-instruct",
      ) {
        this.name = name;
        this.model = model;

        // 1) Load NEAR credentials from ~/.nearai/config.json
        const configPath = path.join(os.homedir(), ".nearai", "config.json");
        if (!fs.existsSync(configPath)) {
            throw new Error(`No config found at ${configPath}`);
        }
        const rawConfig = fs.readFileSync(configPath, "utf-8");
        const authData = JSON.parse(rawConfig).auth; // e.g. { account_id, signature, public_key, etc. }

        // 2) Convert that to a string for “apiKey”
        const userAuthString = JSON.stringify(authData);

        // 3) Initialize the OpenAI client with near.ai base URL
        this.openai = new OpenAI({
            baseURL: "https://api.near.ai/v1",
            apiKey: userAuthString, // We store the credentials here for lack of a better place
        });
    }

    async chat(userInput: any) {
        const messages = [
            { role: "system", content: "You are a helpful AI agent." },
            { role: "user", content: userInput },
        ] as any;

        const response = await this.openai.chat.completions.create({
          model: 'llama-v3p1-70b-instruct',
          messages,
        }) as any;

        return response?.choices?.[0]?.message?.content || "[No content returned]";
    }

    private transpileCode(tsPath: string): string {
        let fullPath = tsPath;
        if (!existsSync(tsPath)) {
            fullPath = path.join(process.cwd(), tsPath);
        }

        const tsCode = readFileSync(fullPath, 'utf-8');
        return transpile(tsCode, {
            module: 6, // ES2022
            target: 99, // ESNext
            esModuleInterop: true,
            moduleResolution: 2 // NodeNext
        });
    }

    async run(agentPath: string, userMessage: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let output = "";

            const resolvedAgent = path.isAbsolute(agentPath)
                ? agentPath
                : path.resolve(process.cwd(), agentPath);

            // Transpile the typescript agent file to js
            const agentJsCode = this.transpileCode(resolvedAgent);

            // Write the transpiled code to the same directory as the agent file
            const agentJsPath = resolvedAgent.replace(/\.ts$/, ".js");
            writeFileSync(agentJsPath, agentJsCode);

            // Run the agent using 'npx ts-node'
            const proc = spawn("npx", ["node", "--no-warnings", agentJsPath, userMessage], {
                stdio: ["ignore", "pipe", "pipe"],
                shell: true
            });

            proc.stdout.on("data", (data) => {
                output += data.toString();
            });
            proc.stderr.on("data", (data) => {
                output += data.toString();
            });
            proc.on("close", (code) => {
                if (code !== 0) {
                    return reject(new Error(`Child process exit code ${code}\nLogs:\n${output}`));
                }
                resolve(output.trim());
            });

            // If there's an immediate spawn error (like 'npx' not found),
            // it will emit an 'error' event. You can optionally handle that:
            proc.on("error", (err) => {
                reject(err);
            });
        });
    }
}

export default AgentEnvironment;