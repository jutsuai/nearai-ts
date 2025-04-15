/**
 * Interfaces for the "stars" endpoints:
 *   - POST /v1/stars/add_star
 *   - POST /v1/stars/remove_star
 *
 * From your OpenAPI, both expect { namespace: string, name: string }
 * in the body, and respond with an empty object or minimal JSON.
 */

// Single request object for adding a star
export interface AddStarRequest {
    namespace: string;
    name: string;
}

// Single request object for removing a star
export interface RemoveStarRequest {
    namespace: string;
    name: string;
}

// The responses for both endpoints appear to be empty => use a minimal type
export type AddStarResponse = Record<string, unknown>;
export type RemoveStarResponse = Record<string, unknown>;

/**
 * The high-level interface for the StarsClient
 */
export interface IStarsClient {
    /**
     * POST /v1/stars/add_star
     */
    addStar(req: AddStarRequest): Promise<AddStarResponse>;

    /**
     * POST /v1/stars/remove_star
     */
    removeStar(req: RemoveStarRequest): Promise<RemoveStarResponse>;
}
