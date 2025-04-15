/**
 * Interfaces for the "Threads" endpoints:
 *  1) POST   /v1/threads               => createThread
 *  2) GET    /v1/threads               => listThreads
 *  3) GET    /v1/threads/{thread_id}   => getThread
 *  4) POST   /v1/threads/{thread_id}   => updateThread
 *  5) DELETE /v1/threads/{thread_id}   => deleteThread
 *  6) POST   /v1/threads/{thread_id}/fork         => forkThread
 *  7) POST   /v1/threads/{parent_id}/subthread    => createSubthread
 *  8) POST   /v1/threads/{thread_id}/messages     => createMessage
 *  9) GET    /v1/threads/{thread_id}/messages     => listMessages
 * 10) PATCH  /v1/threads/{thread_id}/messages/{message_id} => modifyMessage
 * 11) POST   /v1/threads/{thread_id}/runs         => createRun
 * 12) GET    /v1/threads/{thread_id}/runs/{run_id} => getRun
 * 13) POST   /v1/threads/{thread_id}/runs/{run_id} => updateRun
 */

// ------------------------------------------------------------------
// Common objects from your OpenAPI snippet
// ------------------------------------------------------------------

/**
 * Thread object from your OpenAPI:
 */
export interface Thread {
    id: string;
    created_at: number;
    object: 'thread';
    metadata?: Record<string, string> | null;
    tool_resources?: Record<string, any> | null;
}

/**
 * "ThreadCreateParams": from your OpenAPI:
 *  {
 *    "messages": Message[],
 *    "metadata": object|null,
 *    "tool_resources": object|null
 *  }
 */
export interface ThreadCreateParams {
    messages: Array<{
        content: string | any[]; // anyOf: string or array of blocks
        role: 'user' | 'assistant';
        attachments?: any[] | null;
        metadata?: Record<string, string> | null;
    }>;
    metadata?: Record<string, string> | null;
    tool_resources?: Record<string, any> | null;
}

/**
 * "ThreadUpdateParams": from your OpenAPI:
 *  {
 *    "metadata": object|null,
 *    "tool_resources": object|null
 *  }
 */
export interface ThreadUpdateParams {
    metadata?: Record<string, string> | null;
    tool_resources?: Record<string, any> | null;
}

/**
 * "ThreadDeletionStatus": { id:string, object:"thread.deleted", deleted:true }
 */
export interface ThreadDeletionStatus {
    id: string;
    object: 'thread.deleted';
    deleted: boolean;
}

/**
 * "ThreadForkResponse": { id: string, object: "thread", created_at: number, metadata: object|null }
 */
export interface ThreadForkResponse {
    id: string;
    object: 'thread';
    created_at: number;
    metadata?: Record<string, any> | null;
}

/**
 * "SubthreadCreateParams": from your OpenAPI:
 *  {
 *    "messages_to_copy": number[],
 *    "new_messages": MessageCreateParams[]
 *  }
 */
export interface SubthreadCreateParams {
    messages_to_copy?: number[] | null;
    new_messages?: MessageCreateParams[] | null;
}

/**
 * "MessageCreateParams": from your OpenAPI:
 *  {
 *    "content": string|array,
 *    "role": "user"|"assistant"|"system",
 *    "attachments"?: ...
 *    "metadata"?: ...
 *    "assistant_id"?: ...
 *    "run_id"?: ...
 *  }
 */
export interface MessageCreateParams {
    content: string | any[];
    role: 'user' | 'assistant' | 'system';
    attachments?: any[] | null;
    metadata?: Record<string, string> | null;
    assistant_id?: string | null;
    run_id?: string | null;
}

/**
 * "Message-Output" from your OpenAPI is an object with:
 *  {
 *    "id": string,
 *    "content": array,
 *    "role": "user"|"assistant",
 *    "thread_id": string,
 *    "status": "in_progress"|"incomplete"|"completed",
 *    ...
 *  }
 */
export interface MessageOutput {
    id: string;
    content: any[]; // array of content blocks
    role: 'user' | 'assistant';
    thread_id: string;
    status: 'in_progress' | 'incomplete' | 'completed';
    // plus other fields like "created_at", "attachments", etc.
    [key: string]: any;
}

/**
 * "ListMessagesResponse": {
 *   object: "list",
 *   data: MessageOutput[],
 *   has_more: boolean,
 *   first_id: string,
 *   last_id: string
 * }
 */
