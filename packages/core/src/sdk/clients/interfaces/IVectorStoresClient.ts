/**
 * Interfaces/types for the "Vector Stores" endpoints:
 *
 * 1) GET /v1/vector_stores
 * 2) POST /v1/vector_stores
 * 3) PATCH /v1/vector_stores
 * 4) GET /v1/vector_stores/{vector_store_id}
 * 5) DELETE /v1/vector_stores/{vector_store_id}
 * 6) POST /v1/vector_stores/{vector_store_id}/files
 * 7) GET /v1/vector_stores/{vector_store_id}/files
 * 8) DELETE /v1/vector_stores/{vector_store_id}/files/{file_id}
 * 9) POST /v1/vector_stores/{vector_store_id}/search
 * 10) GET /v1/vector_stores/{vector_store_id}/list/files/filename/{filename}
 * 11) POST /v1/vector_stores/from_source
 * 12) POST /v1/vector_stores/memory/query
 * 13) POST /v1/vector_stores/memory
 */

// ------------------------------------------------------------------
// Shared schemas from your OpenAPI snippet
// ------------------------------------------------------------------

export interface FileCounts {
    cancelled: number;
    completed: number;
    failed: number;
    in_progress: number;
    total: number;
}

/**
 * "ExpiresAfter-Output" (or Input)
 */
export interface ExpiresAfter {
    anchor: 'last_active_at';
    days: number;
}

/**
 * The "VectorStore" object from your spec:
 *   required fields: id, created_at, file_counts, name, object, status, usage_bytes
 */
export interface VectorStore {
    id: string;
    created_at: number;
    file_counts: FileCounts;
    last_active_at?: number | null;
    metadata?: Record<string, any> | null;
    name: string;
    object: 'vector_store';
    status: 'expired' | 'in_progress' | 'completed';
    usage_bytes: number;
    expires_after?: ExpiresAfter | null;
    expires_at?: number | null;
}

/**
 * For GET /v1/vector_stores => array of VectorStore
 */
export type ListVectorStoresResponse = VectorStore[];

// ------------------------------------------------------------------
// 1) GET /v1/vector_stores
//    => listVectorStores(query?)
//    The spec doesn’t show explicit query params, so we’ll assume none or unknown
// ------------------------------------------------------------------
export interface ListVectorStoresQuery {
    // If your server accepts query filters, define them here
    // or leave empty if none
}

// ------------------------------------------------------------------
// 2) POST /v1/vector_stores => createVectorStore
//    Request => CreateVectorStoreRequest
//    Response => VectorStore
// ------------------------------------------------------------------
export interface CreateVectorStoreRequest {
    name: string;
    chunking_strategy?: {
        type?: 'auto' | 'static';
        [key: string]: any;
    } | null;
    expires_after?: {
        anchor: 'last_active_at';
        days: number;
    } | null;
    file_ids?: string[] | null;
    metadata?: Record<string, string> | null;
}

// ------------------------------------------------------------------
// 3) PATCH /v1/vector_stores => updateVectorStore
//    Not implemented on server, but in spec => returns maybe empty or minimal
// ------------------------------------------------------------------
export interface UpdateVectorStoreRequest {
    // The spec indicates "placeholder for future", so we define a minimal shape
    [key: string]: any;
}
export type UpdateVectorStoreResponse = Record<string, unknown>;

// ------------------------------------------------------------------
// 4) GET /v1/vector_stores/{vector_store_id} => getVectorStore
//    returns => VectorStore
// ------------------------------------------------------------------
// (No special query or body needed)

// ------------------------------------------------------------------
// 5) DELETE /v1/vector_stores/{vector_store_id} => deleteVectorStore
//    returns => an object with deletion status or empty
// ------------------------------------------------------------------
export type DeleteVectorStoreResponse = Record<string, unknown>;

// ------------------------------------------------------------------
// 6) POST /v1/vector_stores/{vector_store_id}/files => createVectorStoreFile
//    request => VectorStoreFileCreate
//    response => VectorStore
// ------------------------------------------------------------------
export interface VectorStoreFileCreate {
    file_id: string;
}
export type CreateVectorStoreFileResponse = VectorStore;

// ------------------------------------------------------------------
// 7) GET /v1/vector_stores/{vector_store_id}/files => listVectorStoreFiles
//    The OpenAPI says "List all files in a vector store."
//    The schema is not well-defined in the snippet => we'll assume an array
// ------------------------------------------------------------------
export type ListVectorStoreFilesResponse = Array<Record<string, any>>;

// ------------------------------------------------------------------
// 8) DELETE /v1/vector_stores/{vector_store_id}/files/{file_id}
//    => removeFileFromVectorStore
//    returns => an empty object or minimal
// ------------------------------------------------------------------
export type RemoveFileFromVectorStoreResponse = Record<string, unknown>;

