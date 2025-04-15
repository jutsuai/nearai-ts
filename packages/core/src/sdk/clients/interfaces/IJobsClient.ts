/**
 * Interfaces/types for the "jobs" endpoints from your OpenAPI:
 *   - POST /v1/jobs/add_job
 *   - POST /v1/jobs/get_pending_job
 *   - GET  /v1/jobs/list_jobs
 *   - POST /v1/jobs/update_job
 */

// --------------------------------------------------------------------
// Common types
// --------------------------------------------------------------------

/**
 * WorkerKind => "GPU_8_A100" | "CPU_MEDIUM"
 */
export type WorkerKind = 'GPU_8_A100' | 'CPU_MEDIUM';

/**
 * JobStatus => "pending" | "processing" | "completed"
 * (Add more if your spec has them.)
 */
export type JobStatus = 'pending' | 'processing' | 'completed';

/**
 * This is the shape of a returned Job object in your OpenAPI.
 */
export interface Job {
    id: number;
    registry_path: string;
    account_id: string;
    status: string;       // e.g. "pending", "processing"
    worker_kind: string;  // "CPU_MEDIUM", "GPU_8_A100", etc.
    info: Record<string, any>;
    result: Record<string, any>;
    worker_id: string | null;
}

/**
 * A specialized shape returned by "get_pending_job"
 */
export interface SelectedJob {
    selected: boolean;
    job: Job | null;
    registry_path: string;
    info: string;
}

/**
 * For `GET /v1/jobs/list_jobs`, we return an array of `Job`.
 */
export type ListJobsResponse = Job[];

/**
 * Possibly your OpenAPI has something like:
 * {
 *   "type":"object",
 *   "required":["namespace","name","version"],
 *   ...
 * }
 */
export interface JobEntryLocation {
    namespace: string;
    name: string;
    version: string;
}

// --------------------------------------------------------------------
// 1) POST /v1/jobs/add_job
//    If your code is putting both worker_kind + entry_location in the body
//    Then define them as one object:
// --------------------------------------------------------------------
export interface AddJobRequest {
    worker_kind: WorkerKind;
    entry_location: JobEntryLocation;
}
export type AddJobResponse = Job;

// --------------------------------------------------------------------
// 2) POST /v1/jobs/get_pending_job
//    If your code is also placing everything in the body, do so here too
// --------------------------------------------------------------------
export interface GetPendingJobRequest {
    worker_id: string;
    worker_kind: WorkerKind;
}
export type GetPendingJobResponse = SelectedJob;

// --------------------------------------------------------------------
// 3) GET /v1/jobs/list_jobs
//    If your code is placing them as query params, or maybe the body is empty
//    But if you're also putting them in the body for consistency, do that
//    Or keep it as a query param if your backend truly needs it that way
// --------------------------------------------------------------------
export interface ListJobsRequest {
    account_id: string | null;
    status: JobStatus | null;
}

// --------------------------------------------------------------------
// 4) POST /v1/jobs/update_job
// --------------------------------------------------------------------
export interface UpdateJobRequest {
    job_id: number;
    status: JobStatus;
    result_json?: string; // optional
}
export type UpdateJobResponse = Record<string, unknown>; // typically {}

// --------------------------------------------------------------------
// The high-level client interface
// --------------------------------------------------------------------
export interface IJobsClient {
    addJob(req: AddJobRequest): Promise<AddJobResponse>;

    getPendingJob(req: GetPendingJobRequest): Promise<GetPendingJobResponse>;

    listJobs(req: ListJobsRequest): Promise<ListJobsResponse>;

    updateJob(req: UpdateJobRequest): Promise<UpdateJobResponse>;
}
