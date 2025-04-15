export interface EntryLocation {
    namespace: string;
    name: string;
    version: string;
}

export interface EntryMetadata {
    category: string;
    description: string;
    tags: string[];
    details: Record<string, any>;
    show_entry: boolean;
    name: string;
    version: string;
}

/**
 * Body_upload_file_v1_registry_upload_file_post
 * multipart/form-data: { path, file, namespace, name, version }
 * The OpenAPI response is empty => Record<string, any>.
 */
export interface UploadRegistryFileRequest {
    path: string;
    /** If you’re truly uploading a file as multipart/form-data,
     *  you might need a different approach than just `file: string`.
     *  But we'll keep it simple to match the raw schema. */
    file: unknown;
    namespace: string;
    name: string;
    version: string;
}

export type UploadRegistryFileResponse = Record<string, any>;

/**
 * Body_download_file_v1_registry_download_file_post
 * request: { path, entry_location }
 * response is empty => Record<string, any>
 */
export interface DownloadRegistryFileRequest {
    path: string;
    entry_location: EntryLocation;
}
export type DownloadRegistryFileResponse = Record<string, any>;

/**
 * Body_upload_metadata_v1_registry_upload_metadata_post
 * request: { metadata: EntryMetadataInput, entry_location: EntryLocation }
 * response => {}
 */
export interface EntryMetadataInput {
    category: string;
    description: string;
    tags: string[];
    details: Record<string, any>;
    show_entry: boolean;
}
export interface UploadRegistryMetadataRequest {
    metadata: EntryMetadataInput;
    entry_location: EntryLocation;
}
export type UploadRegistryMetadataResponse = Record<string, any>;

/**
 * Body_download_metadata_v1_registry_download_metadata_post
 * request => { entry_location }
 * response => EntryMetadata
 */
export interface DownloadRegistryMetadataRequest {
    entry_location: EntryLocation;
}
export type DownloadRegistryMetadataResponse = EntryMetadata;

/**
 * Body_list_files_v1_registry_list_files_post
 * request => { entry_location }
 * response => array of { filename: string }
 */
export interface ListRegistryFilesRequest {
    entry_location: EntryLocation;
}
export interface RegistryFilename {
    filename: string;
}
export type ListRegistryFilesResponse = RegistryFilename[];

/**
 * POST /v1/registry/list_entries
 * This uses query parameters, no request body.
 * The response is an array of EntryInformation objects.
 */
export interface ListRegistryEntriesQueryParams {
    namespace?: string;
    category?: string;
    tags?: string;
    total?: number;
    offset?: number;
    show_hidden?: boolean;
    show_latest_version?: boolean;
    starred_by?: string;
    star_point_of_view?: string;
    fork_of_name?: string;
    fork_of_namespace?: string;
}

export interface EntryInformation {
    id: number;
    namespace: string;
    name: string;
    version: string;
    updated: string;  // date-time
    category: string;
    description: string;
    details: Record<string, any>;
    tags: string[];
    num_forks: number;
    num_stars: number;
    starred_by_point_of_view: boolean;
    fork_of: {
        namespace: string;
        name: string;
    } | null;
}
export type ListRegistryEntriesResponse = EntryInformation[];

/**
 * POST /v1/registry/fork
 * request => { modifications, entry_location }
 * response => { status, entry { namespace, name, version } }
 */
export interface ForkRegistryEntryRequest {
    modifications: {
        name: string;
        description: string;
        version: string;
    };
    entry_location: EntryLocation;
}

export interface ForkRegistryEntryResponse {
    status: string;
    entry: EntryLocation;
}

/**
 * An interface listing all the registry endpoints with typed signatures.
 */
export interface IRegistryClient {
    uploadRegistryFile(
        req: UploadRegistryFileRequest
    ): Promise<UploadRegistryFileResponse>;

    downloadRegistryFile(
        req: DownloadRegistryFileRequest
    ): Promise<DownloadRegistryFileResponse>;

    uploadRegistryMetadata(
        req: UploadRegistryMetadataRequest
    ): Promise<UploadRegistryMetadataResponse>;

    downloadRegistryMetadata(
        req: DownloadRegistryMetadataRequest
    ): Promise<DownloadRegistryMetadataResponse>;

    listRegistryFiles(
        req: ListRegistryFilesRequest
    ): Promise<ListRegistryFilesResponse>;

    listRegistryEntries(
        query: ListRegistryEntriesQueryParams
    ): Promise<ListRegistryEntriesResponse>;

    forkRegistryEntry(
        req: ForkRegistryEntryRequest
    ): Promise<ForkRegistryEntryResponse>;
}
