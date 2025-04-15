/**
 * Interfaces/types for the "Hub Secrets" endpoints.
 *
 * From your OpenAPI:
 *   POST /v1/create_hub_secret
 *   POST /v1/remove_hub_secret
 *   GET  /v1/get_user_secrets
 */

// ------------------------------------
// 1) /v1/create_hub_secret
// Request = CreateHubSecretRequest
// Response = {}
// ------------------------------------
export interface CreateHubSecretRequest {
    namespace: string;
    name: string;
    version: string | null;
    description: string | null;
    key: string;
    value: string;
    category?: string | null; // default "agent" in the spec
}
export type CreateHubSecretResponse = Record<string, unknown>;

// ------------------------------------
// 2) /v1/remove_hub_secret
// Request = RemoveHubSecretRequest
// Response = {}
// ------------------------------------
export interface RemoveHubSecretRequest {
    namespace: string;
    name: string;
    version: string | null;
    key: string;
    category?: string | null; // default "agent"
}
export type RemoveHubSecretResponse = Record<string, unknown>;

// ------------------------------------
// 3) /v1/get_user_secrets
// Query => { limit=100, offset=0 }
// Response = { ... } or possibly an array, etc.
// The OpenAPI snippet shows "schema": {} => no detail
// We'll define a minimal shape.
// ------------------------------------
export interface GetUserSecretsQuery {
    limit?: number | null;  // default 100
    offset?: number | null; // default 0
}

/**
 * Potential shape if your secrets are an array or an object.
 * Because the OpenAPI doesn't define it, we can treat it as
 * an array of unknown or array of { ... } or any.
 *
 * We'll define a minimal interface or fallback to Record.
 */
export interface HubSecretItem {
    // Example fields, if any:
    id?: string;
    namespace?: string;
    name?: string;
    version?: string | null;
    key?: string;
    value?: string;
    category?: string;
    created_at?: string;
}
export type GetUserSecretsResponse = HubSecretItem[];

// ------------------------------------
// The interface for the Hub Secrets client
// ------------------------------------
export interface IHubSecretsClient {
    /**
     * POST /v1/create_hub_secret
     */
    createHubSecret(
        req: CreateHubSecretRequest
    ): Promise<CreateHubSecretResponse>;

    /**
     * POST /v1/remove_hub_secret
     */
    removeHubSecret(
        req: RemoveHubSecretRequest
    ): Promise<RemoveHubSecretResponse>;

    /**
     * GET /v1/get_user_secrets
     */
    getUserSecrets(
        query?: GetUserSecretsQuery
    ): Promise<GetUserSecretsResponse>;
}
