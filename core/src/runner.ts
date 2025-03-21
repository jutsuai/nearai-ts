import { config as dotenvConfig } from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { AgentConfig } from './interfaces.js';
import { initEnv } from './sdk/environment.js';

export interface RunnerResult {
    agentConfig: AgentConfig;
    agentModule: any;
}

export async function runner(): Promise<RunnerResult> {
    dotenvConfig();

    const agentPath = process.argv[2];
    if (!agentPath) {
        throw new Error('Missing agent path. Usage: nearai-ts run <agentPath> [configJson]');
    }

    let configJson = process.argv[3];
    if (!configJson) {
        const homeDir = os.homedir();
        const configFilePath = path.join(homeDir, '.nearai', 'config.json');
        if (fs.existsSync(configFilePath)) {
            configJson = fs.readFileSync(configFilePath, 'utf-8');
        }
    }

    let agentConfig: AgentConfig = {};
    if (configJson) {
        try {
            agentConfig = JSON.parse(configJson) as AgentConfig;
        } catch (err) {
            throw new Error(`Failed to parse config JSON: ${err}`);
        }
    }

    agentConfig.baseUrl = agentConfig.baseUrl ?? 'https://api.near.ai/v1';
    agentConfig.threadId = agentConfig.threadId ?? 'thread_local';

    initEnv(agentConfig);

    const absoluteAgentPath = path.resolve(agentPath);
    let agentModule;
    try {
        agentModule = await import(absoluteAgentPath);
    } catch (err) {
        throw new Error(`Could not import agent at path: ${agentPath}\n${err}`);
    }

    return {
        agentConfig,
        agentModule
    };
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runner()
        .then(({ agentConfig, agentModule }) => {
            console.log('Runner was called directly. Environment is initialized.');
            console.log(`Agent path loaded: ${process.argv[2]}`);
            console.log('If you wanted to run the agent right away, you could do so here.');
            // For direct usage:
            // if (typeof agentModule.default === 'function') {
            //   await agentModule.default(agentConfig);
            // }
        })
        .catch((err) => {
            console.error('Runner error:', err);
            process.exit(1);
        });
}
