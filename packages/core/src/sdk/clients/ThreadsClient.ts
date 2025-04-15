import OpenAI from 'openai';
import { AgentConfig } from '../../interfaces.js';
import {
    IThreadsClient,
    ThreadCreateParams,
    ThreadUpdateParams,
    ThreadDeletionStatus,
    ThreadForkResponse,
    SubthreadCreateParams,
    MessageCreateParams,
    MessageOutput,
    ListMessagesResponse,
    MessageUpdateParams,
    RunCreateParamsBase,
    Run,
    RunUpdateParams,
    Thread,
    ListThreadsQuery,
    ListMessagesQuery,
} from './interfaces/IThreadsClient.js';

export class ThreadsClient implements IThreadsClient {
    protected config: AgentConfig;
    protected hubClient: OpenAI;

    constructor(config: AgentConfig, hubClient: OpenAI) {
        this.config = config;
        this.hubClient = hubClient;
    }

    // 1) POST /v1/threads
    public async createThread(req: ThreadCreateParams): Promise<Thread> {
        return this.hubClient.request<ThreadCreateParams, Thread>({
            method: 'post',
            path: '/v1/threads',
            body: req,
        });
    }

    // 2) GET /v1/threads
    public async listThreads(query?: ListThreadsQuery): Promise<Thread[]> {
        return this.hubClient.request<unknown, Thread[]>({
            method: 'get',
            path: '/v1/threads',
            query,
        });
    }

    // 3) GET /v1/threads/{thread_id}
    public async getThread(threadId: string): Promise<Thread> {
        return this.hubClient.request<unknown, Thread>({
            method: 'get',
            path: `/v1/threads/${encodeURIComponent(threadId)}`,
        });
    }

    // 4) POST /v1/threads/{thread_id}
    public async updateThread(
        threadId: string,
        req: ThreadUpdateParams
    ): Promise<Thread> {
        return this.hubClient.request<ThreadUpdateParams, Thread>({
            method: 'post',
            path: `/v1/threads/${encodeURIComponent(threadId)}`,
            body: req,
        });
    }

    // 5) DELETE /v1/threads/{thread_id}
    public async deleteThread(threadId: string): Promise<ThreadDeletionStatus> {
        return this.hubClient.request<unknown, ThreadDeletionStatus>({
            method: 'delete',
            path: `/v1/threads/${encodeURIComponent(threadId)}`,
        });
    }

    // 6) POST /v1/threads/{thread_id}/fork
    public async forkThread(threadId: string): Promise<ThreadForkResponse> {
        return this.hubClient.request<unknown, ThreadForkResponse>({
            method: 'post',
            path: `/v1/threads/${encodeURIComponent(threadId)}/fork`,
        });
    }

    // 7) POST /v1/threads/{parent_id}/subthread
    public async createSubthread(
        parentId: string,
        req: SubthreadCreateParams
    ): Promise<Thread> {
        return this.hubClient.request<SubthreadCreateParams, Thread>({
            method: 'post',
            path: `/v1/threads/${encodeURIComponent(parentId)}/subthread`,
            body: req,
        });
    }

    // 8) POST /v1/threads/{thread_id}/messages
    public async createMessage(
        threadId: string,
        req: MessageCreateParams
    ): Promise<MessageOutput> {
        return this.hubClient.request<MessageCreateParams, MessageOutput>({
            method: 'post',
            path: `/v1/threads/${encodeURIComponent(threadId)}/messages`,
            body: req,
        });
    }

    // 9) GET /v1/threads/{thread_id}/messages
    public async listMessages(
        threadId: string,
        query?: ListMessagesQuery
    ): Promise<ListMessagesResponse> {
        return this.hubClient.request<unknown, ListMessagesResponse>({
            method: 'get',
            path: `/v1/threads/${encodeURIComponent(threadId)}/messages`,
            query,
        });
    }

    // 10) PATCH /v1/threads/{thread_id}/messages/{message_id}
    public async modifyMessage(
        threadId: string,
        messageId: string,
        req: MessageUpdateParams
    ): Promise<MessageOutput> {
        return this.hubClient.request<MessageUpdateParams, MessageOutput>({
            method: 'patch',
            path: `/v1/threads/${encodeURIComponent(threadId)}/messages/${encodeURIComponent(messageId)}`,
            body: req,
        });
    }

    // 11) POST /v1/threads/{thread_id}/runs
    public async createRun(
        threadId: string,
        req: RunCreateParamsBase
    ): Promise<Run> {
        return this.hubClient.request<RunCreateParamsBase, Run>({
            method: 'post',
            path: `/v1/threads/${encodeURIComponent(threadId)}/runs`,
            body: req,
        });
    }

    // 12) GET /v1/threads/{thread_id}/runs/{run_id}
    public async getRun(threadId: string, runId: string): Promise<Run> {
        return this.hubClient.request<unknown, Run>({
            method: 'get',
            path: `/v1/threads/${encodeURIComponent(threadId)}/runs/${encodeURIComponent(runId)}`,
        });
    }

    // 13) POST /v1/threads/{thread_id}/runs/{run_id}
    public async updateRun(
        threadId: string,
        runId: string,
        req: RunUpdateParams
    ): Promise<Run> {
        return this.hubClient.request<RunUpdateParams, Run>({
            method: 'post',
            path: `/v1/threads/${encodeURIComponent(threadId)}/runs/${encodeURIComponent(runId)}`,
            body: req,
        });
    }
}
