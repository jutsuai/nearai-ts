import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { spawn } from "node:child_process";
import dotenv from "dotenv";
// import { globalEnv } from "./environment/globalEnv.js";

/**
 * runAgent
 *
 * Combines the old main.ts behavior into a single function.
 * - Reads optional config JSON (either from an argument or ~/.nearai/config.json).
 * - Initializes the globalEnv, which triggers agent transpilation.
 *
 * @param agentPath  Path to the main TypeScript agent file (e.g. "agents/agent.ts")
 * @param jsonString Optional JSON config string for nearAI environment
 * @param configPath Optional path to a config file (defaults to ~/.nearai/config.json)
 */
export async function runAgent(
    agentPath: string,
    jsonString?: string,
    configPath?: string,
): Promise<void> {

    // Load any .env variables if they exist
    dotenv.config();

    if (!agentPath) {
        throw new Error("Missing agent path. Please specify the path to your .ts agent file.");
    }

    // If no jsonString was provided, attempt to load from a local config file
    if (!jsonString) {

        // Default to ~/.nearai/config.json if no custom path is given
        const defaultConfigPath = path.join(os.homedir(), ".nearai", "config.json");
        configPath = configPath || defaultConfigPath;

        try {
            const data = fs.readFileSync(configPath, "utf-8");
            const authData = JSON.parse(data);

            // Example of local deployment keys for environment injection
            // @TODO - Update this to load from developer .env file or custom env vars
            // const localDeploymentKeys = ["CDP_API_KEY_NAME", "CDP_API_KEY_PRIVATE_KEY"];

            // Helper to gather relevant environment variables
            const getEnvVariables = (keys: string[]): Record<string, string> => {
                const result: Record<string, string> = {};
                keys.forEach((key) => {
                    const value = process.env[key];
                    if (value) result[key] = value;
                });
                return result;
            };

            // Construct the JSON string the old code expected
            jsonString = JSON.stringify({
                user_auth: JSON.stringify(authData.auth),
                thread_id: "thread_local",
                base_url: "https://api.near.ai/v1",
                // @TODO - The old code forced "agents/agent.ts"; adapt as needed
                agent_ts_files_to_transpile: [agentPath],
                // env_vars: getEnvVariables(localDeploymentKeys),
            });
        } catch (error) {
            throw new Error(
                `No valid configuration found. 
                Either provide a jsonString or ensure ${configPath} is valid.`
            );
        }
    }

    // @TODO - Hold off on doing this until we update the SDK pattern
    // Initialize the global environment, which will:
    // - Parse & store config
    // - Create a SecureHubClient
    // - Transpile & run your TS agent(s) via AgentEnv
    // globalEnv.initialize(jsonString);

    // @TODO - o more work after environment init:
    // e.g., log success, manipulate the globalEnv.client, etc.
}

export async function runAgentOnePass(agentPath: string): Promise<string> {
    // convert "agent.ts" => "agent.js"
    const compiledJs = agentPath.replace(/\.ts$/, ".js");
    return new Promise<string>((resolve, reject) => {
        let output = "";
        const proc = spawn("node", [compiledJs], { stdio: ["ignore", "pipe", "pipe"] });

        proc.stdout.on("data", (buf) => {
            output += buf.toString();
        });
        proc.stderr.on("data", (buf) => {
            output += "ERR: " + buf.toString();
        });
        proc.on("close", (code) => {
            if (code !== 0) {
                return reject(new Error(`Agent script exit code ${code}\nLogs:\n${output}`));
            }
            resolve(output.trim());
        });
    });
}