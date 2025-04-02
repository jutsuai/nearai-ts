import fetch from "node-fetch";
import FormData from "form-data";
import { getAuth } from "./auth.js";

interface EntryLocation {
    namespace: string;
    name: string;
    version: string;
}

type BumpType = "patch" | "minor" | "major";

export default class Registry {
    private baseUrl: string;

    constructor(opts: { local?: boolean } = {}) {
        this.baseUrl = opts.local
            ? "http://localhost:8081/v1"
            : "https://api.near.ai/v1";
    }

    async updateMetadata(location: EntryLocation, metadata: Record<string, any>): Promise<void> {
        const auth = getAuth();
        const body = {
            entry_location: location,
            metadata,
        };

        const res = await fetch(`${this.baseUrl}/registry/upload_metadata`, {
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
    }

    async uploadFile(location: EntryLocation, relativePath: string, fileBuffer: Buffer): Promise<void> {
        const auth = getAuth();

        const form = new FormData();
        form.append("file", fileBuffer, relativePath);
        form.append("path", relativePath);
        form.append("namespace", location.namespace);
        form.append("name", location.name);
        form.append("version", location.version);

        const res = await fetch(`${this.baseUrl}/registry/upload_file`, {
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
    }

    async versionExists(namespace: string, name: string, version: string): Promise<boolean> {
        const auth = getAuth();
        const body = {
            entry_location: {
                namespace,
                name,
                version
            }
        };

        const res = await fetch(`${this.baseUrl}/registry/download_metadata`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${JSON.stringify(auth)}`
            },
            body: JSON.stringify(body)
        });

        console.log('CHECK RESPONSE:', res.status, res.statusText);

        return res.ok;
    }

    bumpVersion(version: string, type: BumpType): string {
        const parts = version.split(".").map(Number);
        if (parts.length !== 3) throw new Error("Invalid semver");

        switch (type) {
            case "patch":
                parts[2]++;
                break;
            case "minor":
                parts[1]++;
                parts[2] = 0;
                break;
            case "major":
                parts[0]++;
                parts[1] = 0;
                parts[2] = 0;
                break;
        }

        return parts.join(".");
    }
}
