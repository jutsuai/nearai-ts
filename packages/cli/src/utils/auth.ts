import fs from "fs";
import path from "path";
import os from "os";

interface AuthConfig {
    auth?: {
        account_id?: string;
        [key: string]: any;
    };
}

export function getAuth(): { token: string; namespace: string } {
    const configPath = path.join(os.homedir(), ".nearai", "config.json");

    if (!fs.existsSync(configPath)) {
        throw new Error("~/.nearai/config.json not found. Please login with `nearai login`.");
    }

    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw);

    const auth = parsed.auth;
    if (!auth || !auth.account_id || !auth.signature) {
        throw new Error("Missing required fields in config.auth (need account_id and signature).");
    }

    return auth;
}

export function getAuthNamespace(): string | null {
    try {
        const configPath = path.join(os.homedir(), ".nearai", "config.json");
        if (!fs.existsSync(configPath)) return null;

        const raw = fs.readFileSync(configPath, "utf-8");
        const parsed: AuthConfig = JSON.parse(raw);

        const accountId = parsed.auth?.account_id;
        if (!accountId || typeof accountId !== "string") return null;

        return accountId; // Use this as the registry "namespace"
    } catch {
        return null;
    }
}
