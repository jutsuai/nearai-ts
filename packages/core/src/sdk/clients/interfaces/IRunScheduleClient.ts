/**
 * Interfaces for the "Run Schedule" endpoint:
 *   - POST /v1/schedule_run
 */

export interface ScheduleRunRequest {
    agent: string;
    input_message: string;
    run_params: Record<string, string>;
    thread_id: string | null;
    run_at: string; // date-time
}

export type ScheduleRunResponse = Record<string, unknown>;

/**
 * Single-method interface for scheduling a run
 */
export interface IRunScheduleClient {
    /**
     * POST /v1/schedule_run
     */
    scheduleRun(req: ScheduleRunRequest): Promise<ScheduleRunResponse>;
}
