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
     * POST /v1/completions
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
            path: '/v1/completions',
            body: data,
        });
    }

    /**
     * POST /v1/chat/completions
     */
    public async createChatCompletions(
        data: AnyCompletionsBody
    ): Promise<CompletionsResponse> {
        return this.hubClient.request({
            method: 'post',
            path: '/v1/chat/completions',
            body: data,
        });
    }

    /**
     * GET /v1/models
     */
    public async listModels(): Promise<unknown> {
        return this.hubClient.request({
            method: 'get',
            path: '/v1/models',
        });
    }

    /**
     * POST /v1/embeddings
     */
    public async createEmbeddings(
        data: EmbeddingsRequest
    ): Promise<CompletionsResponse> {
        return this.hubClient.request({
            method: 'post',
            path: '/v1/embeddings',
            body: data,
        });
    }

    /**
     * POST /v1/images/generations
     */
    public async createImages(
        data: ImageGenerationRequest
    ): Promise<CompletionsResponse> {
        return this.hubClient.request({
            method: 'post',
            path: '/v1/images/generations',
            body: data,
        });
    }

    // -------------------------------------------------
    // NEAR.AI-specific endpoints not in standard openai
    // -------------------------------------------------

    /**
     * POST /v1/get_agent_public_key
     * According to your OpenAPI, `agent_name` is in `parameters` with `in:"query"`.
     */
    public async getAgentPublicKey(
        params: GetAgentPublicKeyParams
    ): Promise<GetAgentPublicKeyResponse> {
        // Notice we put agent_name in `query`, not in body.
        return this.hubClient.request({
            method: 'post',
            path: '/v1/get_agent_public_key',
            query: {
                agent_name: params.agent_name,
            },
        });
    }

    /**
     * POST /v1/nonce/revoke
     */
    public async revokeNonce(data: RevokeNonceRequest): Promise<RevokeNonceResponse> {
        return this.hubClient.request({
            method: 'post',
            path: '/v1/nonce/revoke',
            body: data,
        });
    }

    /**
     * POST /v1/nonce/revoke/all
     */
    public async revokeAllNonces(): Promise<RevokeAllNoncesResponse> {
        return this.hubClient.request({
            method: 'post',
            path: '/v1/nonce/revoke/all',
        });
    }

    /**
     * GET /v1/nonce/list
     */
    public async listNonces(): Promise<ListNoncesResponse> {
        return this.hubClient.request({
            method: 'get',
            path: '/v1/nonce/list',
        });
    }

    /**
     * GET /v1/version
     * The OpenAPI says it returns a string
     */
    public async getVersion(): Promise<GetVersionResponse> {
        return this.hubClient.request({
            method: 'get',
            path: '/v1/version',
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
