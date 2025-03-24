import fetch from "node-fetch";
import FormData from "form-data";
import { getAuth } from "./auth.js";

const BASE_URL = "https://api.near.ai/v1";

export const registry = {
    updateMetadata: async (
        location: { namespace: string; name: string; version: string },
        metadata: Record<string, any>
    ): Promise<void> => {
        const auth = getAuth();
        const body = {
            entry_location: location,
            metadata: metadata,
        };

        const res = await fetch(`${BASE_URL}/registry/upload_metadata`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${JSON.stringify(auth)}`,
            },
            body: JSON.stringify(body),
        });

        if (res.status === 404) {
            throw new Error(
                `Registry entry not found: '${location.namespace}/${location.name}/${location.version}' — You must create it before uploading metadata.`
            );
        }

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
        const auth = getAuth();

        const form = new FormData();
        form.append("file", fileBuffer, relativePath);
        form.append("path", relativePath);
        form.append("namespace", location.namespace);
        form.append("name", location.name);
        form.append("version", location.version);

        const res = await fetch(`${BASE_URL}/registry/upload_file`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${JSON.stringify(auth)}`,
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
