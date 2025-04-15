import OpenAI from 'openai';
import { AgentConfig } from '../../interfaces.js';
import {
    IJobsClient,
    AddJobRequest,
    AddJobResponse,
    GetPendingJobRequest,
    GetPendingJobResponse,
    ListJobsRequest,
    ListJobsResponse,
    UpdateJobRequest,
    UpdateJobResponse,
} from './interfaces/IJobsClient.js';

export class JobsClient implements IJobsClient {
    protected config: AgentConfig;
    protected hubClient: OpenAI;

    constructor(config: AgentConfig, hubClient: OpenAI) {
        this.config = config;
        this.hubClient = hubClient;
    }

    /**
     * POST /v1/jobs/add_job
     *
     * If your actual backend expects `worker_kind` in query,
     * and `entry_location` in the body, but your local usage
     * lumps them both into `AddJobRequest`, you can just
     * pass everything in the body.
     *
     * Or if your real server strictly needs them separated,
     * you'd do something like:
     *
     *   query: { worker_kind: req.worker_kind }
     *   body:  { entry_location: req.entry_location }
     *
     * but that might conflict with how your TypeScript is set up.
     */
    public async addJob(req: AddJobRequest): Promise<AddJobResponse> {
        // Easiest approach: everything in the body, no query:
        return this.hubClient.request<AddJobRequest, AddJobResponse>({
            method: 'post',
            path: '/v1/jobs/add_job',
            body: req,
        });
    }

    /**
     * POST /v1/jobs/get_pending_job
     */
    public async getPendingJob(
        req: GetPendingJobRequest
    ): Promise<GetPendingJobResponse> {
        return this.hubClient.request<GetPendingJobRequest, GetPendingJobResponse>({
            method: 'post',
            path: '/v1/jobs/get_pending_job',
            body: req,
        });
    }

    /**
     * GET /v1/jobs/list_jobs
     *
     * If your server truly uses query params, you can do:
     *   method: 'get', query: { ... }
     * But if your code lumps it all into the body, do that:
     */
    public async listJobs(req: ListJobsRequest): Promise<ListJobsResponse> {
        // Possibly you'd do a GET with query:
        // return this.hubClient.request<unknown, ListJobsResponse>({
        //   method: 'get',
        //   path: '/v1/jobs/list_jobs',
        //   query: req,
        // });

        // But if your code lumps them in the body with a POST:
        // (some users do this for convenience)
        return this.hubClient.request<ListJobsRequest, ListJobsResponse>({
            method: 'post',
            path: '/v1/jobs/list_jobs',
            body: req,
        });
    }

    /**
     * POST /v1/jobs/update_job
     */
    public async updateJob(
        req: UpdateJobRequest
    ): Promise<UpdateJobResponse> {
        return this.hubClient.request<UpdateJobRequest, UpdateJobResponse>({
            method: 'post',
            path: '/v1/jobs/update_job',
            body: req,
        });
    }
}
