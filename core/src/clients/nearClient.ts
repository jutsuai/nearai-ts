import { OpenAI } from "openai";
import { AgentConfig } from "../config/configTypes.js";

/**
 * PLACEHOLDER TYPES
 * The new stable library doesn't export these types, so we define minimal
 * interfaces here to keep your method signatures intact.
 */
export interface FilePurpose {
    // The stable library recognizes 'fine-tune' by default.
    // 'assistants' or anything else is not strictly documented,
    // but you can still pass it to the file creation endpoint.
    purpose: string;
}

export interface FileObject {
    id: string;
    object: "file";

    // The library typically returns these properties:
    filename?: string;
    purpose?: string;
    created_at?: number;
    bytes?: number;
    status?: string;          // e.g. "uploaded", "processed"
    status_details?: any;
    _request_id?: string | null;

    // @TODO - other properties in practice, add them here:
    [key: string]: any;
}

export interface VectorStore {
    id: string;
    name: string;
    [key: string]: any;
}

export interface VectorStoreFile {
    id: string;
    file_id: string;
    vector_store_id: string;
    [key: string]: any;
}

// For chat completions
export interface ChatCompletionMessageParam {
    role: "system" | "user" | "assistant";
    content: string;
}

// The stable library’s ChatCompletion shape
export interface ChatCompletion {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message?: { role: string; content: string };
        finish_reason?: string;
    }>;
    usage?: any;
}

/** Tools are not part of the new library; define a placeholder if needed. */
export interface ChatCompletionTool {
    name: string;
    description?: string;
}

/**
 * Beta "threads" no longer exist, so we define placeholders
 * for messages and creation params. If your backend truly implements
 * this, you'll call it via custom fetch below.
 */
export interface Message {
    id?: string;
    role: "user" | "assistant" | "system";
    content: string;
    metadata?: Record<string, any>;
    attachments?: Array<{ file_id: string }>;
}

export interface MessageCreateParams {
    role: "assistant" | "user" | "system";
    content: string;
    metadata?: Record<string, any>;
}

/**
 * Replaces old "toFile" with a local helper that
 * returns a `File` from a Buffer. (Used in write_file, upload_file)
 */
async function toFile(buffer: Buffer, filename: string): Promise<File> {
    return new File([buffer], filename, { lastModified: Date.now() });
}

/**
 * nearAIClient: modern version of your original code, using stable openai + custom fetch
 */
export class NearAIClient {
    private hub_client: OpenAI;
    private thread_id: string;
    private env_vars: Record<string, string>;
    private base_url: string;

    constructor(config: AgentConfig) {
        this.base_url = config.base_url;
        this.thread_id = config.thread_id;
        this.env_vars = config.env_vars || {};

        // Initialize the stable OpenAI client (v4.x)
        this.hub_client = new OpenAI({
            apiKey: config.user_auth,
            baseURL: this.base_url // if your API is not openai.com
        });
    }

    /**
     * list_files_from_thread
     *  - The stable library no longer has "threads," so we replicate your old logic
     *    by retrieving thread-based attachments from your own server or a custom route.
     *  - The code below just calls a custom method `_listMessages` and extracts attachments.
     *  - Adjust if your actual backend implements something else.
     */
    list_files_from_thread = async (
        order: "asc" | "desc" = "asc",
        thread_id?: string
    ): Promise<FileObject[]> => {
        const messages = await this._listMessages(undefined, order, thread_id);
        const attachments = messages.flatMap(m => m.attachments ?? []);
        const file_ids = attachments.map(a => a.file_id);

        // For each file_id, call the stable library’s "retrieve" endpoint.
        // The stable OpenAI class has "this.hub_client.files.retrieve(...)"
        // but keep in mind that not all custom IDs might be valid in the official
        // openai endpoints. If your base_url is a custom backend, you might do your own fetch.
        const results = await Promise.all(
            file_ids.map(async fileId => {
                if (!fileId) return null;

                // The stable v4 library has:
                //   this.hub_client.files.retrieve(fileId)
                // This returns something shaped like { id, object, filename, purpose, ... }
                // We'll do a try/catch in case the file doesn’t exist.
                try {
                    return await this.hub_client.files.retrieve(fileId);
                } catch {
                    return null;
                }
            })
        );

        // Filter out null
        return results.filter((f): f is FileObject => Boolean(f));
    };

