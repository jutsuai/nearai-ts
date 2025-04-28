import { Agent, AgentConfig } from '@jutsuai/nearai-ts-core';
import { promises as fs } from "node:fs";
import { exec } from "node:child_process";
import { promisify } from "node:util";
const sh = promisify(exec)
import path from "node:path";
import os from "node:os";

// @TODO - Switch example repo to nearai-ts when ready (after its set to public)
const REPO_URL   = "https://github.com/jutsuai/nearai-ts";
// const REPO_URL   = "https://github.com/githubtraining/hellogitworld";
const BRANCH     = "main";
const STORE_ID   = `repo:${REPO_URL.split("/").slice(-2).join("/")}@${BRANCH}`;
const TEXT_EXT = /\.(md|ts|js|jsx|tsx|py|go|rs|java|json)$/i;
const IGNORE   = /(^|\/)(node_modules|dist|\.git)(\/|$)/;

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

    // ---------- Better RAG prompt ----------
    const SYSTEM_PROMPT = `
    You are **RepoGPT**, a senior full-stack engineer acting as the team’s
    AI pair-programmer for the target Git repository.
    
    ╭─── Operating Rules ─────────────────────────────────────────────╮
    │ 1. Use ONLY the information found in <<REPO_CONTEXT>>           │
    │    unless general language-level knowledge is absolutely needed.│
    │ 2. If the context is missing critical details, ask a follow-up. │
    │ 3. Quote code inside triple-fenced blocks and include the        │
    │    relative file path (and line numbers when helpful).          │
    │ 4. When suggesting edits, output a **unified diff** or a        │
    │    full replacement snippet that can be copy-pasted.            │
    │ 5. Keep answers concise, actionable, and free of marketing hype.│
    ╰─────────────────────────────────────────────────────────────────╯
    
    After thinking step-by-step, answer in **this format**:
    
    **Answer**  
    <direct reply to the user’s question>
    
    **Relevant Snippets**  
    - \`path/to/file.ext:⟨start-line⟩-⟨end-line⟩\`  
    \`\`\`<language>  
    <quoted lines>  
    \`\`\`
    
    (Repeat the bullet for each snippet. Omit this section if none are needed.)
    `;

    return await agent
        .system(SYSTEM_PROMPT)
        .assistant(`<<REPO_CONTEXT>>\n${context}`)
        .user(userQuery)
        .run({ model: "llama-v3p1-70b-instruct" });
}

export async function cloneOrPull(repoUrl: string, workDir: string) {
    // fresh clone
    if (!(await fs.stat(workDir).catch(() => false))) {
        await sh(`git clone --depth 1 ${repoUrl} "${workDir}"`);
        return;
    }
    // fast-forward pull
    await sh(`git -C "${workDir}" pull --ff-only`);
}

export async function listTextFiles(root: string): Promise<string[]> {
    const out: string[] = [];
    async function walk(dir: string) {
        for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
            const abspath = path.join(dir, entry.name);
            const relpath = path.relative(root, abspath);

            if (IGNORE.test(relpath)) continue;

            if (entry.isDirectory()) {
                await walk(abspath);
            } else if (TEXT_EXT.test(entry.name)) {
                out.push(relpath);
            }
        }
    }
    await walk(root);
    return out;
}
