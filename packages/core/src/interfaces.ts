export interface AgentConfig {
    auth?: NearAIAgentAuth;       // Uses "authData.auth" from ~/.nearai/config.json
    baseUrl?: string;             // e.g. "https://api.near.ai/v1"
    threadId?: string;            // e.g. "thread_local"
    envVars?: Record<string, string>;
    env?: any;
}

export interface AgentRunOptions {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    tools?: any[];
    stream?: boolean;
}

export interface RunnerResult {
    agentConfig: AgentConfig;
    agentModule: any;
}

export interface NearAIAgentAuth {
    account_id?: string;
    signature?: string;
    public_key?: string;
    callback_url?: string;
    nonce?: string;
    recipient?: string;
    message?: string;
    on_behalf_of?: string | null;
}