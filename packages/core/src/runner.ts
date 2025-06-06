import { config as dotenvConfig } from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { RunnerResult, AgentConfig } from './interfaces.js';
import { loadEnvVariables } from './sdk/utils.js';
import { initEnv } from './sdk/environment.js';
import { transpileAgent } from './sdk/utils.js';

export async function runner(): Promise<RunnerResult> {
    dotenvConfig();

    // Grab agent path from argv
    const agentPath = process.argv[2];
    if (!agentPath) {
        throw new Error('Missing agent path. Usage: nearai-ts run <agentPath> [configJson]');
    }

    // Grab config JSON from argv or read from ~/.nearai/config.json
    let configJson = process.argv[3];
    if (!configJson) {
        const homeDir = os.homedir();
        const configFilePath = path.join(homeDir, '.nearai', 'config.json');
        if (fs.existsSync(configFilePath)) {
            configJson = fs.readFileSync(configFilePath, 'utf-8');
        }
    }

    // Parse the agent config JSON
    let agentConfig: AgentConfig = {};
    if (configJson) {
        try {
            agentConfig = JSON.parse(configJson) as AgentConfig;

            // Remap python config keys to JS config keys
            if ((agentConfig as any).user_auth && !agentConfig.auth) {
                agentConfig.auth = (agentConfig as any).user_auth;
                delete (agentConfig as any).user_auth;
            }
            if ((agentConfig as any).base_url && !agentConfig.baseUrl) {
                agentConfig.baseUrl = (agentConfig as any).base_url;
                delete (agentConfig as any).base_url;
            }
            if ((agentConfig as any).thread_id && !agentConfig.threadId) {
                agentConfig.threadId = (agentConfig as any).thread_id;
                delete (agentConfig as any).thread_id;
            }

            // Reset baseUrl and threadId if not provided
            agentConfig.baseUrl = agentConfig.baseUrl ?? 'https://api.near.ai/v1';
            agentConfig.threadId = agentConfig.threadId ?? 'thread_local';
        } catch (err) {
            throw new Error(`Failed to parse config JSON: ${err}`);
        }
    }

    // If agent is TS, transpile it first. Otherwise, use it as-is.
    // @TODO - Make sure this transpilation update (for multiple files) is correct
    const absoluteAgentPath = path.resolve(agentPath);
    const allowList = (agentConfig as any).agent_ts_files_to_transpile as string[] | undefined;
    const finalImportPath = await transpileAgent(
        absoluteAgentPath,
        allowList
    );

    // Load environment variables
    agentConfig.envVars = loadEnvVariables(
        absoluteAgentPath,
        ['CDP_API_KEY_NAME', 'CDP_API_KEY_PRIVATE_KEY']
    );

    // Check if --local flag is present, override baseUrl if you want
    const localFlagIndex = process.argv.findIndex(arg => arg === '--local');
    if (localFlagIndex !== -1) {
        agentConfig.baseUrl = 'http://localhost:8081/v1';
    }

    // Initialize the environment
    initEnv(agentConfig);

    // Dynamically import the agent module
    let agentModule;
    try {
        agentModule = await import(finalImportPath);
    } catch (err) {
        throw new Error(`Could not import agent at path: ${finalImportPath}\n${err}`);
    }

    return {
        agentConfig,
        agentModule
    };
}

// If we run it directly from node
if (import.meta.url === `file://${process.argv[1]}`) {
    runner()
        .then(({ agentConfig, agentModule }) => {
            console.log('Runner was called directly. Environment is loaded.');
            console.log(`Agent path: ${process.argv[2]}`);
            if (typeof agentModule.default === 'function') {
                agentModule.default(agentConfig)
                    .then((result: any) => {
                        console.log('Agent default returned:', result);
                    })
                    .catch((err: any) => {
                        console.error('Error running agent default:', err);
                        process.exit(1);
                    });
            }
        })
        .catch((err) => {
            console.error('Runner error:', err);
            process.exit(1);
        });
}
