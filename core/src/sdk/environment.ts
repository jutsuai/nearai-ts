import { Client } from './client.js';
import { AgentConfig } from '../interfaces.js';

export class Environment extends Client {
    constructor(config: AgentConfig) {
        super(config);
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
