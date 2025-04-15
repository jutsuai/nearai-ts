import OpenAI, { toFile } from 'openai';
import { FileObject } from 'openai/resources/files';
import { AgentConfig } from '../interfaces.js';

import {
    BaseClient,
    RegistryClient,
    AgentsClient,
    BenchmarkClient,
    DelegationClient,
    EvaluationClient,
    FilesClient,
    HubSecretsClient,
    JobsClient,
    LogsClient,
    PermissionsClient,
    RunScheduleClient,
    StarsClient,
    ThreadsClient,
    VectorStoresClient
} from './clients/index.js';

import {
    // For typed responses in threads subclient
    MessageOutput,
    ListMessagesQuery,
    ListMessagesResponse,
} from './clients/interfaces/IThreadsClient.js';

import {
    UploadFileRequest,
    UploadFileResponse,
} from './clients/interfaces/IFilesClient.js';

import {
    CreateVectorStoreRequest,
    QueryVectorStoreRequest,
} from './clients/interfaces/IVectorStoresClient.js';

export class Client {
    protected config: AgentConfig;
    protected hubClient: OpenAI;
    protected threadId: string;
    protected envVars?: Record<string, string>;
    protected baseUrl: string;

    // Subclient fields
    public base: BaseClient;
    public registry: RegistryClient;
    public agents: AgentsClient;
    public benchmark: BenchmarkClient;
    public delegation: DelegationClient;
    public evaluation: EvaluationClient;
    public files: FilesClient;
    public hubSecrets: HubSecretsClient;
    public jobs: JobsClient;
    public logs: LogsClient;
    public permissions: PermissionsClient;
    public runSchedule: RunScheduleClient;
    public stars: StarsClient;
    public threads: ThreadsClient;
    public vectorStores: VectorStoresClient;

    constructor(config: AgentConfig) {
        this.config = config;
        this.envVars = config.envVars;
        this.threadId = config.threadId ?? 'thread_local';
        this.baseUrl = config.baseUrl ?? 'https://api.near.ai/v1';

        if (!config.auth) {
            throw new Error('No auth provided in AgentConfig; near.ai requires an auth object.');
        }

        const userAuthString = typeof config.auth === 'string'
            ? config.auth
            : JSON.stringify(config.auth);

        if (userAuthString === '{}') {
            throw new Error(
                'Invalid auth object. Make sure ~/.nearai/config.json has { "auth": { ... } } with all required keys.'
            );
        }

        this.hubClient = new OpenAI({
            baseURL: this.baseUrl,
            apiKey: userAuthString
        });

        // Instantiate subclients
        this.base = new BaseClient(config, this.hubClient);
        this.registry = new RegistryClient(config, this.hubClient);
        this.agents = new AgentsClient(config, this.hubClient);
        this.benchmark = new BenchmarkClient(config, this.hubClient);
        this.delegation = new DelegationClient(config, this.hubClient);
        this.evaluation = new EvaluationClient(config, this.hubClient);
        this.files = new FilesClient(config, this.hubClient);
        this.hubSecrets = new HubSecretsClient(config, this.hubClient);
        this.jobs = new JobsClient(config, this.hubClient);
        this.logs = new LogsClient(config, this.hubClient);
        this.permissions = new PermissionsClient(config, this.hubClient);
        this.runSchedule = new RunScheduleClient(config, this.hubClient);
        this.stars = new StarsClient(config, this.hubClient);
        this.threads = new ThreadsClient(config, this.hubClient);
        this.vectorStores = new VectorStoresClient(config, this.hubClient);
    }

    // -------------------------------------------------------------
    // REFRESHED convenience methods, calling subclients instead of
    // direct hubClient.* or fetch calls
    // -------------------------------------------------------------









    //
    // @TODO: Refactor to use sub clients
    //

    public async listMessages(
        threadId?: string,
        limit?: number,
        order: 'asc' | 'desc' = 'asc'
    ): Promise<any[]> {
        const finalThreadId = threadId ?? this.threadId;
        try {
            const response = await this.hubClient.beta.threads.messages.list(
                finalThreadId,
                { order, limit },
                {}
            );
            return response.data;
        } catch (error: any) {
            if (error.status === 404) {
                return [];
            }
            throw error;
        }
    }

