import { globalEnv } from "./environment/globalEnv.js";
import type { FileObject, ChatCompletionMessageParam, ChatCompletionTool, Message } from "./clients/nearClient.js";

/**
 * @TODO - Update shim to more modern SDK pattern
 * The Environment class acts as a simple "shim" or facade that
 * your old agent code can import as `env`. Each method delegates
 * to globalEnv.client (which implements SecureHubClient).
 */
class Environment {
    /**
     * Write a file (e.g., code, text) to your NEAR AI environment.
     */
    async write_file(
        filename: string,
        content: string,
        encoding = "utf-8",
        filetype = "text/plain",
        write_to_disk = true
    ): Promise<FileObject> {
        return await globalEnv.client.write_file(filename, content, encoding, filetype);
    }

    /**
     * Read a file by its filename from the current thread.
     * Looks up file via list_files_from_thread, then calls read_file_by_id.
     */
    async read_file(filename: string): Promise<string> {
        if (!globalEnv.client || !("list_files_from_thread" in globalEnv.client) || !("read_file_by_id" in globalEnv.client)) {
            throw new Error("Client not initialized or missing methods.");
        }

        const threadFiles = await globalEnv.client.list_files_from_thread();
        for (const f of threadFiles) {
            if (f.filename === filename) {
                return globalEnv.client.read_file_by_id(f.id);
            }
        }

        // If not found
        return "";
    }

    /**
     * Call OpenAI (or your custom) completion endpoint
     * to generate a text reply.
     */
    async completion(
        messages: Array<ChatCompletionMessageParam>,
        model = "",
        max_tokens = 4000,
        temperature = 0.7,
        tools?: Array<ChatCompletionTool>
    ): Promise<string | null> {
        if (!("completions" in globalEnv.client)) {
            return null;
        }

        const raw_response = await globalEnv.client.completions(
            messages,
            model,
            max_tokens,
            temperature,
            tools
        );

        if (!raw_response?.choices?.[0]?.message?.content) {
            return null;
        }

        return raw_response.choices[0].message.content;
    }

    /**
     * Add a reply message (role=assistant) to your thread.
     */
    async add_reply(message: string | null, message_type = ""): Promise<Message> {
        return globalEnv.client.add_reply(message || "", message_type);
    }

    /**
     * Return an environment variable from your loaded config.
     */
    env_var(key: string): string | undefined {
        return globalEnv.client.env_var(key);
    }

    /**
     * List all messages in the current thread or a specified thread.
     */
    async list_messages(
        thread_id?: string,
        limit?: number,
        order: "asc" | "desc" = "asc"
    ): Promise<Message[]> {
        return globalEnv.client.list_messages(thread_id, limit, order);
    }

    /**
     * Return the last message from the specified role (defaults to "user").
     * If no message from that role is found, return null.
     */
    async get_last_message(role = "user"): Promise<Message | null> {
        const messages = await this.list_messages();
        for (const message of messages.reverse()) {
            if (message.role === role) {
                return message;
            }
        }
        return null;
    }

    /**
     * Return the content of the last message for a given role.
     * Here, we assume `message.content` is just a string (modern approach).
     */
    async get_last_message_content(role = "user"): Promise<string> {
        const lastMsg = await this.get_last_message(role);
        return lastMsg?.content ?? "";
    }

    /**
     * Query a vector store by ID with a given query string,
     * returning either partial or full file contents, etc.
     */
    async query_vector_store(
        vector_store_id: string,
        query: string,
        full_files = false
    ): Promise<any> {
        return globalEnv.client.query_vector_store(vector_store_id, query, full_files);
    }

    /**
     * Attach a file to an existing vector store.
     */
    async add_file_to_vector_store(
        vector_store_id: string,
        file_id: string
    ): Promise<any> {
        return globalEnv.client.add_file_to_vector_store(vector_store_id, file_id);
    }

    /**
     * Create a new vector store with a set of files, an expiration,
     * chunking strategy, etc.
     */
    async create_vector_store(
        name: string,
        file_ids: string[],
        expires_after: string, // e.g., "7d"
        chunking_strategy: string,
        metadata: unknown | null = null
    ): Promise<any> {
        return globalEnv.client.create_vector_store(name, file_ids, expires_after, chunking_strategy, metadata);
    }

    /**
     * Upload file content to the environment with a chosen purpose.
     */
    async upload_file(
        file_content: string,
        purpose: { purpose: string },
        encoding = "utf-8",
        file_name = "file.txt",
        file_type = "text/plain"
    ): Promise<FileObject> {
        return globalEnv.client.upload_file(file_content, purpose, encoding, file_name, file_type);
    }

    /**
     * Get the thread ID for the current conversation context.
     */
    get_thread_id(): string {
        return globalEnv.client.get_thread_id();
    }
}

export const env = new Environment();
