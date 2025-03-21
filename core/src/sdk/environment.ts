import { Client } from './client.js';
import { AgentConfig } from '../interfaces.js';

export class Environment extends Client {
    private localUserMessage?: string;

    constructor(config: AgentConfig) {
        super(config);
    }

    public getEnvVar(key: string): string | undefined {
        return this.envVars?.[key];
    }

    public getThreadId(): string {
        return this.threadId;
    }

    public setLocalUserMessage(message: string) {
        this.localUserMessage = message;
    }

    public override async fetchLastMessage(role = 'user'): Promise<any | null> {
        if (role === 'user' && this.localUserMessage) {
            const msg = {
                role: 'user',
                content: this.localUserMessage
            };
            this.localUserMessage = undefined;
            return msg;
        }
        return super.fetchLastMessage(role);
    }

    public override async fetchLastMessageContent(role = 'user'): Promise<string> {
        const message = await this.fetchLastMessage(role);
        if (!message) return '';
        return message.content ?? '';
    }
}

let _env: Environment | null = null;

export function initEnv(config: AgentConfig): void {
    if (_env) throw new Error('Environment already initialized');
    _env = new Environment(config);
}

export function env(): Environment {
    if (!_env) throw new Error('Environment not initialized');
    return _env;
}
