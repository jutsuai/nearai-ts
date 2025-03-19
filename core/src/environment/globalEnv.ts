import { configManager } from "../config/configManager.js";
import type { SecureHubClient } from "../clients/secureClient.js";
import { AgentEnv } from "./agentEnv.js";

class GlobalEnvironment {
    private static instance: GlobalEnvironment | null = null;
    private _client: SecureHubClient | null = null;
    private _initialized = false;
    public thread_id = "";

    private constructor() {}

    static getInstance(): GlobalEnvironment {
        if (!GlobalEnvironment.instance) {
            GlobalEnvironment.instance = new GlobalEnvironment();
        }
        return GlobalEnvironment.instance;
    }

    initialize(jsonString: string) {
        if (this._initialized) return;
        configManager.initialize(jsonString);
        this._client = configManager.getSecureClient();
        this._initialized = true;

        const agentEnv = new AgentEnv();
        agentEnv
            .runAgent(configManager.getConfig().agent_ts_files_to_transpile)
            .catch((err: any) => console.error("Fatal error:", err));
    }

    get client(): SecureHubClient {
        if (!this._client) {
            throw new Error("Global Environment not initialized. Call initialize() first.");
        }
        return this._client;
    }
}

export const globalEnv = GlobalEnvironment.getInstance();
