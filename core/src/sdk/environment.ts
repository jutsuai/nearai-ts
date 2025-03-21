import { Client } from './client.js';
import { AgentConfig } from '../interfaces.js';

export class Environment extends Client {
    private localUserMessages: Array<{ role: 'user'; content: string }> = [];

    constructor(config: AgentConfig) {
        super(config);
    }

    public getEnvVar(key: string): string | undefined {
        return this.envVars?.[key];
    }

    public getThreadId(): string {
        return this.threadId;
    }

    public setLocalUserMessage(content: string) {
        this.localUserMessages.push({ role: 'user', content });
    }

    public override async fetchLastMessage(role = 'user'): Promise<any | null> {
        // If you only want the very last user message:
        if (role === 'user') {
            const lastUser = this.localUserMessages[this.localUserMessages.length - 1];
            return lastUser || null;
        }
        return super.fetchLastMessage(role);
    }

    public override async fetchLastMessageContent(role = 'user'): Promise<string> {
        const message = await this.fetchLastMessage(role);
        if (!message) return '';
        return message.content ?? '';
    }

    public getAllLocalMessages() {
        return this.localUserMessages;
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