export interface ListMessagesResponse {
    object: 'list';
    data: MessageOutput[];
    has_more: boolean;
    first_id: string;
    last_id: string;
}

/**
 * "MessageUpdateParams": { thread_id:string, metadata: object|null }
 */
export interface MessageUpdateParams {
    thread_id: string;
    metadata?: Record<string, string> | null;
}

/**
 * "RunCreateParamsBase": see your snippet => we define minimal version
 * "Run": from your snippet => an object with { id, assistant_id, created_at, ... }
 * "RunUpdateParams": from snippet => { status, completed_at, failed_at, metadata }
 */
export interface RunCreateParamsBase {
    assistant_id: string;
    model?: string;
    instructions?: string | null;
    tools?: Array<Record<string, any>> | null;
    metadata?: Record<string, string> | null;
    include?: any[];
    additional_instructions?: string | null;
    additional_messages?: any[] | null;
    max_completion_tokens?: number | null;
    max_prompt_tokens?: number | null;
    parallel_tool_calls?: boolean | null;
    response_format?: string | Record<string, any> | null;
    temperature?: number | null;
    tool_choice?: string | Record<string, any> | null;
    top_p?: number | null;
    truncation_strategy?: Record<string, any> | null;
    stream?: boolean;
    schedule_at?: string | null;
    delegate_execution?: boolean;
    parent_run_id?: string | null;
    run_mode?: number | null;
}

export interface Run {
    id: string;
    assistant_id: string;
    created_at: number;
    instructions: string;
    model: string;
    object: 'thread.run';
    status:
        | 'queued'
        | 'in_progress'
        | 'requires_action'
        | 'cancelling'
        | 'cancelled'
        | 'failed'
        | 'completed'
        | 'incomplete'
        | 'expired';
    thread_id: string;
    // etc. We keep it minimal.
    [key: string]: any;
}

export interface RunUpdateParams {
    status?: 'requires_action' | 'failed' | 'expired' | 'completed' | null;
    completed_at?: string | null;
    failed_at?: string | null;
    metadata?: Record<string, string> | null;
}

// ------------------------------------------------------------------
// Additional queries/params as needed
// ------------------------------------------------------------------
export interface ListThreadsQuery {
    include_subthreads?: boolean;
}
export interface ListMessagesQuery {
    after?: string;
    before?: string;
    limit?: number;
    order?: 'asc' | 'desc';
    run_id?: string;
    include_subthreads?: boolean;
}

// ------------------------------------------------------------------
// The IThreadsClient interface
// ------------------------------------------------------------------
export interface IThreadsClient {
    // 1) POST /v1/threads
    createThread(req: ThreadCreateParams): Promise<Thread>;

    // 2) GET /v1/threads
    listThreads(query?: ListThreadsQuery): Promise<Thread[]>;

    // 3) GET /v1/threads/{thread_id}
    getThread(threadId: string): Promise<Thread>;

    // 4) POST /v1/threads/{thread_id}
    updateThread(threadId: string, req: ThreadUpdateParams): Promise<Thread>;

    // 5) DELETE /v1/threads/{thread_id}
    deleteThread(threadId: string): Promise<ThreadDeletionStatus>;

    // 6) POST /v1/threads/{thread_id}/fork
    forkThread(threadId: string): Promise<ThreadForkResponse>;

    // 7) POST /v1/threads/{parent_id}/subthread
    createSubthread(parentId: string, req: SubthreadCreateParams): Promise<Thread>;

    // 8) POST /v1/threads/{thread_id}/messages
    createMessage(threadId: string, req: MessageCreateParams): Promise<MessageOutput>;

    // 9) GET /v1/threads/{thread_id}/messages
    listMessages(threadId: string, query?: ListMessagesQuery): Promise<ListMessagesResponse>;

    // 10) PATCH /v1/threads/{thread_id}/messages/{message_id}
    modifyMessage(
        threadId: string,
        messageId: string,
        req: MessageUpdateParams
    ): Promise<MessageOutput>;

    // 11) POST /v1/threads/{thread_id}/runs
    createRun(threadId: string, req: RunCreateParamsBase): Promise<Run>;

    // 12) GET /v1/threads/{thread_id}/runs/{run_id}
    getRun(threadId: string, runId: string): Promise<Run>;

    // 13) POST /v1/threads/{thread_id}/runs/{run_id}
    updateRun(threadId: string, runId: string, req: RunUpdateParams): Promise<Run>;
}
