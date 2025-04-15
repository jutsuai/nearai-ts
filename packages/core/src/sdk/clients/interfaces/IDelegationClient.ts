/**
 * Shared interfaces/types for the "delegation" endpoints.
 * from your OpenAPI specification:
 *   POST /v1/delegation/delegate
 *   POST /v1/delegation/list_delegations
 *   POST /v1/delegation/revoke_delegation
 */

// ------------------------------------------
// 1) /v1/delegation/delegate
//    Query parameters: delegate_account_id (string), expires_at (date-time)
//    Response: empty object, or an acknowledgment
// ------------------------------------------
export interface DelegateQuery {
    delegate_account_id: string;
    // Format: date-time, e.g. "2025-12-31T23:59:59.999Z"
    expires_at: string;
}
export type DelegateResponse = Record<string, unknown>; // empty object in 200

// ------------------------------------------
// 2) /v1/delegation/list_delegations
//    No parameters in request body or query
//    Response: array of Delegation
// ------------------------------------------
export interface Delegation {
    id: number;
    original_account_id: string;
    delegation_account_id: string;
    expires_at: string | null;
}
export type ListDelegationsResponse = Delegation[];

// ------------------------------------------
// 3) /v1/delegation/revoke_delegation
//    Query param: delegate_account_id
//    Response: empty object
// ------------------------------------------
export interface RevokeDelegationQuery {
    delegate_account_id: string;
}
export type RevokeDelegationResponse = Record<string, unknown>;

/**
 * The high-level interface for our DelegationClient.
 */
export interface IDelegationClient {
    /**
     * POST /v1/delegation/delegate
     */
    delegate(query: DelegateQuery): Promise<DelegateResponse>;

    /**
     * POST /v1/delegation/list_delegations
     */
    listDelegations(): Promise<ListDelegationsResponse>;

    /**
     * POST /v1/delegation/revoke_delegation
     */
    revokeDelegation(query: RevokeDelegationQuery): Promise<RevokeDelegationResponse>;
}
