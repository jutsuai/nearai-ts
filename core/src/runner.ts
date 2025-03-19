import OpenAI from "openai";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { spawn } from "node:child_process";

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

    async run(agentPath: string, userMessage: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let output = "";
            const proc = spawn("ts-node", [agentPath, userMessage], {
                stdio: ["ignore", "pipe", "pipe"],
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
        });
    }
}

export default AgentEnvironment;