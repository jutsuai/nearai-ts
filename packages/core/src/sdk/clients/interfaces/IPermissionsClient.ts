/**
 * Interfaces for the "permissions" endpoints:
 *   - POST /v1/permissions/grant_permission
 *   - POST /v1/permissions/revoke_permission
 *
 * Each endpoint includes two optional parameters:
 *   account_id (string, default "")
 *   permission (string, default "")
 *
 * The response is presumably an empty object or minimal JSON.
 */

// Single request object for granting a permission
export interface GrantPermissionRequest {
    account_id?: string;
    permission?: string;
}
export type GrantPermissionResponse = Record<string, unknown>;

// Single request object for revoking a permission
export interface RevokePermissionRequest {
    account_id?: string;
    permission?: string;
}
export type RevokePermissionResponse = Record<string, unknown>;

/**
 * The PermissionsClient interface
 */
export interface IPermissionsClient {
    /**
     * POST /v1/permissions/grant_permission
     */
    grantPermission(req: GrantPermissionRequest): Promise<GrantPermissionResponse>;

    /**
     * POST /v1/permissions/revoke_permission
     */
    revokePermission(req: RevokePermissionRequest): Promise<RevokePermissionResponse>;
}
