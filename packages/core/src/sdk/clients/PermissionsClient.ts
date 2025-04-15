import OpenAI from 'openai';
import { AgentConfig } from '../../interfaces.js';
import {
    IPermissionsClient,
    GrantPermissionRequest,
    GrantPermissionResponse,
    RevokePermissionRequest,
    RevokePermissionResponse,
} from './interfaces/IPermissionsClient.js';

export class PermissionsClient implements IPermissionsClient {
    protected config: AgentConfig;
    protected hubClient: OpenAI;

    constructor(config: AgentConfig, hubClient: OpenAI) {
        this.config = config;
        this.hubClient = hubClient;
    }

    /**
     * POST /v1/permissions/grant_permission
     *
     * The OpenAPI snippet indicates these are query parameters in the spec,
     * but for simplicity we unify them as a single JSON body to avoid TS errors.
     */
    public async grantPermission(
        req: GrantPermissionRequest
    ): Promise<GrantPermissionResponse> {
        return this.hubClient.request<GrantPermissionRequest, GrantPermissionResponse>({
            method: 'post',
            path: '/v1/permissions/grant_permission',
            body: req,
        });
    }

    /**
     * POST /v1/permissions/revoke_permission
     */
    public async revokePermission(
        req: RevokePermissionRequest
    ): Promise<RevokePermissionResponse> {
        return this.hubClient.request<RevokePermissionRequest, RevokePermissionResponse>({
            method: 'post',
            path: '/v1/permissions/revoke_permission',
            body: req,
        });
    }
}
