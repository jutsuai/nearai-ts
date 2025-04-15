export interface ChatCompletionsRequest {
    model?: string;
    provider?: string | null;
    max_tokens?: number | null;
    logprobs?: number | null;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number | null;
    n?: number;
    stop?: string | string[] | null;
    response_format?: unknown; // The union can be more explicit if needed
    stream?: boolean;
    tools?: unknown[] | null;
    messages: Array<{
        role: string;
        content: string | any[]; // OpenAPI shows "anyOf"
    }>;
}

export interface CompletionsRequest {
    model?: string;
    provider?: string | null;
    max_tokens?: number | null;
    logprobs?: number | null;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number | null;
    n?: number;
    stop?: string | string[] | null;
    response_format?: unknown;
    stream?: boolean;
    tools?: unknown[] | null;
    prompt: string;
}

export interface EmbeddingsRequest {
    input: string | string[] | number[] | number[][];
    model?: string;
    provider?: string | null;
}

export interface ImageGenerationRequest {
    prompt: string;
    model?: string;
    provider?: string | null;
    init_image?: string | null;
    image_strength?: number | null;
    control_image?: string | null;
    control_net_name?: string | null;
    conditioning_scale?: number | null;
    cfg_scale?: number | null;
    sampler?: string | null;
    steps?: number | null;
    seed?: number | null;
}

/**
 * Because /v1/completions, /v1/chat/completions, /v1/embeddings, /v1/images/generations
 * can all accept any of the four request shapes (OpenAPI 'anyOf'), define a union type:
 */
export type AnyCompletionsBody =
    | ChatCompletionsRequest
    | CompletionsRequest
    | EmbeddingsRequest
    | ImageGenerationRequest;

/**
 * The openAPI doesn't define a detailed response for these endpoints (schema:{}) –
 * so define something minimal or an empty object, or your known structure if you have it.
 */
export interface CompletionsResponse {
    // When can't find the schema, use this
    [key: string]: any;
}

// --------------------------------------------------------------------
// Additional endpoints:

// /v1/get_agent_public_key
export interface GetAgentPublicKeyParams {
    agent_name: string;
}
export type GetAgentPublicKeyResponse = Record<string, any>;

// /v1/nonce/revoke
export interface RevokeNonceRequest {
    nonce: string;
}
export type RevokeNonceResponse = Record<string, any>;

// /v1/nonce/revoke/all
// no request body
export type RevokeAllNoncesResponse = Record<string, any>;

// /v1/nonce/list
// no request body
export type ListNoncesResponse = any[] | Record<string, any>;

// /v1/version
// The OpenAPI indicates the response is simply a string
export type GetVersionResponse = string;

// /health
// no typed schema, so might be an empty object or a simple health status
export interface HealthCheckResponse {
    status?: string;
}