    env_var = (key: string): string | undefined => {
        return this.env_vars[key];
    };

    /**
     * write_file
     * - The stable library has "files.create({ file, purpose })".
     * - 'toFile' is a local helper that converts a Buffer to a `File`.
     * - 'assistants' is a custom purpose not officially recognized, but it
     *   can still be used if your backend accepts it.
     */
    write_file = async (
        filename: string,
        content: string,
        encoding = "utf-8",
        filetype = "text/plain"
    ): Promise<FileObject> => {
        const buffer = Buffer.from(content, encoding);
        const file = await toFile(buffer, filename);

        const response = await this.hub_client.files.create({
            file,
            purpose: "assistants" // your original code used 'assistants'
        });
        return {
            ...response,
            // The stable library returns { id, object, filename, etc. }
            // We cast it to our local FileObject shape if needed
        };
    };

    /**
     * query_vector_store
     *  - The stable library no longer has a "vectorStores" feature.
     *  - We replicate it via direct fetch calls to your custom backend
     *    (assuming your base_url points to an API with /vector_stores).
     */
    query_vector_store = async (
        vector_store_id: string,
        query: string,
        full_files = false
    ): Promise<string> => {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.hub_client.apiKey}`
        };
        const data = JSON.stringify({ query, full_files });
        const endpoint = `${this.base_url}/vector_stores/${vector_store_id}/search`;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers,
                body: data
            });
            if (!response.ok) {
                throw new Error(`Error querying vector store: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error: any) {
            throw new Error(`Error querying vector store: ${error.message}`);
        }
    };

    /**
     * upload_file
     *  - Replaces your old usage of the openai "FilePurpose" from internal modules
     *    with a local type or just a string. If your backend accepts any custom purpose,
     *    you can pass it along.
     */
    upload_file = async (
        file_content: string,
        purpose: FilePurpose,
        encoding = "utf-8",
        file_name = "file.txt",
        file_type = "text/plain"
    ): Promise<FileObject> => {
        const blob = new Blob([file_content], { type: file_type });
        const file = new File([blob], file_name, { type: file_type, lastModified: Date.now() });

        const response = await this.hub_client.files.create({
            file,
            purpose: purpose.purpose || "assistants"
        });
        return { ...response };
    };

    /**
     * add_file_to_vector_store
     *  - The stable library has no 'beta.vectorStores.files.create(...)', so do a custom fetch.
     *  - We replicate the old route: POST /vector_stores/:vector_store_id/files
     */
    add_file_to_vector_store = async (
        vector_store_id: string,
        file_id: string
    ): Promise<VectorStoreFile> => {
        const endpoint = `${this.base_url}/vector_stores/${vector_store_id}/files`;
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.hub_client.apiKey}`
        };
        const body = JSON.stringify({ file_id });

        const resp = await fetch(endpoint, {
            method: "POST",
            headers,
            body
        });
        if (!resp.ok) {
            throw new Error(`Error adding file to vector store: ${resp.status} ${resp.statusText}`);
        }
        return (await resp.json()) as VectorStoreFile;
    };

    /**
     * create_vector_store
     *  - Similarly calls a custom endpoint POST /vector_stores
     *  - We no longer rely on .beta calls from the old library.
     */
    create_vector_store(
        name: string,
        file_ids: string[],
        expires_after: string, // or a date
        chunking_strategy: string,
        metadata: unknown | null = null
    ): Promise<VectorStore | null> {
        const endpoint = `${this.base_url}/vector_stores`;
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.hub_client.apiKey}`
        };
        const body = JSON.stringify({
            name,
            file_ids,
            expires_after,
            chunking_strategy,
            metadata
        });
        return fetch(endpoint, {
            method: "POST",
            headers,
            body
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Error creating vector store: ${res.status} ${res.statusText}`);
                }
                return res.json() as Promise<VectorStore>;
            })
            .catch(err => {
                console.error("create_vector_store error:", err);
                return null;
            });
    }

    /**
     * read_file_by_id
     *  - The new library has no "files.content(file_id)" method, so we do a direct fetch.
     */
    read_file_by_id = async (file_id: string): Promise<string> => {
        // If your base_url is official https://api.openai.com/v1,
        // the library has openai.files.retrieveContent(...) in some versions.
        // Otherwise, do a custom fetch:
        const content = await this.hub_client.files.retrieveContent(file_id);
        // This returns a Response-like object with a .blob() or .text()
        return await content.text();
    };

    /**
     * completions
     *  - Replaces your old custom "tools" param with a no-op, since the stable library
     *    doesn't have that property. If you truly need “tools,” handle them separately.
     */
    completions = async (
        messages: ChatCompletionMessageParam[],
        model = "",
        max_tokens = 4000,
        temperature = 0.7,
        tools?: Array<ChatCompletionTool>,
        stream = false
    ): Promise<ChatCompletion> => {
        return await this._run_inference_completions(messages, model, stream, temperature, max_tokens, tools);
    };

    /**
     * add_reply
     *  - The stable library has no 'beta.threads.messages.create(...)'.
     *  - We replicate the old endpoint with a custom fetch. Adjust if your server is different.
     */
    add_reply = async (message: string, message_type = ""): Promise<Message> => {
        const body: MessageCreateParams = {
            role: "assistant",
            content: message,
            metadata: message_type ? { message_type } : {}
        };

        const endpoint = `${this.base_url}/threads/${this.thread_id}/messages`;
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.hub_client.apiKey}`
        };
        const resp = await fetch(endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        });
        if (!resp.ok) {
            throw new Error(`Error creating message: ${resp.status} ${resp.statusText}`);
        }
        return (await resp.json()) as Message;
    };

    /**
     * list_messages
     *  - The stable library no longer supports "beta.threads.messages.list(...)",
     *    so again we do a direct fetch to /threads/:thread_id/messages, if your backend provides it.
     */
    list_messages = async (
        thread_id: string | undefined = undefined,
        limit: number | undefined = undefined,
        order: "asc" | "desc" = "asc"
    ): Promise<Message[]> => {
        const tid = thread_id || this.thread_id;
        const endpoint = `${this.base_url}/threads/${tid}/messages?order=${order}${
            limit ? `&limit=${limit}` : ""
        }`;
        const headers = {
            Authorization: `Bearer ${this.hub_client.apiKey}`
        };
        const resp = await fetch(endpoint, { headers });
        if (!resp.ok) {
            throw new Error(`Error listing messages: ${resp.status} ${resp.statusText}`);
        }
        return (await resp.json()) as Message[];
    };

    get_thread_id = (): string => {
        return this.thread_id;
    };

    /**
     * OLD PRIVATE HELPER: _listMessages
     *  - Replaces the old "this.hub_client.beta.threads.messages.list(...)" call with a custom fetch.
     */
    private _listMessages = async (
        limit: number | undefined,
        order: "asc" | "desc",
        thread_id: string | undefined
    ): Promise<Message[]> => {
        const tid = thread_id || this.thread_id;
        const endpoint = `${this.base_url}/threads/${tid}/messages?order=${order}${
            limit ? `&limit=${limit}` : ""
        }`;
        const headers = {
            Authorization: `Bearer ${this.hub_client.apiKey}`
        };
        const resp = await fetch(endpoint, { headers });
        if (!resp.ok) {
            throw new Error(`_listMessages failed: ${resp.status} ${resp.statusText}`);
        }
        const data = await resp.json();
        return data.data || data; // Depending on your API shape
    };

    /**
     * OLD PRIVATE HELPER: _run_inference_completions
     *  - The stable library uses openai.chat.completions.create(params).
     *  - "tools" is not recognized. "stream" can be done with a streaming call, but
     *    we skip that for now. We pass the rest of the params directly.
     */
    private _run_inference_completions = async (
        messages: ChatCompletionMessageParam[],
        model: string,
        stream: boolean,
        temperature: number,
        max_tokens: number,
        tools?: Array<ChatCompletionTool>
    ): Promise<ChatCompletion> => {
        // The stable library doesn't have "tools" or "stream" in the same sense as the old beta.
        // We'll omit them from the official call, or handle them custom if your backend allows it.
        const params: any = {
            model: model || "gpt-3.5-turbo", // or "gpt-4"
            messages,
            temperature,
            max_tokens
            // 'stream': stream,  -> the new library's streaming usage is a bit different
            // 'tools': tools     -> no official param for this
        };
        return await this.hub_client.chat.completions.create(params);
    };
}
