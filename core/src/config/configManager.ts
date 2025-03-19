import { AgentConfig } from "./configTypes.js";
import { NearAIClient } from "../clients/nearClient.js";
import type { SecureClient } from "../clients/secureClient.js";

interface ParsedParams {
    thread_id: string;
    user_auth: string;
    base_url: string;
    agent_ts_files_to_transpile: string[];
    env_vars: Record<string, string>;
}

class ConfigManager {
    private static instance: ConfigManager;
    private config: AgentConfig | null = null;
    private secureClient: NearAIClient | null = null;

    private constructor() {}

    static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    initialize(jsonString: string): boolean {
        if (!jsonString) {
            return false;
        }

        try {
            // Prevent re-initializing if a secureClient already exists
            if (this.secureClient) {
                return false;
            }

            const params: ParsedParams = JSON.parse(jsonString);
            this.config = {
                thread_id: params.thread_id,
                user_auth: params.user_auth,
                base_url: params.base_url,
                agent_ts_files_to_transpile: params.agent_ts_files_to_transpile,
                env_vars: params.env_vars
            };

            this.secureClient = new NearAIClient(this.config);
            return true;
        } catch (error) {
            throw new Error(`Failed to initialize config: ${error}`);
        }
    }

    getSecureClient(): SecureClient {
        if (!this.secureClient) {
            throw new Error("SecureClient not initialized. Call initialize() first.");
        }
        return this.secureClient;
    }

    getConfig(): AgentConfig {
        if (!this.config) {
            throw new Error("Config not initialized. Call initialize() first.");
        }
        // Return a copy without sensitive auth info
        const sanitized = { ...this.config, user_auth: "" };
        return sanitized;
    }
}

export const configManager = ConfigManager.getInstance();
