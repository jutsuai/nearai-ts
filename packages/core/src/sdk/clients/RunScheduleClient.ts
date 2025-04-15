import OpenAI from 'openai';
import { AgentConfig } from '../../interfaces.js';
import {
    IRunScheduleClient,
    ScheduleRunRequest,
    ScheduleRunResponse,
} from './interfaces/IRunScheduleClient.js';

export class RunScheduleClient implements IRunScheduleClient {
    protected config: AgentConfig;
    protected hubClient: OpenAI;

    constructor(config: AgentConfig, hubClient: OpenAI) {
        this.config = config;
        this.hubClient = hubClient;
    }

    /**
     * POST /v1/schedule_run
     * The request is a JSON body with all fields from `CreateScheduleRunRequest`.
     * The response is an empty object.
     */
    public async scheduleRun(
        req: ScheduleRunRequest
    ): Promise<ScheduleRunResponse> {
        return this.hubClient.request<ScheduleRunRequest, ScheduleRunResponse>({
            method: 'post',
            path: '/v1/schedule_run',
            body: req,
        });
    }
}
