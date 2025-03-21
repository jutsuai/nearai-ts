import OpenAI from 'openai';
import { AgentConfig } from '../interfaces.js';

export class Client {
    protected config: AgentConfig;
    protected hubClient: OpenAI;
    protected threadId: string;
    protected envVars?: Record<string, string>;
    protected baseUrl: string;

    constructor(config: AgentConfig) {
        this.config = config;
        this.envVars = config.envVars;
        this.threadId = config.threadId ?? 'thread_local';
        this.baseUrl = config.baseUrl ?? 'https://api.near.ai/v1';
        const userAuthString = config.auth ? JSON.stringify(config.auth) : '';
        this.hubClient = new OpenAI({
            baseURL: this.baseUrl,
            apiKey: userAuthString
        });
    }

    public async listMessages(
        threadId?: string,
        limit?: number,
        order: 'asc' | 'desc' = 'asc'
    ): Promise<any[]> {
        throw new Error('Not implemented');
    }

    public async fetchLastMessage(role = 'user'): Promise<any | null> {
        throw new Error('Not implemented');
    }

    public async fetchLastMessageContent(role = 'user'): Promise<string> {
        throw new Error('Not implemented');
    }

    public async writeFile(
        filename: string,
        content: string,
        encoding = 'utf-8',
        fileType = 'text/plain',
        writeToDisk = true
    ): Promise<any> {
        throw new Error('Not implemented');
    }

    public async readFile(filename: string): Promise<string> {
        throw new Error('Not implemented');
    }

    public async generateCompletion(
        messages: any[],
        model = '',
        maxTokens = 4000,
        temperature = 0.7,
        tools?: any[]
    ): Promise<string | null> {
        throw new Error('Not implemented');
    }

    public async postAssistantReply(
        message: string | null,
        messageType = ''
    ): Promise<any> {
        throw new Error('Not implemented');
    }

    public getEnvVar(key: string): string | undefined {
        throw new Error('Not implemented');
    }

    public async queryVectorStore(
        vectorStoreId: string,
        query: string,
        fullFiles = false
    ): Promise<any> {
        throw new Error('Not implemented');
    }

    public async addFileToVectorStore(
        vectorStoreId: string,
        fileId: string
    ): Promise<any> {
        throw new Error('Not implemented');
    }

    public async createVectorStore(
        name: string,
        fileIds: string[],
        expiresAfter: any,
        chunkingStrategy: any,
        metadata: unknown | null = null
    ): Promise<any | null> {
        throw new Error('Not implemented');
    }

    public async uploadFile(
        fileContent: string,
        purpose: any,
        encoding = 'utf-8',
        fileName = 'file.txt',
        fileType = 'text/plain'
    ): Promise<any> {
        throw new Error('Not implemented');
    }

    public getThreadId(): string {
        throw new Error('Not implemented');
    }
}
