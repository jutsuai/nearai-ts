import OpenAI from 'openai';
import { AgentConfig } from '../../interfaces.js';
import {
    IVectorStoresClient,
    ListVectorStoresQuery,
    ListVectorStoresResponse,
    CreateVectorStoreRequest,
    VectorStore,
    UpdateVectorStoreRequest,
    UpdateVectorStoreResponse,
    DeleteVectorStoreResponse,
    VectorStoreFileCreate,
    CreateVectorStoreFileResponse,
    ListVectorStoreFilesResponse,
    RemoveFileFromVectorStoreResponse,
    QueryVectorStoreRequest,
    QueryVectorStoreResponse,
    GetVectorStoreFileResponse,
    CreateVectorStoreFromSourceRequest,
    CreateVectorStoreFromSourceResponse,
    QueryUserMemoryResponse,
    AddUserMemoryRequest,
    AddUserMemoryResponse,
} from './interfaces/IVectorStoresClient.js';

export class VectorStoresClient implements IVectorStoresClient {
    protected config: AgentConfig;
    protected hubClient: OpenAI;

    constructor(config: AgentConfig, hubClient: OpenAI) {
        this.config = config;
        this.hubClient = hubClient;
    }

    /**
     * 1) GET /v1/vector_stores
     */
    public async listVectorStores(
        query?: ListVectorStoresQuery
    ): Promise<ListVectorStoresResponse> {
        return this.hubClient.request<unknown, ListVectorStoresResponse>({
            method: 'get',
            path: '/v1/vector_stores',
            query, // optional
        });
    }

    /**
     * 2) POST /v1/vector_stores
     */
    public async createVectorStore(
        req: CreateVectorStoreRequest
    ): Promise<VectorStore> {
        return this.hubClient.request<CreateVectorStoreRequest, VectorStore>({
            method: 'post',
            path: '/v1/vector_stores',
            body: req,
        });
    }

    /**
     * 3) PATCH /v1/vector_stores
     * Not implemented on server, but in spec => stub
     */
    public async updateVectorStore(
        req: UpdateVectorStoreRequest
    ): Promise<UpdateVectorStoreResponse> {
        return this.hubClient.request<UpdateVectorStoreRequest, UpdateVectorStoreResponse>({
            method: 'patch',
            path: '/v1/vector_stores',
            body: req,
        });
    }

    /**
     * 4) GET /v1/vector_stores/{vector_store_id}
     */
    public async getVectorStore(
        vectorStoreId: string
    ): Promise<VectorStore> {
        return this.hubClient.request<unknown, VectorStore>({
            method: 'get',
            path: `/v1/vector_stores/${encodeURIComponent(vectorStoreId)}`,
        });
    }

    /**
     * 5) DELETE /v1/vector_stores/{vector_store_id}
     */
    public async deleteVectorStore(
        vectorStoreId: string
    ): Promise<DeleteVectorStoreResponse> {
        return this.hubClient.request<unknown, DeleteVectorStoreResponse>({
            method: 'delete',
            path: `/v1/vector_stores/${encodeURIComponent(vectorStoreId)}`,
        });
    }

    /**
     * 6) POST /v1/vector_stores/{vector_store_id}/files
     */
    public async createVectorStoreFile(
        vectorStoreId: string,
        req: VectorStoreFileCreate
    ): Promise<CreateVectorStoreFileResponse> {
        return this.hubClient.request<VectorStoreFileCreate, CreateVectorStoreFileResponse>({
            method: 'post',
            path: `/v1/vector_stores/${encodeURIComponent(vectorStoreId)}/files`,
            body: req,
        });
    }

    /**
     * 7) GET /v1/vector_stores/{vector_store_id}/files
     */
    public async listVectorStoreFiles(
        vectorStoreId: string
    ): Promise<ListVectorStoreFilesResponse> {
        return this.hubClient.request<unknown, ListVectorStoreFilesResponse>({
            method: 'get',
            path: `/v1/vector_stores/${encodeURIComponent(vectorStoreId)}/files`,
        });
    }

    /**
     * 8) DELETE /v1/vector_stores/{vector_store_id}/files/{file_id}
     */
    public async removeFileFromVectorStore(
        vectorStoreId: string,
        fileId: string
    ): Promise<RemoveFileFromVectorStoreResponse> {
        return this.hubClient.request<unknown, RemoveFileFromVectorStoreResponse>({
            method: 'delete',
            path: `/v1/vector_stores/${encodeURIComponent(vectorStoreId)}/files/${encodeURIComponent(fileId)}`,
        });
    }

    /**
     * 9) POST /v1/vector_stores/{vector_store_id}/search
     */
    public async queryVectorStore(
        vectorStoreId: string,
        req: QueryVectorStoreRequest
    ): Promise<QueryVectorStoreResponse> {
        return this.hubClient.request<QueryVectorStoreRequest, QueryVectorStoreResponse>({
            method: 'post',
            path: `/v1/vector_stores/${encodeURIComponent(vectorStoreId)}/search`,
            body: req,
        });
    }

    /**
     * 10) GET /v1/vector_stores/{vector_store_id}/list/files/filename/{filename}
     */
    public async getVectorStoreFile(
        vectorStoreId: string,
        filename: string
    ): Promise<GetVectorStoreFileResponse> {
        return this.hubClient.request<unknown, GetVectorStoreFileResponse>({
            method: 'get',
            path: `/v1/vector_stores/${encodeURIComponent(vectorStoreId)}/list/files/filename/${encodeURIComponent(filename)}`,
        });
    }

    /**
     * 11) POST /v1/vector_stores/from_source
     */
    public async createVectorStoreFromSource(
        req: CreateVectorStoreFromSourceRequest
    ): Promise<CreateVectorStoreFromSourceResponse> {
        return this.hubClient.request<CreateVectorStoreFromSourceRequest, CreateVectorStoreFromSourceResponse>({
            method: 'post',
            path: '/v1/vector_stores/from_source',
            body: req,
        });
    }

    /**
     * 12) POST /v1/vector_stores/memory/query
     */
    public async queryUserMemory(
        req: QueryVectorStoreRequest
    ): Promise<QueryUserMemoryResponse> {
        return this.hubClient.request<QueryVectorStoreRequest, QueryUserMemoryResponse>({
            method: 'post',
            path: '/v1/vector_stores/memory/query',
            body: req,
        });
    }

    /**
     * 13) POST /v1/vector_stores/memory
     */
    public async addUserMemory(
        req: AddUserMemoryRequest
    ): Promise<AddUserMemoryResponse> {
        return this.hubClient.request<AddUserMemoryRequest, AddUserMemoryResponse>({
            method: 'post',
            path: '/v1/vector_stores/memory',
            body: req,
        });
    }
}
