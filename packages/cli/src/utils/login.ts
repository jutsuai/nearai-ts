import fs from "fs/promises";
import http from "http";
import path from "path";
import os from "os";
import open from "open";
import { v4 as uuidv4 } from "uuid";
import { KeyPair } from "near-api-js";
import { Logger } from "./logger.js";

const NEAR_CREDENTIALS_DIR = path.join(os.homedir(), ".near-credentials");
const CONFIG_PATH = path.join(os.homedir(), ".nearai", "config.json");
const CONFIG_DIR = path.join(os.homedir(), ".nearai");

export async function loginWithPrivateKey(accountId: any, privateKey: any) {
    const nonce = uuidv4();
    const keyPair = KeyPair.fromString(privateKey);
    const message = Buffer.from(nonce);
    const signature = keyPair.sign(message).signature;
    const publicKey = keyPair.getPublicKey().toString();

    await saveAuthConfig({
        account_id: accountId,
        signature: Buffer.from(signature).toString("base64"),
        public_key: publicKey,
        callback_url: "cli",
        nonce,
    });

    Logger.success(`Logged in as ${accountId}`);
}

export async function loginWithFileCredentials(accountId: any) {
    const credPath = path.join(NEAR_CREDENTIALS_DIR, `mainnet/${accountId}.json`);
    try {
        const raw = await fs.readFile(credPath, "utf-8");
        const json = JSON.parse(raw);
        const privateKey = json.private_key || json.privateKey;
        if (!privateKey) throw new Error("Missing private key in credentials file");
        await loginWithPrivateKey(accountId, privateKey);
    } catch (err: any) {
        Logger.error(`Failed to load credentials for ${accountId}: ${err?.message}`);
        process.exit(1);
    }
}

export async function loginWithRemote(authUrl = "https://auth.near.ai") {
    const nonce = String(Date.now());
    const message = "Welcome to NEAR AI";
    const recipient = "ai.near";

    const port = await getOpenPort();
    const callbackUrl = `http://localhost:${port}/capture`;

    const url = new URL(authUrl);
    url.searchParams.set("message", message);
    url.searchParams.set("nonce", nonce);
    url.searchParams.set("recipient", recipient);
    url.searchParams.set("callbackUrl", callbackUrl);

    Logger.info("Launching auth portal...");
    await open(url.toString());

    Logger.info("Waiting for authentication...");

    const server = http.createServer(async (req: any, res: any) => {
        if (!req.url) return;

        const urlObj = new URL(req.url, `http://localhost:${port}`);
        const pathname = urlObj.pathname;
        const params = urlObj.searchParams;

        if (pathname === "/auth") {
            const account_id = params.get("accountId");
            const signature = params.get("signature");
            const public_key = params.get("publicKey");

            if (account_id && signature && public_key) {
                await saveAuthConfig({
                    account_id,
                    signature,
                    public_key,
                    callback_url: callbackUrl,
                    nonce,
                    message,
                    on_behalf_of: null
                });

                Logger.success(`✅ Logged in as ${account_id}`);
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(`<h2>Login successful. You can close this window.</h2>`);
            } else {
                res.writeHead(400, { "Content-Type": "text/html" });
                res.end(`<h2>Missing required parameters. Login failed.</h2>`);
            }

            setTimeout(() => server.close(), 2000);
        } else if (pathname === "/capture") {
            const html = `
                <html>
                  <body>
                    <script>
                      const params = new URLSearchParams(window.location.hash.slice(1));
                      window.location.href = "/auth?" + params.toString();
                    </script>
                  </body>
                </html>`;
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html);
        } else {
            res.writeHead(404);
            res.end();
        }
    });

    server.listen(port);
}

export async function saveAuthConfig(authData: {
    account_id: string;
    signature: string;
    public_key: string;
    callback_url: string;
    nonce: string;
    message?: string;
    on_behalf_of?: null;
}) {
    const config = {
        auth: authData,
    };
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

async function getOpenPort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = http.createServer();
        server.listen(0, () => {
            const addr = server.address();
            if (typeof addr === "object" && addr?.port) {
                const port = addr.port;
                server.close(() => resolve(port));
            } else {
                reject(new Error("Unable to get open port"));
            }
        });
    });
}
