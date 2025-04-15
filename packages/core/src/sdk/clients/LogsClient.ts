import OpenAI from 'openai';
import { AgentConfig } from '../../interfaces.js';
import {
    ILogsClient,
    AddLogRequest,
    AddLogResponse,
    GetLogsRequest,
    GetLogsResponse,
} from './interfaces/ILogsClient.js';

/**
 * A private interface describing the actual JSON body for addLog:
 * The server expects { info: ... } in the request body,
 * while `target` goes in the query param.
 */
interface AddLogBody {
    info: Record<string, any>;
}

export class LogsClient implements ILogsClient {
    protected config: AgentConfig;
    protected hubClient: OpenAI;

    constructor(config: AgentConfig, hubClient: OpenAI) {
        this.config = config;
        this.hubClient = hubClient;
    }

    /**
     * POST /v1/logs/add_log
     *
     * Your OpenAPI says:
     *   - query => { target: string }
     *   - body => { info: object }
     *
     * We unify them into one user-facing request (AddLogRequest),
     * then destructure `target` (goes to query) + `info` (goes to body).
     */
    public async addLog(req: AddLogRequest): Promise<AddLogResponse> {
        // The simplest fix: send everything in the JSON body:
        return this.hubClient.request<AddLogRequest, AddLogResponse>({
            method: 'post',
            path: '/v1/logs/add_log',
            body: req,
        });
    }


    /**
     * GET /v1/logs/get_logs
     *   query => { target, after_id, limit }
     *   returns => array of Log
     */
    public async getLogs(req: GetLogsRequest): Promise<GetLogsResponse> {
        const { target, after_id, limit } = req;

        return this.hubClient.request<unknown, GetLogsResponse>({
            method: 'get',
            path: '/v1/logs/get_logs',
            query: {
                target,
                after_id,
                limit,
            },
        });
    }
}
