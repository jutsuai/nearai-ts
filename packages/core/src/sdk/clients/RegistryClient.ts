import OpenAI from 'openai';
import { AgentConfig } from '../../interfaces.js';
import {
    IRegistryClient,
    UploadRegistryFileRequest,
    UploadRegistryFileResponse,
    DownloadRegistryFileRequest,
    DownloadRegistryFileResponse,
    UploadRegistryMetadataRequest,
    UploadRegistryMetadataResponse,
    DownloadRegistryMetadataRequest,
    DownloadRegistryMetadataResponse,
    ListRegistryFilesRequest,
    ListRegistryFilesResponse,
    ListRegistryEntriesQueryParams,
    ListRegistryEntriesResponse,
    ForkRegistryEntryRequest,
    ForkRegistryEntryResponse,
} from './interfaces/IRegistryClient.js';

export class RegistryClient implements IRegistryClient {
    protected config: AgentConfig;
    protected hubClient: OpenAI;

    constructor(config: AgentConfig, hubClient: OpenAI) {
        this.config = config;
        this.hubClient = hubClient;
    }

    /**
     * POST /v1/registry/upload_file
     */
    public async uploadRegistryFile(
        req: UploadRegistryFileRequest
    ): Promise<UploadRegistryFileResponse> {
        // Because it's multipart/form-data, might need a different approach
        // (like form-data encoding) if the openai lib doesn't handle that automatically.
        return this.hubClient.request<
            UploadRegistryFileRequest,
            UploadRegistryFileResponse
        >({
            method: 'post',
            path: '/v1/registry/upload_file',
            body: req,
        });
    }

    /**
     * POST /v1/registry/download_file
     */
    public async downloadRegistryFile(
        req: DownloadRegistryFileRequest
    ): Promise<DownloadRegistryFileResponse> {
        return this.hubClient.request<
            DownloadRegistryFileRequest,
            DownloadRegistryFileResponse
        >({
            method: 'post',
            path: '/v1/registry/download_file',
            body: req,
        });
    }

    /**
     * POST /v1/registry/upload_metadata
     */
    public async uploadRegistryMetadata(
        req: UploadRegistryMetadataRequest
    ): Promise<UploadRegistryMetadataResponse> {
        return this.hubClient.request<
            UploadRegistryMetadataRequest,
            UploadRegistryMetadataResponse
        >({
            method: 'post',
            path: '/v1/registry/upload_metadata',
            body: req,
        });
    }

    /**
     * POST /v1/registry/download_metadata
     */
    public async downloadRegistryMetadata(
        req: DownloadRegistryMetadataRequest
    ): Promise<DownloadRegistryMetadataResponse> {
        return this.hubClient.request<
            DownloadRegistryMetadataRequest,
            DownloadRegistryMetadataResponse
        >({
            method: 'post',
            path: '/v1/registry/download_metadata',
            body: req,
        });
    }

    /**
     * POST /v1/registry/list_files
     */
    public async listRegistryFiles(
        req: ListRegistryFilesRequest
    ): Promise<ListRegistryFilesResponse> {
        return this.hubClient.request<
            ListRegistryFilesRequest,
            ListRegistryFilesResponse
        >({
            method: 'post',
            path: '/v1/registry/list_files',
            body: req,
        });
    }

    /**
     * POST /v1/registry/list_entries
     * Actually the OpenAPI shows multiple query params,
     * no request body. So we place them in `query`.
     */
    public async listRegistryEntries(
        query: ListRegistryEntriesQueryParams
    ): Promise<ListRegistryEntriesResponse> {
        // no body, just query
        return this.hubClient.request<
            unknown, // no request body
            ListRegistryEntriesResponse
        >({
            method: 'post',
            path: '/v1/registry/list_entries',
            query,
        });
    }

    /**
     * POST /v1/registry/fork
     */
    public async forkRegistryEntry(
        req: ForkRegistryEntryRequest
    ): Promise<ForkRegistryEntryResponse> {
        return this.hubClient.request<
            ForkRegistryEntryRequest,
            ForkRegistryEntryResponse
        >({
            method: 'post',
            path: '/v1/registry/fork',
            body: req,
        });
    }
}
