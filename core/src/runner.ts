import { config as dotenvConfig } from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { AgentConfig } from './interfaces.js';
import { initEnv } from './sdk/environment.js';

export async function runner() {
    // Load .env if present
    dotenvConfig();

    // Grab the agent path from CLI
    const agentPath = process.argv[2];
    if (!agentPath) {
        throw new Error('Missing agent path. Usage: nearai-ts run <agentPath> [configJson]');
    }

    // Optional config JSON string
    let configJson = process.argv[3];

    // If no config JSON is provided, try to read ~/.nearai/config.json
    if (!configJson) {
        const homeDir = os.homedir();
        const configFilePath = path.join(homeDir, '.nearai', 'config.json');
        if (fs.existsSync(configFilePath)) {
            const raw = fs.readFileSync(configFilePath, 'utf-8');
            configJson = raw;
        }
    }

    // Parse the config into our AgentConfig interface
    let agentConfig: AgentConfig = {};
    if (configJson) {
        try {
            agentConfig = JSON.parse(configJson) as AgentConfig;
        } catch (err) {
            throw new Error(`Failed to parse config JSON: ${err}`);
        }
    }

    // Set defaults if not present
    agentConfig.baseUrl = agentConfig.baseUrl ?? 'https://api.near.ai/v1';
    agentConfig.threadId = agentConfig.threadId ?? 'thread_local';

    // Initialize the environment
    initEnv(agentConfig);

    // Dynamically import the agent module
    const absoluteAgentPath = path.resolve(agentPath);
    let agentModule;
    try {
        agentModule = await import(absoluteAgentPath);
    } catch (err) {
        throw new Error(`Could not import agent at path: ${agentPath}\n${err}`);
    }

    // We assume the agent module exports either:
    if (typeof agentModule.default === 'function') {
        // If agent has a default export that is a function, run it
        await agentModule.default(agentConfig);
    } else if (typeof agentModule.Agent === 'function') {
        await agentModule.Agent(agentConfig);
    } else {
        throw new Error(
            'Agent module must export a default() or runAgent() function.'
        );
    }
}

// If this script is called directly (node runner.js ...), run it.
if (import.meta.url === `file://${process.argv[1]}`) {
    runner().catch((err) => {
        console.error('Runner error:', err);
        process.exit(1);
    });
}