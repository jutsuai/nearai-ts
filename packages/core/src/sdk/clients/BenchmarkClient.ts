import OpenAI from 'openai';
import { AgentConfig } from '../../interfaces.js';
import {
    IBenchmarkClient,
    CreateBenchmarkQuery,
    CreateBenchmarkResponse,
    GetBenchmarkQuery,
    GetBenchmarkResponse,
    ListBenchmarksQuery,
    ListBenchmarksResponse,
    AddBenchmarkResultQuery,
    AddBenchmarkResultResponse,
    GetBenchmarkResultQuery,
    GetBenchmarkResultResponse,
} from './interfaces/IBenchmarkClient.js';

export class BenchmarkClient implements IBenchmarkClient {
    protected config: AgentConfig;
    protected hubClient: OpenAI;

    constructor(config: AgentConfig, hubClient: OpenAI) {
        this.config = config;
        this.hubClient = hubClient;
    }

    /**
     * GET /v1/benchmark/create
     */
    public async createBenchmark(
        query: CreateBenchmarkQuery
    ): Promise<CreateBenchmarkResponse> {
        return this.hubClient.request<unknown, CreateBenchmarkResponse>({
            method: 'get',
            path: '/v1/benchmark/create',
            query,
        });
    }

    /**
     * GET /v1/benchmark/get
     */
    public async getBenchmark(
        query: GetBenchmarkQuery
    ): Promise<GetBenchmarkResponse> {
        return this.hubClient.request<unknown, GetBenchmarkResponse>({
            method: 'get',
            path: '/v1/benchmark/get',
            query,
        });
    }

    /**
     * GET /v1/benchmark/list
     */
    public async listBenchmarks(
        query: ListBenchmarksQuery
    ): Promise<ListBenchmarksResponse> {
        return this.hubClient.request<unknown, ListBenchmarksResponse>({
            method: 'get',
            path: '/v1/benchmark/list',
            query,
        });
    }

    /**
     * GET /v1/benchmark/add_result
     */
    public async addBenchmarkResult(
        query: AddBenchmarkResultQuery
    ): Promise<AddBenchmarkResultResponse> {
        return this.hubClient.request<unknown, AddBenchmarkResultResponse>({
            method: 'get',
            path: '/v1/benchmark/add_result',
            query,
        });
    }

    /**
     * GET /v1/benchmark/get_result
     */
    public async getBenchmarkResult(
        query: GetBenchmarkResultQuery
    ): Promise<GetBenchmarkResultResponse> {
        return this.hubClient.request<unknown, GetBenchmarkResultResponse>({
            method: 'get',
            path: '/v1/benchmark/get_result',
            query,
        });
    }
}
