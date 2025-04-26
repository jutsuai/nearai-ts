import { Agent, AgentConfig } from '@jutsuai/nearai-ts-core';
import { promises as fs } from "node:fs";
import { simpleGit, SimpleGit } from 'simple-git';
import path from "node:path";
import fg from "fast-glob";
import os from "node:os";

// @TODO - Switch example repo to nearai-ts when ready (after its set to public)
// const REPO_URL   = "https://github.com/jutsuai/nearai-ts";
const REPO_URL   = "https://github.com/githubtraining/hellogitworld";
const BRANCH     = "main";
const STORE_ID   = `repo:${REPO_URL.split("/").slice(-2).join("/")}@${BRANCH}`;

export default async function myRepoRAGAgent(agent: Agent, config: AgentConfig) {
    const userQuery = await agent.messages().lastUser() || "No user message found.";

    // Try to locate an existing vector store first
    let store = await agent.vectors().find(STORE_ID).catch(() => null);

    if (!store) {
        // --- 1️⃣  Prepare a temporary workspace ---
        const tmpDir = path.join(os.tmpdir(), `repo-rag-${Date.now()}`);
        await cloneOrPull(REPO_URL, tmpDir);

        // --- 2️⃣  Enumerate & upload files ---
        const fileIds: string[] = [];
        for (const rel of await listTextFiles(tmpDir)) {
            const abs = path.join(tmpDir, rel);
            const content = await fs.readFile(abs, "utf-8");

            // Skip empty or huge (>100 kB) blobs in this naïve example
            if (!content.trim() || content.length > 100_000) continue;

            const { id } = await agent
                .files()
                .upload(content, "assistants", "utf-8", rel);
            fileIds.push(id);
        }

        // --- 3️⃣  Build the vector store from all uploaded files ---
        store = await agent.vectors().create(STORE_ID, fileIds);
    }

    // --- 4️⃣  Retrieve context for the user’s question ---
    const hits     = await agent.vectors().query(store.id, userQuery, false);
    const context  = hits.map((h: any) => h.chunk_text).join("\n");

    return await agent
        .system("You are a helpful RAG assistant over the target code repository.")
        .assistant(`Repo context:\n${context}`)
        .user(userQuery)
        .run({ model: "llama-v3p1-70b-instruct" });
}

export async function cloneOrPull(repoUrl: string, workDir: string) {
    const git: SimpleGit = simpleGit({ baseDir: workDir });
    if (!(await fs.stat(workDir).catch(() => false))) {
        await git.clone(repoUrl, workDir);
    } else {
        await git.pull();
    }
}

export async function listTextFiles(root: string): Promise<string[]> {
    // ignore binaries / vendored code
    return fg("**/*.{md,ts,js,jsx,tsx,py,go,rs,java,json}", {
        cwd: root,
        ignore: ["**/node_modules/**", "**/dist/**", "**/.git/**"]
    });
}
