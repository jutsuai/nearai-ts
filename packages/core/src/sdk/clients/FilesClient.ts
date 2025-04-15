import OpenAI from 'openai';
import { AgentConfig } from '../../interfaces.js';
import {
    IFilesClient,
    UploadFileRequest,
    UploadFileResponse,
    RetrieveFileResponse,
    DeleteFileResponse,
    RetrieveFileContentResponse,
} from './interfaces/IFilesClient.js';

export class FilesClient implements IFilesClient {
    protected config: AgentConfig;
    protected hubClient: OpenAI;

    constructor(config: AgentConfig, hubClient: OpenAI) {
        this.config = config;
        this.hubClient = hubClient;
    }

    /**
     * POST /v1/files
     * Upload a file with multipart/form-data
     */
    public async uploadFile(
        req: UploadFileRequest
    ): Promise<UploadFileResponse> {
        // If your server truly expects form-data, you may need to build a FormData object
        // manually in the browser, or use e.g. 'form-data' in Node.
        // For simplicity, we pass `req` directly as JSON:
        return this.hubClient.request<UploadFileRequest, UploadFileResponse>({
            method: 'post',
            path: '/v1/files',
            body: req,
        });
    }

    /**
     * GET /v1/files/{file_id}
     */
    public async retrieveFile(fileId: string): Promise<RetrieveFileResponse> {
        return this.hubClient.request<unknown, RetrieveFileResponse>({
            method: 'get',
            path: `/v1/files/${encodeURIComponent(fileId)}`,
        });
    }

    /**
     * DELETE /v1/files/{file_id}
     */
    public async deleteFile(fileId: string): Promise<DeleteFileResponse> {
        return this.hubClient.request<unknown, DeleteFileResponse>({
            method: 'delete',
            path: `/v1/files/${encodeURIComponent(fileId)}`,
        });
    }

    /**
     * GET /v1/files/{file_id}/content
     */
    public async retrieveFileContent(
        fileId: string
    ): Promise<RetrieveFileContentResponse> {
        return this.hubClient.request<unknown, RetrieveFileContentResponse>({
            method: 'get',
            path: `/v1/files/${encodeURIComponent(fileId)}/content`,
        });
    }
}
