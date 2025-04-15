/**
 * Interfaces for the "evaluation" endpoints,
 * specifically "/v1/evaluation/table".
 */

export interface EvaluationTable {
    rows: Array<Record<string, string>>;
    columns: string[];
    important_columns: string[];
}

/**
 * The client interface for evaluation endpoints.
 */
export interface IEvaluationClient {
    /**
     * GET /v1/evaluation/table
     * Returns an EvaluationTable object.
     */
    getEvaluationTable(): Promise<EvaluationTable>;
}