    public async fetchLastMessage(role = 'user'): Promise<any | null> {
        const messages = await this.listMessages();
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i]?.role === role) {
                return messages[i];
            }
        }
        return null;
    }

    public async fetchLastMessageContent(role = 'user'): Promise<string> {
        const message = await this.fetchLastMessage(role);
        if (!message) return '';
        return message.content ?? '';
    }

    public async writeFile(
        filename: string,
        content: string,
        encoding = 'utf-8',
        fileType = 'text/plain',
        writeToDisk = true
    ): Promise<FileObject> {
        const buffer = Buffer.from(content);
        const fileObj = await toFile(buffer, filename);
        return this.hubClient.files.create({ file: fileObj, purpose: 'assistants' });
    }

    public async readFile(filename: string): Promise<string> {
        const files = await this.listFilesFromThread('asc');
        const match = files.find((f: any) => f.filename === filename);
        if (!match) {
            throw new Error(`File not found: ${filename}`);
        }
        const content = await this.readFileById(match.id);
        return content;
    }

    public async uploadFile(
        fileContent: string,
        purpose: any,
        encoding = 'utf-8',
        fileName = 'file.txt',
        fileType = 'text/plain'
    ): Promise<FileObject> {
        const blob = new Blob([fileContent], { type: fileType });
        const file = new File([blob], fileName, { type: fileType, lastModified: Date.now() });
        return this.hubClient.files.create({ file, purpose });
    }

    private async listFilesFromThread(
        order: 'asc' | 'desc' = 'asc'
    ): Promise<any[]> {
        const messages = await this.listMessages(undefined, undefined, order);
        const attachments = messages.flatMap((m: any) => m.attachments ?? []);
        const fileIds = attachments.map((a: any) => a.file_id).filter(Boolean);
        const filePromises = fileIds.map((id: string) => this.hubClient.files.retrieve(id));
        const files = await Promise.all(filePromises);
        return files.filter((f) => f !== null);
    }

    private async readFileById(fileId: string): Promise<string> {
        const content = await this.hubClient.files.content(fileId);
        return await content.text();
    }

    public async generateCompletion(
        messages: Array<{ role: "system"|"assistant"|"user"; content: string }>,
        model = "llama-v3p1-70b-instruct",
        maxTokens = 4000,
        temperature = 0.7,
        tools?: any[],
        stream = false
    ): Promise<string | null> {
        // Provide a valid fallback model
        const finalModel = model.trim() || "llama-v3p1-70b-instruct";

        // near.ai expects correct shape for each message
        const validMessages = messages.map(m => ({
            role: m.role,
            content: m.content
        }));

        const params = {
            model: finalModel,
            messages: validMessages,
            temperature,
            max_tokens: maxTokens,
            tools
            // stream, // omitted if not supported
        };

        // If near.ai doesn't recognize "tools", remove it
        // delete params.tools;

        const response = await this.hubClient.chat.completions.create(params);
        return response.choices?.[0]?.message?.content ?? null;
    }

    public async addReply(
        message: string | null,
        messageType = ''
    ): Promise<any> {
        const body = {
            role: 'assistant',
            content: message ?? '',
            metadata: messageType ? { message_type: messageType } : undefined
        } as any;
        return this.hubClient.beta.threads.messages.create(this.threadId, body);
    }

    public async findVectorStore(idOrName: string): Promise<any> {
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.hubClient.apiKey}`
        };

        const isLikelyId = idOrName.startsWith('vs_');
        if (isLikelyId) {
            const endpoint = `${this.baseUrl}/vector_stores/${idOrName}`;
            const response = await fetch(endpoint, { method: 'GET', headers });
            if (!response.ok) {
                throw new Error(`Error fetching vector store: ${response.status} ${response.statusText}`);
            }
            return response.json();
        } else {
            const endpoint = `${this.baseUrl}/vector_stores?name=${encodeURIComponent(idOrName)}`;
            const response = await fetch(endpoint, { method: 'GET', headers });
            if (!response.ok) {
                throw new Error(`Error searching vector store by name: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();

            if (!data || !data.data || data.data.length === 0) {
                return null;
            }
            return data.data[0];
        }
    }

    public async queryVectorStore(
        vectorStoreId: string,
        query: string,
        fullFiles = false
    ): Promise<any> {
        const data = JSON.stringify({ query, full_files: fullFiles });
        const endpoint = `${this.baseUrl}/vector_stores/${vectorStoreId}/search`;
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.hubClient.apiKey}`
        };
        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: data
        });
        if (!response.ok) {
            throw new Error(`Error querying vector store: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }

    public async addFileToVectorStore(
        vectorStoreId: string,
        fileId: string
    ): Promise<any> {
        const endpoint = `${this.baseUrl}/vector_stores/${vectorStoreId}/files`;
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.hubClient.apiKey}`
        };
        const body = JSON.stringify({ file_id: fileId });

        const response = await fetch(endpoint, { method: 'POST', headers, body });
        if (!response.ok) {
            throw new Error(`Failed to add file to vector store: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }

    public async createVectorStore(
        name: string,
        fileIds: string[],
        expiresAfter: any,
        chunkingStrategy: any,
        metadata: unknown | null = null
    ): Promise<any | null> {
        const endpoint = `${this.baseUrl}/vector_stores`;
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.hubClient.apiKey}`
        };
        const body = JSON.stringify({
            name,
            file_ids: fileIds,
            expires_after: expiresAfter,
            chunking_strategy: chunkingStrategy,
            metadata
        });

        const response = await fetch(endpoint, { method: 'POST', headers, body });
        if (!response.ok) {
            throw new Error(`Failed to create vector store: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }
}
