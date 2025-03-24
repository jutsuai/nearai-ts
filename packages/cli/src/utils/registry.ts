import fetch from "node-fetch";
import FormData from "form-data";
import { getAuth } from "./auth.js";

const BASE_URL = "https://api.near.ai/v1";

export const registry = {
    updateMetadata: async (
        location: { namespace: string; name: string; version: string },
        metadata: Record<string, any>
    ): Promise<void> => {
        const { token } = getAuth();
        const body = {
            entry_location: location,
            metadata: metadata,
        };

        const res = await fetch(`${BASE_URL}/registry/upload/metadata`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(
                `Failed to upload metadata: ${res.status} ${res.statusText} - ${errText}`
            );
        }
    },

    uploadFile: async (
        location: { namespace: string; name: string; version: string },
        relativePath: string,
        fileBuffer: Buffer
    ): Promise<void> => {
        const { token } = getAuth();

        const form = new FormData();
        form.append("file", fileBuffer, relativePath);
        form.append("path", relativePath);
        form.append("namespace", location.namespace);
        form.append("name", location.name);
        form.append("version", location.version);

        const res = await fetch(`${BASE_URL}/registry/upload/file`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: form,
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(
                `Failed to upload file '${relativePath}': ${res.status} ${res.statusText} - ${errText}`
            );
        }
    },
};
