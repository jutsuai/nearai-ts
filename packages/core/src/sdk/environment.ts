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
        // @TODO - Explore what I was doing here
        // if (role === 'user') {
        //     const lastUser = this.localUserMessages[this.localUserMessages.length - 1];
        //     return lastUser || null;
        // }
        return super.fetchLastMessage(role);
    }

    public override async fetchLastMessageContent(role = 'user'): Promise<string> {
        const message = await this.fetchLastMessage(role);
        if (!message) return '';
        // Check if message.content is an array in the expected structure.
        if (Array.isArray(message.content) && message.content.length > 0) {
            const first = message.content[0];
            if (first && first.type === 'text' && first.text && typeof first.text.value === 'string') {
                return first.text.value;
            }
        }
        // If message.content is a plain string, return it.
        if (typeof message.content === 'string') {
            return message.content;
        }
        return '';
    }

    public getAllLocalMessages() {
        return this.localUserMessages;
    }
}

let _env: Environment | null = null;

export function initEnv(config: AgentConfig): void {
    if (_env) throw new Error('Environment already initialized');
    _env = new Environment(config);
    config.env = _env;
}

export function env(): Environment {
    if (!_env) throw new Error('Environment not initialized');
    return _env;
}
