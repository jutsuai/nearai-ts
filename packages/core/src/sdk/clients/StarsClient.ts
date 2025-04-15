import OpenAI from 'openai';
import { AgentConfig } from '../../interfaces.js';
import {
    IStarsClient,
    AddStarRequest,
    AddStarResponse,
    RemoveStarRequest,
    RemoveStarResponse,
} from './interfaces/IStarsClient.js';

export class StarsClient implements IStarsClient {
    protected config: AgentConfig;
    protected hubClient: OpenAI;

    constructor(config: AgentConfig, hubClient: OpenAI) {
        this.config = config;
        this.hubClient = hubClient;
    }

    /**
     * POST /v1/stars/add_star
     *
     * The OpenAPI says requestBody is form-data with { namespace, name }.
     * For simplicity, we pass a JSON body (AddStarRequest).
     * If your backend truly needs x-www-form-urlencoded, handle that separately.
     */
    public async addStar(req: AddStarRequest): Promise<AddStarResponse> {
        return this.hubClient.request<AddStarRequest, AddStarResponse>({
            method: 'post',
            path: '/v1/stars/add_star',
            body: req,
        });
    }

    /**
     * POST /v1/stars/remove_star
     */
    public async removeStar(req: RemoveStarRequest): Promise<RemoveStarResponse> {
        return this.hubClient.request<RemoveStarRequest, RemoveStarResponse>({
            method: 'post',
            path: '/v1/stars/remove_star',
            body: req,
        });
    }
}
