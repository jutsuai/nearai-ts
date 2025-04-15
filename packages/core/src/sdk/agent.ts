import { AgentConfig, AgentRunOptions } from '../interfaces.js';
import { Environment } from './environment.js';
import { Client } from './client.js';

export class Agent {
    private env: Environment;
    private client: any;
    private chainMessages: Array<{ role: 'system' | 'assistant' | 'user'; content: string }> = [];


    constructor(config: AgentConfig) {
        this.env = new Environment(config);
        this.client = new Client(config);
    }

    public raw(): Client {
        return this.client;
    }

    public getEnvironment(): Environment {
        return this.env;
    }

    public system(content: string): Agent {
        this.chainMessages.push({ role: 'system', content });
        return this;
    }

    public user(content: string): Agent {
        this.chainMessages.push({ role: 'user', content });
        return this;
    }

    public assistant(content: string): Agent {
        this.chainMessages.push({ role: 'assistant', content });
        return this;
    }

    public async run(options?: AgentRunOptions): Promise<string | null> {
        const reply = await this.env.generateCompletion(
            this.chainMessages,
            options?.model ?? "llama-v3p1-70b-instruct",
            options?.maxTokens ?? 4000,
            options?.temperature ?? 0.7,
            options?.tools,
            options?.stream ?? false
        );

        // Store the reply in the thread
        if (reply && this.env.getThreadId() !== "thread_local") {
            await this.env.addReply(reply);
        }

        // Decide if we should clear the chain if you want each run() to start fresh
        // or keep them here to accumulate context
        // this.chainMessages = [];

        return reply;
    }

    /**
     * Chainable sub-API for messages.
     * Example usage:
     *   near.messages().list()
     *   near.messages().add("Hello")
     */
    public messages(threadId?: string) {
        const finalThreadId = threadId ?? this.env.getThreadId();
        return {
            list: async (limit?: number, order: 'asc' | 'desc' = 'asc') => {
                return this.env.listMessages(finalThreadId, limit, order);
            },
            add: async (content: string, role: 'assistant' | 'user' = 'assistant') => {
                return this.env.addReply(content);
            },
            lastUser: async () => {
                return this.env.fetchLastMessageContent('user');
            },
            lastAssistant: async () => {
                return this.env.fetchLastMessageContent('assistant');
            },
        };
    }

    /**
     * Chainable sub-API for completions.
     */
    public completions() {
        return {
            generate: async (
                messages: Array<{ role: "assistant" | "user" | "system"; content: string }>,
                model?: string
            ) => {
                return this.env.generateCompletion(messages, model);
            }
        };
    }

    /**
     * Chainable sub-API for file ops.
     */
    public files() {
        return {
            read: async (filename: string) => this.env.readFile(filename),
            write: async (filename: string, content: string) => this.env.writeFile(filename, content),
            upload: async (fileContent: string, purpose: string) => this.env.uploadFile(fileContent, purpose),
        };
    }

    /**
     * Chainable sub-API for vector store ops.
     */
    public vectors() {
        return {
            query: async (vectorStoreId: string, query: string, fullFiles = false) =>
                this.env.queryVectorStore(vectorStoreId, query, fullFiles),
            addFile: async (vectorStoreId: string, fileId: string) =>
                this.env.addFileToVectorStore(vectorStoreId, fileId),
            create: async (
                name: string,
                fileIds: string[],
                expiresAfter: any,
                chunkingStrategy: any,
                metadata: unknown | null = null
            ) => this.env.createVectorStore(name, fileIds, expiresAfter, chunkingStrategy, metadata)
        };
    }
}