// ------------------------------------------------------------------
// 9) POST /v1/vector_stores/{vector_store_id}/search => queryVectorStore
//    request => QueryVectorStoreRequest
//    response => array of search results => List<Dict> => Array<Record<string, any>>
// ------------------------------------------------------------------
export interface QueryVectorStoreRequest {
    query: string;
    full_files?: boolean;
}
export type QueryVectorStoreResponse = Array<Record<string, any>>;

// ------------------------------------------------------------------
// 10) GET /v1/vector_stores/{vector_store_id}/list/files/filename/{filename}
//     => getVectorStoreFile
//     returns => unknown or minimal
// ------------------------------------------------------------------
export type GetVectorStoreFileResponse = Record<string, any>;

// ------------------------------------------------------------------
// 11) POST /v1/vector_stores/from_source => createVectorStoreFromSource
//    request => CreateVectorStoreFromSourceRequest, returns => VectorStore
// ------------------------------------------------------------------
export interface GitHubSource {
    type: 'github';
    owner: string;
    repo: string;
    branch?: string;
}
export interface GitLabSource {
    type: 'gitlab';
    owner: string;
    repo: string;
    branch?: string;
}
export type SourceType = GitHubSource | GitLabSource;

export interface CreateVectorStoreFromSourceRequest {
    name: string;
    source: SourceType;
    source_auth?: string | null;
    chunking_strategy?: Record<string, any> | null;
    expires_after?: {
        anchor: 'last_active_at';
        days: number;
    } | null;
    metadata?: Record<string, string> | null;
}
export type CreateVectorStoreFromSourceResponse = VectorStore;

// ------------------------------------------------------------------
// 12) POST /v1/vector_stores/memory/query => queryUserMemory
//    request => QueryVectorStoreRequest (similar shape), response => unknown or array
// ------------------------------------------------------------------
export type QueryUserMemoryResponse = Array<Record<string, any>>;

// ------------------------------------------------------------------
// 13) POST /v1/vector_stores/memory => addUserMemory
//    request => AddUserMemoryRequest, response => AddUserMemoryResponse
// ------------------------------------------------------------------
export interface AddUserMemoryRequest {
    memory: string;
}
export interface AddUserMemoryResponse {
    status: string;
    memory_id: string;
    object: 'memory.created';
}

// ------------------------------------------------------------------
// The interface that ties all these endpoints together
// ------------------------------------------------------------------
export interface IVectorStoresClient {
    // 1) listVectorStores
    listVectorStores(query?: ListVectorStoresQuery): Promise<ListVectorStoresResponse>;

    // 2) createVectorStore
    createVectorStore(req: CreateVectorStoreRequest): Promise<VectorStore>;

    // 3) updateVectorStore (not implemented, but in spec)
    updateVectorStore(req: UpdateVectorStoreRequest): Promise<UpdateVectorStoreResponse>;

    // 4) getVectorStore(vector_store_id)
    getVectorStore(vectorStoreId: string): Promise<VectorStore>;

    // 5) deleteVectorStore(vectorStoreId: string)
    deleteVectorStore(vectorStoreId: string): Promise<DeleteVectorStoreResponse>;

    // 6) createVectorStoreFile(vectorStoreId: string, body: VectorStoreFileCreate)
    createVectorStoreFile(
        vectorStoreId: string,
        req: VectorStoreFileCreate
    ): Promise<CreateVectorStoreFileResponse>;

    // 7) listVectorStoreFiles(vectorStoreId: string)
    listVectorStoreFiles(vectorStoreId: string): Promise<ListVectorStoreFilesResponse>;

    // 8) removeFileFromVectorStore(vectorStoreId: string, fileId: string)
    removeFileFromVectorStore(
        vectorStoreId: string,
        fileId: string
    ): Promise<RemoveFileFromVectorStoreResponse>;

    // 9) queryVectorStore(vectorStoreId: string, req: QueryVectorStoreRequest)
    queryVectorStore(
        vectorStoreId: string,
        req: QueryVectorStoreRequest
    ): Promise<QueryVectorStoreResponse>;

    // 10) getVectorStoreFile(vectorStoreId: string, filename: string)
    getVectorStoreFile(
        vectorStoreId: string,
        filename: string
    ): Promise<GetVectorStoreFileResponse>;

    // 11) createVectorStoreFromSource(req: CreateVectorStoreFromSourceRequest)
    createVectorStoreFromSource(
        req: CreateVectorStoreFromSourceRequest
    ): Promise<CreateVectorStoreFromSourceResponse>;

    // 12) queryUserMemory(req: QueryVectorStoreRequest)
    queryUserMemory(req: QueryVectorStoreRequest): Promise<QueryUserMemoryResponse>;

    // 13) addUserMemory(req: AddUserMemoryRequest)
    addUserMemory(req: AddUserMemoryRequest): Promise<AddUserMemoryResponse>;
}
