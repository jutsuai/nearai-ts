// -----------------------------------------------------------------
// 1) /v1/agent/runs or /v1/threads/runs  (both "Run Agent")
// -----------------------------------------------------------------

/**
 * Request body for running an agent (CreateThreadAndRunRequest)
 */
export interface RunAgentRequest {
    agent_id?: string | null;           // "The name or identifier of the agent"
    assistant_id?: string | null;       // alias for agent
    thread_id?: string | null;          // optional
    new_message?: string | null;        // optional
    max_iterations?: number | null;     // default 10
    record_run?: boolean | null;        // default true
    tool_resources?: Record<string, any> | null;
    user_env_vars?: Record<string, any> | null;
    // etc. (Add any other fields from your OpenAPI's CreateThreadAndRunRequest.)
}

/**
 * The OpenAPI says the response is 200 => string.
 * e.g. "Returns the ID of the new thread resulting from the run."
 */
export type RunAgentResponse = string;

// -----------------------------------------------------------------
// 2) /v1/find_agents  (Find Agents)
// -----------------------------------------------------------------

/**
 * POST /v1/find_agents
 * summary: "Find Agents"
 * request => FilterAgentsRequest
 * response => Array<RegistryEntry>
 */
export interface FindAgentsRequest {
    owner_id?: string | null;
    with_capabilities?: boolean | null;      // default false
    latest_versions_only?: boolean | null;   // default true
    limit?: number | null;                  // default 100
    offset?: number | null;                 // default 0
}

/**
 * The response is an array of RegistryEntry
 * as "Response Find Agents V1 Find Agents Post" in OpenAPI
 */
export interface RegistryEntry {
    id: number;
    namespace: string;
    name: string;
    version: string;
    time?: string; // Possibly omitted in the doc snippet
    description?: string;
    category?: string;
    details?: Record<string, any>;
    show_entry?: boolean;
    // ... or whatever fields you want to keep from the "RegistryEntry" type
}
export type FindAgentsResponse = RegistryEntry[];

// -----------------------------------------------------------------
// 3) Agent Data Endpoints
//    - GET /v1/agent_data
//    - POST /v1/agent_data
//    - GET /v1/agent_data/{key}
//    - GET /v1/agent_data_admin/{namespace}/{name}
//    - GET /v1/agent_data_admin/{namespace}/{name}/{key}
// -----------------------------------------------------------------

/**
 * GET /v1/agent_data
 * => returns array of AgentData
 */
export interface AgentData {
    namespace: string;
    name: string;
    key: string;
    value: Record<string, any>;
    created_at?: string;  // date-time
    updated_at?: string;  // date-time
}
export type GetAllAgentDataResponse = AgentData[];

/**
 * POST /v1/agent_data
 * => request body: AgentDataRequest
 * => response body: AgentData
 */
export interface AgentDataRequest {
    key: string;
    value: Record<string, any>;
}
export type SaveAgentDataResponse = AgentData;

/**
 * GET /v1/agent_data/{key}
 * => returns AgentData or null
 */
export type GetAgentDataByKeyResponse = AgentData | null;

/**
 * GET /v1/agent_data_admin/{namespace}/{name}
 * => returns array of AgentData
 */
export type GetAgentDataAdminResponse = AgentData[];

/**
 * GET /v1/agent_data_admin/{namespace}/{name}/{key}
 * => returns AgentData or null
 */
export type GetAgentDataAdminByKeyResponse = AgentData | null;

/**
 * The high-level interface listing the agent methods.
 */
export interface IAgentsClient {
    // POST /v1/agent/runs
    runAgent(req: RunAgentRequest): Promise<RunAgentResponse>;

    // POST /v1/threads/runs
    runAgentOnThread(req: RunAgentRequest): Promise<RunAgentResponse>;

    // POST /v1/find_agents
    findAgents(req: FindAgentsRequest): Promise<FindAgentsResponse>;

    // GET /v1/agent_data
    getAllAgentData(): Promise<GetAllAgentDataResponse>;

    // POST /v1/agent_data
    saveAgentData(req: AgentDataRequest): Promise<SaveAgentDataResponse>;

    // GET /v1/agent_data/{key}
    getAgentDataByKey(key: string): Promise<GetAgentDataByKeyResponse>;

    // GET /v1/agent_data_admin/{namespace}/{name}
    getAgentDataAdmin(
        namespace: string,
        name: string
    ): Promise<GetAgentDataAdminResponse>;

    // GET /v1/agent_data_admin/{namespace}/{name}/{key}
    getAgentDataAdminByKey(
        namespace: string,
        name: string,
        key: string
    ): Promise<GetAgentDataAdminByKeyResponse>;
}