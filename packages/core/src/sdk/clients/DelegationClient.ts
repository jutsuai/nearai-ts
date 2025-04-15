import OpenAI from 'openai';
import { AgentConfig } from '../../interfaces.js';
import {
    IDelegationClient,
    DelegateQuery,
    DelegateResponse,
    ListDelegationsResponse,
    RevokeDelegationQuery,
    RevokeDelegationResponse,
} from './interfaces/IDelegationClient.js';

export class DelegationClient implements IDelegationClient {
    protected config: AgentConfig;
    protected hubClient: OpenAI;

    constructor(config: AgentConfig, hubClient: OpenAI) {
        this.config = config;
        this.hubClient = hubClient;
    }

    /**
     * POST /v1/delegation/delegate
     */
    public async delegate(
        query: DelegateQuery
    ): Promise<DelegateResponse> {
        return this.hubClient.request<unknown, DelegateResponse>({
            method: 'post',
            path: '/v1/delegation/delegate',
            query,
        });
    }

    /**
     * POST /v1/delegation/list_delegations
     */
    public async listDelegations(): Promise<ListDelegationsResponse> {
        // No query, no body
        return this.hubClient.request<unknown, ListDelegationsResponse>({
            method: 'post',
            path: '/v1/delegation/list_delegations',
        });
    }

    /**
     * POST /v1/delegation/revoke_delegation
     */
    public async revokeDelegation(
        query: RevokeDelegationQuery
    ): Promise<RevokeDelegationResponse> {
        return this.hubClient.request<unknown, RevokeDelegationResponse>({
            method: 'post',
            path: '/v1/delegation/revoke_delegation',
            query,
        });
    }
}
