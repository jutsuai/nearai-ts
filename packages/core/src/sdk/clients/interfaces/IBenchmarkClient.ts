// 1) /v1/benchmark/create
//    query: { benchmark_name, solver_name, solver_args }
//    response: number (ID of the created benchmark)
//
export interface CreateBenchmarkQuery {
    benchmark_name: string;
    solver_name: string;
    solver_args: string;
}
export type CreateBenchmarkResponse = number; // or -1 or any int

//
// 2) /v1/benchmark/get
//    query: { namespace, benchmark_name, solver_name, solver_args }
//    response: number (ID of the benchmark), or -1 if not found
//
export interface GetBenchmarkQuery {
    namespace: string;
    benchmark_name: string;
    solver_name: string;
    solver_args: string;
}
export type GetBenchmarkResponse = number;

//
// 3) /v1/benchmark/list
//    query: { namespace, benchmark_name, solver_name, solver_args, total=32, offset=0 }
//    response: array of BenchmarkOutput
//
export interface ListBenchmarksQuery {
    namespace?: string | null;
    benchmark_name?: string | null;
    solver_name?: string | null;
    solver_args?: string | null;
    total?: number;  // default 32
    offset?: number; // default 0
}
export interface BenchmarkOutput {
    id: number;
    namespace: string;
    benchmark: string;
    solver: string;
    args: string;
    solved: number;
    total: number;
}
export type ListBenchmarksResponse = BenchmarkOutput[];

//
// 4) /v1/benchmark/add_result
//    query: { benchmark_id, index, solved, info }
//    response: empty object or unknown
//
export interface AddBenchmarkResultQuery {
    benchmark_id: number;
    index: number;
    solved: boolean;
    info: string;
}
export type AddBenchmarkResultResponse = Record<string, unknown>; // or {}

//
// 5) /v1/benchmark/get_result
//    query: { benchmark_id }
//    response => array of BenchmarkResultOutput
//
export interface GetBenchmarkResultQuery {
    benchmark_id: number;
}
export interface BenchmarkResultOutput {
    index: number;
    solved: boolean;
    info: string;
}
export type GetBenchmarkResultResponse = BenchmarkResultOutput[];

//
// Bring it all together in an interface for the client:
//
export interface IBenchmarkClient {
    createBenchmark(
        query: CreateBenchmarkQuery
    ): Promise<CreateBenchmarkResponse>;

    getBenchmark(
        query: GetBenchmarkQuery
    ): Promise<GetBenchmarkResponse>;

    listBenchmarks(
        query: ListBenchmarksQuery
    ): Promise<ListBenchmarksResponse>;

    addBenchmarkResult(
        query: AddBenchmarkResultQuery
    ): Promise<AddBenchmarkResultResponse>;

    getBenchmarkResult(
        query: GetBenchmarkResultQuery
    ): Promise<GetBenchmarkResultResponse>;
}
