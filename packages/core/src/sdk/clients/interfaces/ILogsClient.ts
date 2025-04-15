/**
 * Interfaces for the "logs" endpoints:
 *   - POST /v1/logs/add_log
 *   - GET  /v1/logs/get_logs
 *
 * For example:
 *   POST /v1/logs/add_log
 *     body => { target: string, info: object }
 *     response => Log
 *
 *   GET /v1/logs/get_logs
 *     query => { target: string, after_id: number, limit: number }
 *     response => Log[]
 */

// "Log" object from your OpenAPI
export interface Log {
    id?: number;
    account_id: string;
    target: string;
    info: Record<string, any>;
}

/**
 * For "addLog", we unify everything into the body.
 */
export interface AddLogRequest {
    target: string;
    info: Record<string, any>;
}
export type AddLogResponse = Log;

/**
 * For "getLogs", we can keep them in one request object,
 * but we'll see how to handle it in LogsClient.
 */
export interface GetLogsRequest {
    target: string;
    after_id: number;
    limit: number;
}
export type GetLogsResponse = Log[];

/**
 * The logs client interface
 */
export interface ILogsClient {
    addLog(req: AddLogRequest): Promise<AddLogResponse>;
    getLogs(req: GetLogsRequest): Promise<GetLogsResponse>;
}
