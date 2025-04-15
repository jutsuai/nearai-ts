import OpenAI from 'openai';
import { AgentConfig } from '../../interfaces.js';
import { IEvaluationClient, EvaluationTable } from './interfaces/IEvaluationClient.js';

export class EvaluationClient implements IEvaluationClient {
    protected config: AgentConfig;
    protected hubClient: OpenAI;

    constructor(config: AgentConfig, hubClient: OpenAI) {
        this.config = config;
        this.hubClient = hubClient;
    }

    /**
     * GET /v1/evaluation/table
     */
    public async getEvaluationTable(): Promise<EvaluationTable> {
        return this.hubClient.request<unknown, EvaluationTable>({
            method: 'get',
            path: '/v1/evaluation/table',
        });
    }
}
