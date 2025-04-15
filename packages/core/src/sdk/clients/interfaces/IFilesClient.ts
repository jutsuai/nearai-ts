/**
 * Types and interface for the "Files" endpoints:
 *   - POST   /v1/files
 *   - GET    /v1/files/{file_id}
 *   - DELETE /v1/files/{file_id}
 *   - GET    /v1/files/{file_id}/content
 */

export interface NearFileObject {
    id: string;
    bytes: number;
    created_at: number;
    filename: string;
    object: 'file';
    purpose: 'assistants'|'assistants_output'|'batch'|'batch_output'|'fine-tune'|'fine-tune-results'|'vision';
    status: 'uploaded'|'processed'|'error';
    expires_at?: number|null;
    status_details?: string|null;
}

// -----------------------------------------------------------------
// 1) POST /v1/files => uploads a file
//
//   requestBody: multipart/form-data =>
//   {
//     file: (the file to upload),
//     purpose: "assistants"|"batch"|"fine-tune"|"vision"
//   }
//
//   response => FileObject
// -----------------------------------------------------------------
export interface UploadFileRequest {
    // Typically you'd supply something like a File/Blob in the browser,
    // or a stream/buffer in Node. We'll keep it unknown for generality.
    file: unknown;
    purpose: 'assistants'|'batch'|'fine-tune'|'vision';
}
export type UploadFileResponse = NearFileObject;

// -----------------------------------------------------------------
// 2) GET /v1/files/{file_id} => retrieve file info
//   response => FileObject
// -----------------------------------------------------------------
export type RetrieveFileResponse = NearFileObject;

// -----------------------------------------------------------------
// 3) DELETE /v1/files/{file_id} => delete file
//   response => typically an empty object, so we do Record<string, unknown>
// -----------------------------------------------------------------
export type DeleteFileResponse = Record<string, unknown>;

// -----------------------------------------------------------------
// 4) GET /v1/files/{file_id}/content => retrieve file content
//   response => could be a stream, text, JSON, etc.
//   The OpenAPI is not fully explicit, so let's define it as unknown.
// -----------------------------------------------------------------
export type RetrieveFileContentResponse = unknown;

// -----------------------------------------------------------------
// The FilesClient interface with typed methods
// -----------------------------------------------------------------
export interface IFilesClient {
    /**
     * POST /v1/files
     * Upload a file to the system.
     */
    uploadFile(req: UploadFileRequest): Promise<UploadFileResponse>;

    /**
     * GET /v1/files/{file_id}
     * Retrieve file information by ID.
     */
    retrieveFile(fileId: string): Promise<RetrieveFileResponse>;

    /**
     * DELETE /v1/files/{file_id}
     * Delete a file by ID.
     */
    deleteFile(fileId: string): Promise<DeleteFileResponse>;

    /**
     * GET /v1/files/{file_id}/content
     * Retrieve the raw file contents.
     */
    retrieveFileContent(fileId: string): Promise<RetrieveFileContentResponse>;
}
