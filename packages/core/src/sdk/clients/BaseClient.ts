import OpenAI from 'openai';
import { AgentConfig } from '../../interfaces.js';
import {
    CompletionsRequest,
    ChatCompletionsRequest,
    EmbeddingsRequest,
    ImageGenerationRequest,
    AnyCompletionsBody,
    CompletionsResponse,
    GetAgentPublicKeyParams,
    GetAgentPublicKeyResponse,
    RevokeNonceRequest,
    RevokeNonceResponse,
    RevokeAllNoncesResponse,
    ListNoncesResponse,
    GetVersionResponse,
    HealthCheckResponse,
} from './interfaces/IBaseClient.js';

export class BaseClient {
    protected config: AgentConfig;
    protected hubClient: OpenAI;

    constructor(config: AgentConfig, hubClient: OpenAI) {
        this.config = config;
        this.hubClient = hubClient;
    }
    /**
     * POST /completions
     * The OpenAPI spec indicates anyOf: CompletionsRequest, ChatCompletionsRequest, ...
     */
    public async createCompletions(
        data: AnyCompletionsBody
    ): Promise<CompletionsResponse> {
        // If nearai hub version of openai supports .completions.create, we maybe could do:
        //   return this.hubClient.completions.create(data);
        // but here we show the .request(...) pattern:

        return this.hubClient.request({
            method: 'post',
            path: '/completions',
            body: data,
        });
    }

    /**
     * POST /chat/completions
     */
    public async createChatCompletions(
        data: AnyCompletionsBody
    ): Promise<CompletionsResponse> {
        return this.hubClient.request({
            method: 'post',
            path: '/chat/completions',
            body: data,
        });
    }

    /**
     * GET /models
     */
    public async listModels(): Promise<unknown> {
        return this.hubClient.request({
            method: 'get',
            path: '/models',
        });
    }

    /**
     * POST /embeddings
     */
    public async createEmbeddings(
        data: EmbeddingsRequest
    ): Promise<CompletionsResponse> {
        return this.hubClient.request({
            method: 'post',
            path: '/embeddings',
            body: data,
        });
    }

    /**
     * POST /images/generations
     */
    public async createImages(
        data: ImageGenerationRequest
    ): Promise<CompletionsResponse> {
        return this.hubClient.request({
            method: 'post',
            path: '/images/generations',
            body: data,
        });
    }

    // -------------------------------------------------
    // NEAR.AI-specific endpoints not in standard openai
    // -------------------------------------------------

    /**
     * POST /get_agent_public_key
     * According to your OpenAPI, `agent_name` is in `parameters` with `in:"query"`.
     */
    public async getAgentPublicKey(
        params: GetAgentPublicKeyParams
    ): Promise<GetAgentPublicKeyResponse> {
        // Notice we put agent_name in `query`, not in body.
        return this.hubClient.request({
            method: 'post',
            path: '/get_agent_public_key',
            query: {
                agent_name: params.agent_name,
            },
        });
    }

    /**
     * POST /nonce/revoke
     */
    public async revokeNonce(data: RevokeNonceRequest): Promise<RevokeNonceResponse> {
        return this.hubClient.request({
            method: 'post',
            path: '/nonce/revoke',
            body: data,
        });
    }

    /**
     * POST /nonce/revoke/all
     */
    public async revokeAllNonces(): Promise<RevokeAllNoncesResponse> {
        return this.hubClient.request({
            method: 'post',
            path: '/nonce/revoke/all',
        });
    }

    /**
     * GET /nonce/list
     */
    public async listNonces(): Promise<ListNoncesResponse> {
        return this.hubClient.request({
            method: 'get',
            path: '/nonce/list',
        });
    }

    /**
     * GET /version
     * The OpenAPI says it returns a string
     */
    public async getVersion(): Promise<GetVersionResponse> {
        return this.hubClient.request({
            method: 'get',
            path: '/version',
        });
    }

    /**
     * GET /health
     */
    public async healthCheck(): Promise<HealthCheckResponse> {
        return this.hubClient.request({
            method: 'get',
            path: '/health',
        });
    }
}
