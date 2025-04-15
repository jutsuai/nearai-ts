import OpenAI from 'openai';
import { AgentConfig } from '../../interfaces.js';
import {
    IAgentsClient,
    RunAgentRequest,
    RunAgentResponse,
    FindAgentsRequest,
    FindAgentsResponse,
    AgentDataRequest,
    SaveAgentDataResponse,
    GetAllAgentDataResponse,
    GetAgentDataByKeyResponse,
    GetAgentDataAdminResponse,
    GetAgentDataAdminByKeyResponse,
} from './interfaces/IAgentsClient.js';

export class AgentsClient implements IAgentsClient {
    protected config: AgentConfig;
    protected hubClient: OpenAI;

    constructor(config: AgentConfig, hubClient: OpenAI) {
        this.config = config;
        this.hubClient = hubClient;
    }

    /**
     * POST /v1/agent/runs
     * The request body => RunAgentRequest
     * The response => string (ID of new thread)
     */
    public async runAgent(req: RunAgentRequest): Promise<RunAgentResponse> {
        return this.hubClient.request<RunAgentRequest, RunAgentResponse>({
            method: 'post',
            path: '/v1/agent/runs',
            body: req,
        });
    }

    /**
     * POST /v1/threads/runs
     */
    public async runAgentOnThread(req: RunAgentRequest): Promise<RunAgentResponse> {
        return this.hubClient.request<RunAgentRequest, RunAgentResponse>({
            method: 'post',
            path: '/v1/threads/runs',
            body: req,
        });
    }

    /**
     * POST /v1/find_agents
     */
    public async findAgents(req: FindAgentsRequest): Promise<FindAgentsResponse> {
        return this.hubClient.request<FindAgentsRequest, FindAgentsResponse>({
            method: 'post',
            path: '/v1/find_agents',
            body: req,
        });
    }

    /**
     * GET /v1/agent_data
     */
    public async getAllAgentData(): Promise<GetAllAgentDataResponse> {
        return this.hubClient.request<unknown, GetAllAgentDataResponse>({
            method: 'get',
            path: '/v1/agent_data',
        });
    }

    /**
     * POST /v1/agent_data
     */
    public async saveAgentData(req: AgentDataRequest): Promise<SaveAgentDataResponse> {
        return this.hubClient.request<AgentDataRequest, SaveAgentDataResponse>({
            method: 'post',
            path: '/v1/agent_data',
            body: req,
        });
    }

    /**
     * GET /v1/agent_data/{key}
     */
    public async getAgentDataByKey(key: string): Promise<GetAgentDataByKeyResponse> {
        // The key is in the path
        return this.hubClient.request<unknown, GetAgentDataByKeyResponse>({
            method: 'get',
            path: `/v1/agent_data/${encodeURIComponent(key)}`,
        });
    }

    /**
     * GET /v1/agent_data_admin/{namespace}/{name}
     */
    public async getAgentDataAdmin(
        namespace: string,
        name: string
    ): Promise<GetAgentDataAdminResponse> {
        return this.hubClient.request<unknown, GetAgentDataAdminResponse>({
            method: 'get',
            path: `/v1/agent_data_admin/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`,
        });
    }

    /**
     * GET /v1/agent_data_admin/{namespace}/{name}/{key}
     */
    public async getAgentDataAdminByKey(
        namespace: string,
        name: string,
        key: string
    ): Promise<GetAgentDataAdminByKeyResponse> {
        return this.hubClient.request<unknown, GetAgentDataAdminByKeyResponse>({
            method: 'get',
            path: `/v1/agent_data_admin/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}/${encodeURIComponent(key)}`,
        });
    }
}
