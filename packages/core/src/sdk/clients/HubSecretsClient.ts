import OpenAI from 'openai';
import { AgentConfig } from '../../interfaces.js';
import {
    IHubSecretsClient,
    CreateHubSecretRequest,
    CreateHubSecretResponse,
    RemoveHubSecretRequest,
    RemoveHubSecretResponse,
    GetUserSecretsQuery,
    GetUserSecretsResponse,
} from './interfaces/IHubSecretsClient.js';

export class HubSecretsClient implements IHubSecretsClient {
    protected config: AgentConfig;
    protected hubClient: OpenAI;

    constructor(config: AgentConfig, hubClient: OpenAI) {
        this.config = config;
        this.hubClient = hubClient;
    }

    /**
     * POST /v1/create_hub_secret
     */
    public async createHubSecret(
        req: CreateHubSecretRequest
    ): Promise<CreateHubSecretResponse> {
        return this.hubClient.request<CreateHubSecretRequest, CreateHubSecretResponse>({
            method: 'post',
            path: '/v1/create_hub_secret',
            body: req,
        });
    }

    /**
     * POST /v1/remove_hub_secret
     */
    public async removeHubSecret(
        req: RemoveHubSecretRequest
    ): Promise<RemoveHubSecretResponse> {
        return this.hubClient.request<RemoveHubSecretRequest, RemoveHubSecretResponse>({
            method: 'post',
            path: '/v1/remove_hub_secret',
            body: req,
        });
    }

    /**
     * GET /v1/get_user_secrets
     */
    public async getUserSecrets(
        query?: GetUserSecretsQuery
    ): Promise<GetUserSecretsResponse> {
        return this.hubClient.request<unknown, GetUserSecretsResponse>({
            method: 'get',
            path: '/v1/get_user_secrets',
            query,
        });
    }
}
